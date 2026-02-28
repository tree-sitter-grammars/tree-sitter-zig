package tree_sitter_zig_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_zig "github.com/tree-sitter/tree-sitter-zig/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_zig.Language())
	if language == nil {
		t.Errorf("Error loading Zig grammar")
	}
}
