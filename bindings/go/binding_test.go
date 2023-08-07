package tree_sitter_zig_test

import (
	"testing"

	tree_sitter_zig "github.com/tree-sitter-grammars/tree-sitter-zig/bindings/go"
	tree_sitter "github.com/tree-sitter/go-tree-sitter"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_zig.Language())
	if language == nil {
		t.Errorf("Error loading Zig grammar")
	}
}
