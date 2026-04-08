package tree_sitter_draft_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_draft "github.com/tree-sitter/tree-sitter-draft/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_draft.Language())
	if language == nil {
		t.Errorf("Error loading Draft grammar")
	}
}
