; Variables
(identifier) @variable

; Parameters
(parameter
  name: (identifier) @variable.parameter)

(payload
  (identifier) @variable.parameter)

; Types
(parameter
  type: (identifier) @type)

((identifier) @type
  (#lua-match? @type "^[A-Z_][a-zA-Z0-9_]*"))

(variable_declaration
  (identifier) @type
  "="
  [
    (struct_declaration)
    (enum_declaration)
    (union_declaration)
    (opaque_declaration)
  ])

[
  (builtin_type)
  "anyframe"
  "anytype"
] @type.builtin

; Constants
((identifier) @constant
  (#lua-match? @constant "^[A-Z][A-Z_0-9]+$"))

[
  "null"
  "undefined"
] @constant.builtin

; Enum Literals
(field_expression
  member: (identifier) @constant)

; Labels
(block_label
  (identifier) @label)

(break_label
  (identifier) @label)

; Fields
(struct_declaration
  (container_field
    name: (identifier) @variable.member))

(field_initializer
  .
  (identifier) @variable.member)

(suffix_expression
  head: (_)
  (field_expression
    member: (identifier) @variable.member))

(suffix_expression
  head: (_)
  (field_expression
    member: (identifier) @type
    (#lua-match? @type "^[A-Z_][a-zA-Z0-9_]*")))

(suffix_expression
  head: (_)
  (field_expression
    member: (identifier) @constant
    (#lua-match? @constant "^[A-Z][A-Z_0-9]+$")))

(container_field
  name: (identifier) @variable.member)

(enum_declaration
  (container_field
    name: (identifier) @constant))

(union_declaration
  (container_field
    name: (identifier) @constant
    !type))

; Functions
(builtin_identifier) @function.builtin

(suffix_expression
  (field_expression
    member: (identifier) @function.method)
  .
  arguments: (_))

(function_declaration
  name: (identifier) @function)

(suffix_expression
  head: (identifier) @function.call
  .
  arguments: (_))

; Modules
(variable_declaration
  (identifier) @module
  (builtin_function
    (builtin_identifier) @keyword.import
    (#any-of? @keyword.import "@import" "@cImport")))

(variable_declaration
  (identifier) @type
  (#lua-match? @type "^[A-Z_][a-zA-Z0-9_]*")
  (builtin_function
    (builtin_identifier) @keyword.control.import
    (#any-of? @keyword.control.import "@import" "@cImport")))

(variable_declaration
  (identifier) @constant
  (#lua-match? @constant "^[A-Z][A-Z_0-9]+$")
  (builtin_function
    (builtin_identifier) @keyword.control.import
    (#any-of? @keyword.control.import "@import" "@cImport")))

(variable_declaration
  (identifier) @variable
  (suffix_expression
    head: (builtin_function
      (builtin_identifier) @keyword.control.import
      (#any-of? @keyword.control.import "@import" "@cImport"))))

(variable_declaration
  (identifier) @type
  (#lua-match? @type "^[A-Z_][a-zA-Z0-9_]*")
  (suffix_expression
    head: (builtin_function
      (builtin_identifier) @keyword.control.import
      (#any-of? @keyword.control.import "@import" "@cImport"))))

(variable_declaration
  (identifier) @constant
  (#lua-match? @constant "^[A-Z][A-Z_0-9]+$")
  (suffix_expression
    head: (builtin_function
      (builtin_identifier) @keyword.control.import
      (#any-of? @keyword.control.import "@import" "@cImport"))))

; Builtins
[
  "c"
  "..."
] @variable.builtin

((identifier) @variable.builtin
  (#eq? @variable.builtin "_"))

(calling_convention
  (identifier) @variable.builtin)

; Keywords
[
  "asm"
  "test"
] @keyword

[
  "error"
  "const"
  "var"
  "struct"
  "union"
  "enum"
  "opaque"
] @keyword.type

[
  "suspend"
  "nosuspend"
  "resume"
] @keyword.coroutine

"fn" @keyword.function

[
  "and"
  "or"
  "orelse"
] @keyword.operator

[
  "try"
  "unreachable"
  "return"
] @keyword.return

[
  "if"
  "else"
  "switch"
  "catch"
] @keyword.conditional

[
  "for"
  "while"
  "break"
  "continue"
] @keyword.repeat

[
  "export"
] @keyword.import

[
  "defer"
  "errdefer"
] @keyword.exception

[
  "volatile"
  "allowzero"
  "noalias"
  "addrspace"
  "align"
  "callconv"
  "linksection"
  "pub"
  "inline"
  "noinline"
  "extern"
  "comptime"
  "packed"
  "threadlocal"
] @keyword.modifier

; Operator
[
  "="
  "*="
  "*%="
  "*|="
  "/="
  "%="
  "+="
  "+%="
  "+|="
  "-="
  "-%="
  "-|="
  "<<="
  "<<|="
  ">>="
  "&="
  "^="
  "|="
  "!"
  "~"
  "-"
  "-%"
  "&"
  "=="
  "!="
  ">"
  ">="
  "<="
  "<"
  "^"
  "|"
  "<<"
  ">>"
  "<<|"
  "+"
  "++"
  "+%"
  "+|"
  "-|"
  "*"
  "/"
  "%"
  "**"
  "*%"
  "*|"
  "||"
  ".*"
  ".?"
  "?"
  ".."
] @operator

; Literals
(character) @character

([
  (string)
  (multiline_string)
] @string
  (#set! "priority" 95))

(integer) @number

(float) @number.float

(boolean) @boolean

(escape_sequence) @string.escape

; Punctuation
[
  "["
  "]"
  "("
  ")"
  "{"
  "}"
] @punctuation.bracket

[
  ";"
  "."
  ","
  ":"
  "=>"
  "->"
] @punctuation.delimiter

(multiline_string
  "\\\\" @punctuation.special)

(payload
  "|" @punctuation.bracket)

; Comments
(comment) @comment @spell

[
  (container_doc_comment)
  (doc_comment)
] @comment.documentation
