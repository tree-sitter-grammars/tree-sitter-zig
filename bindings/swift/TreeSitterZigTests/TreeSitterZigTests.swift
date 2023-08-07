import XCTest
import SwiftTreeSitter
import TreeSitterZig

final class TreeSitterZigTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_zig())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Zig grammar")
    }
}
