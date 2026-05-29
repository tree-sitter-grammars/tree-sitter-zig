fn statements(xs: []const i32) void {
    inline for (xs, 0..) |item, index| {
        _ = item + index;
    } else {}
}
