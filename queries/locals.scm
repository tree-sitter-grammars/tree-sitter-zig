; Definitions
(function_declaration
  name: (identifier) @local.definition.function)

(parameter
  name: (identifier) @local.definition.parameter)

(payload
  (identifier) @local.definition.parameter)

(variable_declaration
  (identifier) @local.definition.type
  (enum_declaration))

(container_field
  type: (identifier) @local.definition.field)

(enum_declaration
  (function_declaration
    name: (identifier) @local.definition.method))

(variable_declaration
  (identifier) @local.definition.type
  (struct_declaration))

(struct_declaration
  (function_declaration
    name: (identifier) @local.definition.method))

(container_field
  name: (identifier) @local.definition.field)

(variable_declaration
  (identifier) @local.definition.type
  (union_declaration))

(union_declaration
  (function_declaration
    name: (identifier) @local.definition.method))

(payload
  (identifier) @local.definition.var)

(block_label
  (identifier) @local.definition)

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

(struct_declaration
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

(suffix_expression
  (field_expression
    member: (identifier) @local.reference
    (#set! reference.kind "function"))
  .
  arguments: (_))

(suffix_expression
  head: (identifier) @local.reference
  (#set! reference.kind "function")
  .
  arguments: (_))

(break_label
  (identifier) @local.reference)

; Scopes
[
  (function_declaration)
  (struct_declaration)
  (opaque_declaration)
  (enum_declaration)
  (union_declaration)
  (block)
] @local.scope
