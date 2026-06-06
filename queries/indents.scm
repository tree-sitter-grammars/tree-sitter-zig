[
  (block)
  (struct_declaration)
  (tuple_declaration)
  (opaque_declaration)
  (enum_declaration)
  (union_declaration)
  (error_set_declaration)
  (literal_struct_value)
  (literal_tuple_value)
  (switch_expression)
  (if_expression)
  (if_statement)
  (while_expression)
  (while_statement)
  (for_expression)
  (for_statement)
  (initializer_list)
] @indent.begin

(block
  "}" @indent.end)

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @indent.branch

[
  (comment)
  (multiline_string)
] @indent.ignore
