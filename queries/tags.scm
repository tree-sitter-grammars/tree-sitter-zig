; Type-like declarations

(
  [
    (variable_declaration
      doc: (doc_comment)? @doc
      name: (identifier) @name
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
      name: (identifier) @name
      value: [
        (enum_declaration)
        (error_set_declaration)
        (function_signature)
        (opaque_declaration)
        (struct_declaration)
        (tuple_declaration)
        (union_declaration)
      ])
  ] @definition.class
  (#strip! @doc "(?m)^\\s*///\\s?")
)

; Functions and methods

(
  (source_file
    (function_declaration
      doc: (doc_comment)? @doc
      name: (identifier) @name) @definition.function)
  (#strip! @doc "(?m)^\\s*///\\s?")
)

(
  [
    (enum_declaration
      (function_declaration
        doc: (doc_comment)? @doc
        name: (identifier) @name) @definition.method)
    (opaque_declaration
      (function_declaration
        doc: (doc_comment)? @doc
        name: (identifier) @name) @definition.method)
    (struct_declaration
      (function_declaration
        doc: (doc_comment)? @doc
        name: (identifier) @name) @definition.method)
    (union_declaration
      (function_declaration
        doc: (doc_comment)? @doc
        name: (identifier) @name) @definition.method)
  ]
  (#strip! @doc "(?m)^\\s*///\\s?")
)

; Tests

(test_declaration
  [
    (identifier) @name
    (string) @name
  ]) @definition.test

; Fields and locals

(
  (container_field
    doc: (doc_comment)? @doc
    name: (identifier) @name) @definition.field
  (#strip! @doc "(?m)^\\s*///\\s?")
)

(
  (parameter
    doc: (doc_comment)? @doc
    name: (identifier) @name) @definition.parameter
  (#strip! @doc "(?m)^\\s*///\\s?")
)

(local_variable_declaration
  name: (identifier) @name) @definition.variable

(multiple_declaration
  name: (identifier) @name) @definition.variable

(payload
  (identifier) @name) @definition.variable

(block_label
  name: (identifier) @name) @definition.label

; Calls

[
  (call_expression
    function: (identifier) @name)
  (call_expression
    function: (field_expression
      member: (identifier) @name))
  (builtin_function
    (builtin_identifier) @name)
] @reference.call

; Type-like references

[
  (parameter
    type: (identifier) @name)
  (container_field
    type: (identifier) @name)
  (variable_declaration
    type: (identifier) @name)
  (local_variable_declaration
    type: (identifier) @name)
  (function_declaration
    type: (identifier) @name)
  (function_signature
    type: (identifier) @name)
  (struct_initializer
    (identifier) @name)
  (pointer_type
    (identifier) @name)
  (slice_type
    (identifier) @name)
  (array_type
    (identifier) @name)
  (nullable_type
    (identifier) @name)
  (error_union_type
    error: (identifier) @name)
  (error_union_type
    ok: (identifier) @name)
  (field_expression
    object: (identifier) @name)
] @reference.class

; Fields and labels

[
  (field_expression
    member: (identifier) @name)
  (pair
    field: (identifier) @name)
] @reference.field

(break_label
  label: (identifier) @name) @reference.label
