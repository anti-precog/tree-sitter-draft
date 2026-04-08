import XCTest
import SwiftTreeSitter
import TreeSitterDraft

final class TreeSitterDraftTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_draft())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Draft grammar")
    }
}
