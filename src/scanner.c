#include <tree_sitter/parser.h>

enum TokenType {
  DOC_COMMENT_CONTENT,
  ERROR_SENTINEL
};

void * tree_sitter_zig_external_scanner_create() {return NULL;}
void tree_sitter_zig_external_scanner_destroy(void * payload) {}
unsigned tree_sitter_zig_external_scanner_serialize(void * payload, char * buffer) {return 0;}
void tree_sitter_zig_external_scanner_deserialize(void * payload, const char * buffer, unsigned length) {}

bool tree_sitter_zig_external_scanner_scan(void * payload, TSLexer *lexer, const bool * valid_symbols) {
  // without this, error recovery for comments is much worse.
  // a single `/` marks the rest of the file as a comment
  if (valid_symbols[ERROR_SENTINEL]) {
      return false;
  }
    
  if (valid_symbols[DOC_COMMENT_CONTENT]) {
    lexer->result_symbol = DOC_COMMENT_CONTENT;
    while (true) {
        if (lexer->eof(lexer)) {
            return true;
        }
        if (lexer->lookahead == '\n') {
            // including the line ending in doc
            // comments is necessary for markdown injections
            lexer->advance(lexer, false);
            return true;
        }
        lexer->advance(lexer, false);
    }
  }
  
  return false;
}
