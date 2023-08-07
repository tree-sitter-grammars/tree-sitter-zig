from unittest import TestCase

import tree_sitter, tree_sitter_zig


class TestLanguage(TestCase):
    def test_can_load_grammar(self):
        try:
            tree_sitter.Language(tree_sitter_zig.language())
        except Exception:
            self.fail("Error loading Zig grammar")
