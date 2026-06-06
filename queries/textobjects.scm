;; Modified from https://github.com/nvim-treesitter/nvim-treesitter-textobjects/tree/main/queries/zig
;;
;; I don't have an obvious way to test these, so this is by eye.  There's room
;; to improve it further I imagine.

; "Classes"
[
  (variable_declaration
    [
      (enum_declaration)
      (error_set_declaration)
      (opaque_declaration)
      (struct_declaration)
      (tuple_declaration)
      (union_declaration)
    ])
  (local_variable_declaration
    [
      (enum_declaration)
      (error_set_declaration)
      (opaque_declaration)
      (struct_declaration)
      (tuple_declaration)
      (union_declaration)
    ])
] @class.outer

[
  (enum_declaration
    "{"
    _+ @class.inner
    "}")
  (error_set_declaration
    "{"
    _+ @class.inner
    "}")
  (opaque_declaration
    "{"
    _+ @class.inner
    "}")
  (struct_declaration
    "{"
    _+ @class.inner
    "}")
  (tuple_declaration
    "{"
    _+ @class.inner
    "}")
  (union_declaration
    "{"
    _+ @class.inner
    "}")
]

; functions
(function_declaration) @function.outer

(function_declaration
  body: (block
    .
    "{"
    _+ @function.inner
    "}"))

; loops
(for_statement) @loop.outer

(for_statement
  do: (_) @loop.inner)

(while_statement) @loop.outer

(while_statement
  do: (_) @loop.inner)

(for_expression) @loop.outer

(while_expression) @loop.outer

; blocks
(block) @block.outer

(block
  "{"
  _+ @block.inner
  "}")

; statements
(statement) @statement.outer

; parameters
(parameters
  "," @parameter.outer
  .
  (parameter) @parameter.inner @parameter.outer)

(parameters
  .
  (parameter) @parameter.inner @parameter.outer
  .
  ","? @parameter.outer)

; arguments
(call_expression
  function: (_)
  arguments: (arguments
    "("
    "," @parameter.outer
    .
    (_) @parameter.inner @parameter.outer
    ")"))

(call_expression
  function: (_)
  arguments: (arguments
    "("
    .
    (_) @parameter.inner @parameter.outer
    .
    ","? @parameter.outer
    ")"))

; comments
(comment) @comment.outer
(doc_comment) @comment.outer

; conditionals
(if_statement) @conditional.outer

(if_statement
  condition: (_) @conditional.inner)

(if_statement
  then: (_) @conditional.inner)

(if_expression) @conditional.outer

(if_expression
  condition: (_) @conditional.inner)

(if_expression
  then: (_) @conditional.inner)

(switch_expression) @conditional.outer

(switch_expression
  "("
  (_) @conditional.inner
  ")")

(switch_expression
  "{"
  _+ @conditional.inner
  "}")

(while_statement
  condition: (_) @conditional.inner)

(while_expression
  condition: (_) @conditional.inner)

; calls
(call_expression) @call.outer

(call_expression
  arguments: (arguments
    "("
    _+ @call.inner
    ")"))
