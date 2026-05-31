; Definitions
(function_declaration
  name: (identifier) @local.definition
  (#set! definition.kind "function"))

(parameter
  name: (identifier) @local.definition
  (#set! definition.kind "parameter"))

[
  (variable_declaration
    name: (identifier) @local.definition)
  (local_variable_declaration
    name: (identifier) @local.definition)
] (#set! definition.kind "var")

[
  (variable_declaration
    name: (identifier) @local.definition
    value: [
      (enum_declaration)
      (error_set_declaration)
      (function_signature)
      (opaque_declaration)
      (struct_declaration)
      (tuple_declaration)
      (union_declaration)
    ])
  (local_variable_declaration
    name: (identifier) @local.definition
    value: [
      (enum_declaration)
      (error_set_declaration)
      (function_signature)
      (opaque_declaration)
      (struct_declaration)
      (tuple_declaration)
      (union_declaration)
    ])
] (#set! definition.kind "type")

(container_field
  name: (identifier) @local.definition
  (#set! definition.kind "field"))

[
  (enum_declaration
    (function_declaration
      name: (identifier) @local.definition))
  (opaque_declaration
    (function_declaration
      name: (identifier) @local.definition))
  (struct_declaration
    (function_declaration
      name: (identifier) @local.definition))
  (union_declaration
    (function_declaration
      name: (identifier) @local.definition))
] (#set! definition.kind "method")

(payload
  (identifier) @local.definition
  (#set! definition.kind "var"))

(block_label
  name: (identifier) @local.definition)

; References
(identifier) @local.reference

(parameter
  type: (identifier) @local.reference
  (#set! reference.kind "type"))

(pointer_type
  (identifier) @local.reference
  (#set! reference.kind "type"))

(nullable_type
  (identifier) @local.reference
  (#set! reference.kind "type"))

(struct_initializer
  (identifier) @local.reference
  (#set! reference.kind "type"))

(array_type
  (_)
  (identifier) @local.reference
  (#set! reference.kind "type"))

(slice_type
  (identifier) @local.reference
  (#set! reference.kind "type"))

(field_expression
  member: (identifier) @local.reference
  (#set! reference.kind "field"))

(pair
  field: (identifier) @local.reference
  (#set! reference.kind "field"))

(call_expression
  function: (field_expression
    member: (identifier) @local.reference
    (#set! reference.kind "function")))

(break_label
  label: (identifier) @local.reference)

[
  (for_statement)
  (if_statement)
  (while_statement)
  (function_declaration)
  (block)
  (source_file)
  (enum_declaration)
  (opaque_declaration)
  (struct_declaration)
  (switch_case)
  (union_declaration)
] @local.scope
