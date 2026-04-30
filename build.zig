const std = @import("std");

pub fn build(b: *std.Build) !void {
    // Pin glibc 2.17 so Zig uses its bundled crt1.o instead of the system's.
    // GCC 15's crt1.o has .sframe sections with R_X86_64_PC64 relocations that
    // Zig's self-hosted linker doesn't support yet.
    const target = b.standardTargetOptions(.{
        .default_target = .{ .glibc_version = .{ .major = 2, .minor = 17, .patch = 0 } },
    });
    const optimize = b.standardOptimizeOption(.{});

    const shared = b.option(bool, "build-shared", "Build a shared library") orelse true;
    const reuse_alloc = b.option(bool, "reuse-allocator", "Reuse the library allocator") orelse false;

    const library_name = "tree-sitter-zig";

    const lib: *std.Build.Step.Compile = b.addLibrary(.{
        .name = library_name,
        .linkage = if (shared) .dynamic else .static,
        .root_module = b.createModule(.{
            .target = target,
            .optimize = optimize,
            .link_libc = true,
            .pic = if (shared) true else null,
        }),
    });

    lib.root_module.addCSourceFile(.{
        .file = b.path("src/parser.c"),
        .flags = &.{"-std=c11"},
    });
    if (fileExists(b, "src/scanner.c")) {
        lib.root_module.addCSourceFile(.{
            .file = b.path("src/scanner.c"),
            .flags = &.{"-std=c11"},
        });
    }

    if (reuse_alloc) {
        lib.root_module.addCMacro("TREE_SITTER_REUSE_ALLOCATOR", "");
    }
    if (optimize == .Debug) {
        lib.root_module.addCMacro("TREE_SITTER_DEBUG", "");
    }

    lib.root_module.addIncludePath(b.path("src"));

    b.installArtifact(lib);
    b.installFile("src/node-types.json", "node-types.json");

    if (fileExists(b, "queries")) {
        b.installDirectory(.{
            .source_dir = b.path("queries"),
            .install_dir = .prefix,
            .install_subdir = "queries",
            .include_extensions = &.{"scm"},
        });
    }

    const module = b.addModule(library_name, .{
        .root_source_file = b.path("bindings/zig/root.zig"),
        .target = target,
        .optimize = optimize,
    });
    module.linkLibrary(lib);

    const tests = b.addTest(.{
        .root_module = b.createModule(.{
            .root_source_file = b.path("bindings/zig/test.zig"),
            .target = target,
            .optimize = optimize,
        }),
    });
    tests.root_module.addImport(library_name, module);

    if (isStepRequested(b, "test")) {
        if (b.lazyDependency("tree_sitter", .{})) |ts_dep| {
            tests.root_module.addImport("tree-sitter", ts_dep.module("tree_sitter"));
        }
    }

    const run_tests = b.addRunArtifact(tests);

    const test_step = b.step("test", "Run unit tests");
    test_step.dependOn(&run_tests.step);
}

inline fn fileExists(b: *std.Build, filename: []const u8) bool {
    const dir = b.build_root.handle;
    dir.access(b.graph.io, filename, .{}) catch return false;
    return true;
}

// lazyDependency must be called during build() (config phase), not in a step's make().
// Zig 0.16 removed std.process.argsWithAllocator and provides no build API for querying
// which steps were requested, so we read process args directly per platform.
fn isStepRequested(b: *std.Build, step_name: []const u8) bool {
    if (b.pkg_hash.len != 0) return false; // skip when built as a dependency
    const builtin = @import("builtin");
    if (comptime builtin.os.tag == .linux) {
        return isStepRequestedLinux(b, step_name);
    } else if (comptime builtin.os.tag.isDarwin()) {
        return isStepRequestedDarwin(step_name);
    } else if (comptime builtin.os.tag == .windows) {
        return isStepRequestedWindows(b, step_name);
    } else {
        return true; // conservative: assume requested on unknown platforms
    }
}

fn isStepRequestedLinux(b: *std.Build, step_name: []const u8) bool {
    const file = std.Io.Dir.openFileAbsolute(b.graph.io, "/proc/self/cmdline", .{}) catch return true;
    defer file.close(b.graph.io);
    var buf: [4096]u8 = undefined;
    const len = file.readPositionalAll(b.graph.io, &buf, 0) catch return true;
    var it = std.mem.tokenizeScalar(u8, buf[0..len], 0);
    while (it.next()) |arg| {
        if (std.mem.eql(u8, arg, step_name)) return true;
    }
    return false;
}

fn isStepRequestedDarwin(step_name: []const u8) bool {
    const ns = struct {
        extern "c" fn _NSGetArgc() *c_int;
        extern "c" fn _NSGetArgv() *[*][*:0]u8;
    };
    const argc: usize = @intCast(ns._NSGetArgc().*);
    const argv: [*][*:0]u8 = ns._NSGetArgv().*;
    for (0..argc) |i| {
        if (std.mem.eql(u8, std.mem.span(argv[i]), step_name)) return true;
    }
    return false;
}

fn isStepRequestedWindows(b: *std.Build, step_name: []const u8) bool {
    const cmd_line = std.os.windows.peb().ProcessParameters.CommandLine.slice();
    var it = std.process.Args.Iterator.Windows.init(b.allocator, cmd_line) catch return true;
    defer it.deinit();
    while (it.next()) |arg| {
        if (std.mem.eql(u8, arg, step_name)) return true;
    }
    return false;
}
