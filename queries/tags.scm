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

(
  (test_declaration
    doc: (doc_comment)? @doc
    [
      (identifier) @name
      (string) @name
    ]) @definition.test
  (#strip! @doc "(?m)^\\s*///\\s?")
)

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
