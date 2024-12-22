// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterZig",
    products: [
        .library(name: "TreeSitterZig", targets: ["TreeSitterZig"]),
    ],
    dependencies: [
        .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterZig",
            dependencies: [],
            path: ".",
            sources: [
                "src/parser.c",
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterZigTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterZig",
            ],
            path: "bindings/swift/TreeSitterZigTests"
        )
    ],
    cLanguageStandard: .c11
)
