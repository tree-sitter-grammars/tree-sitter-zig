/**
 * @file Zig grammar for tree-sitter
 * @author Amaan Qureshi <amaanq12@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  PAREN_DECLARATOR: -10,
  CONDITIONAL: -1,
  DEFAULT: 0,
  LOGICAL_OR: 1,
  LOGICAL_AND: 2,
  EQUAL: 3,
  BITWISE: 4,
  SHIFT: 5,
  ADD: 6,
  MULTIPLY: 7,
  UNARY: 8,
  STRUCT: 9,
  MEMBER: 10,
};

const builtinTypes = [
  'bool',
  'f16',
  'f32',
  'f64',
  'f128',
  'void',
  'type',
  'anyerror',
  'anyopaque',
  'noreturn',
  'isize',
  'usize',
  'comptime_int',
  'comptime_float',
  'c_short',
  'c_ushort',
  'c_int',
  'c_uint',
  'c_long',
  'c_ulong',
  'c_longlong',
  'c_ulonglong',
  'c_longdouble',
  /i[1-9][0-9]*/,
  /u[0-9]+/,
];

const reservedWords = [
  'addrspace',
  'align',
  'allowzero',
  'and',
  'anytype',
  'asm',
  'break',
  'callconv',
  'catch',
  'comptime',
  'const',
  'continue',
  'defer',
  'else',
  'enum',
  'errdefer',
  'error',
  'export',
  'extern',
  'fn',
  'for',
  'if',
  'inline',
  'linksection',
  'noalias',
  'noinline',
  'nosuspend',
  'opaque',
  'or',
  'orelse',
  'packed',
  'pub',
  'resume',
  'return',
  'struct',
  'suspend',
  'switch',
  'test',
  'threadlocal',
  'try',
  'union',
  'unreachable',
  'var',
  'volatile',
  'while',
];

module.exports = grammar({
  name: 'zig',

  conflicts: $ => [
    [$.for_expression],
    [$.while_expression],

    [$.expression, $._function_prototype],
    [$.expression, $.type_expression],
    [$.expression, $.if_type_expression],

    [$.comptime_type_expression, $.expression],
    [$.comptime_declaration, $._block_expr_statement],
    [$.variable_declaration, $._variable_declaration_expression_statement],
    [$._destructuring_multiple_assignment_statement, $.assignment_statement],
    [$._container_field_body, $.primary_expression],
    [$.labeled_block_expression, $.labeled_type_expression],
  ],

  extras: $ => [
    $.comment,
    /\s/,
  ],

  reserved: {
    global: _ => reservedWords,
  },

  inline: $ => [
    $._reserved_identifier,
  ],

  precedences: $ => [
    [$.container_field, $.type_expression],
  ],

  supertypes: $ => [
    $.statement,
    $.expression,
    $.type_expression,
    $.primary_expression,
    $.primary_type_expression,
  ],

  word: $ => $._identifier,

  rules: {
    source_file: $ => seq(
      field('doc', optional($.top_doc_comment)),
      optional(choice(
        repeat1(alias($.statement, $.fragment)),
        $._container_members,
      )),
    ),

    _container_members: $ => choice(
      seq(
        repeat1(choice(
          $.test_declaration,
          $.comptime_declaration,
          $.variable_declaration,
          $.function_declaration,
          $.using_namespace_declaration,
          seq($.container_field, ','),
        )),
        optional($.container_field),
      ),
      $.container_field,
    ),

    test_declaration: $ => seq(
      optional(field('doc', $.doc_comment)),
      'test',
      optional(choice($.string, $.identifier)),
      $.block,
    ),

    comptime_declaration: $ => prec(1, seq(
      optional(field('doc', $.doc_comment)),
      'comptime',
      $.block,
    )),

    container_field: $ => prec.right(prec.dynamic(1, choice(
      seq(optional(field('doc', $.doc_comment)), 'comptime', $._container_field_body),
      seq(optional(field('doc', $.doc_comment)), $._container_field_body),
    ))),

    _container_field_body: $ => seq(
      field('name', choice($.identifier, alias($.builtin_type, $.identifier))),
      optional(seq(
        ':',
        field('type', choice($.type_expression, $.if_type_expression)),
      )),
      optional($.byte_alignment),
      optional(seq('=', field('default_value', $.expression))),
    ),

    variable_declaration: $ => seq(
      optional(field('doc', $.doc_comment)),
      optional('pub'),
      optional(choice(
        'export',
        seq('extern', optional($.string)),
      )),
      optional('threadlocal'),
      $._variable_declaration_header,
      optional(seq('=', $.expression)),
      ';',
    ),

    _variable_declaration_expression_statement: $ => seq(
      $._variable_declaration_header,
      '=',
      $.expression,
      ';',
    ),

    _destructuring_multiple_assignment_statement: $ => seq(
      choice($._variable_declaration_header, $.expression),
      repeat1(prec(1, seq(',', choice($._variable_declaration_header, $.expression)))),
      '=',
      $.expression,
      ';',
    ),

    _variable_declaration_header: $ => prec(1, seq(
      choice('const', 'var'),
      $.identifier,
      optional(seq(
        ':',
        field('type', choice($.type_expression, $.if_type_expression, $.comptime_type_expression)),
      )),
      optional($.byte_alignment),
      optional($.address_space),
      optional($.link_section),
    )),

    function_declaration: $ => seq(
      optional(field('doc', $.doc_comment)),
      optional('pub'),
      choice(
        seq(
          optional(choice('export', 'inline', 'noinline')),
          $._function_prototype,
          choice(
            ';',
            field('body', $.block),
          ),
        ),
        seq(
          'extern',
          optional($.string),
          $._function_prototype,
          ';',
        ),
      ),
    ),

    _function_prototype: $ => seq(
      'fn',
      optional(field('name', $.identifier)),
      $.parameters,
      optional($.byte_alignment),
      optional($.address_space),
      optional($.link_section),
      optional($.calling_convention),
      field('type', choice($.type_expression, $.if_type_expression, $.comptime_type_expression)),
    ),

    parameters: $ => seq(
      '(',
      optional(seq(
        commaSep1($.parameter),
        optional(seq(',', alias('...', $.parameter))),
        optional(','),
      )),
      optional(alias('...', $.parameter)),
      ')',
    ),

    parameter: $ => prec(1, seq(
      optional(field('doc', $.doc_comment)),
      optional(choice('noalias', 'comptime')),
      optional(seq(
        field('name', choice($.identifier, alias($.builtin_type, $.identifier))),
        ':',
      )),
      field('type', choice($.type_expression, $.if_type_expression, $.comptime_type_expression, alias('anytype', $.anytype))),
    )),

    using_namespace_declaration: $ => seq(
      optional(field('doc', $.doc_comment)),
      optional('pub'),
      'usingnamespace',
      $.expression,
      ';',
    ),

    block: $ => seq(
      '{',
      repeat($.statement),
      '}',
    ),

    struct_declaration: $ => seq(
      optional(choice('extern', 'packed')),
      'struct',
      optional(seq('(', $.expression, ')')),
      '{',
      optional($._container_members),
      '}',
    ),

    tuple_declaration: $ => seq(
      'struct',
      '{',
      $._tuple_declaration_list,
      '}',
    ),

    _tuple_declaration_list: $ => optionalCommaSep1(field('type', choice($.type_expression, $.if_type_expression))),

    opaque_declaration: $ => seq(
      optional(choice('extern', 'packed')),
      'opaque',
      '{',
      optional($._container_members),
      '}',
    ),

    enum_declaration: $ => seq(
      optional(choice('extern', 'packed')),
      'enum',
      optional(seq('(', $.expression, ')')),
      '{',
      optional($._container_members),
      '}',
    ),

    union_declaration: $ => seq(
      optional(choice('extern', 'packed')),
      'union',
      optional(seq(
        '(',
        choice(
          seq('enum', optional(seq('(', $.expression, ')'))),
          $.expression,
        ),
        ')',
      )),
      '{',
      optional($._container_members),
      '}',
    ),

    error_set_declaration: $ => seq(
      'error',
      '{',
      optionalCommaSep($.identifier),
      '}',
    ),

    statement: $ => choice(
      $.comptime_statement,
      $.nosuspend_statement,
      $.suspend_statement,
      $.defer_statement,
      $.errdefer_statement,
      $.expression_statement,
      $.assignment_statement,
      alias($._destructuring_multiple_assignment_statement, $.multiple_declaration),
      alias($._variable_declaration_expression_statement, $.local_variable_declaration),
      $.if_statement,
      $.for_statement,
      $.while_statement,
      $.labeled_statement,
      prec(1, $.switch_expression),
    ),

    comptime_statement: $ => seq(
      'comptime',
      choice(
        $._block_expr_statement,
        alias($._variable_declaration_expression_statement, $.local_variable_declaration),
      ),
    ),

    nosuspend_statement: $ => seq('nosuspend', $._block_expr_statement),

    suspend_statement: $ => seq('suspend', $._block_expr_statement),

    defer_statement: $ => seq('defer', $._block_expr_statement),

    errdefer_statement: $ => seq('errdefer', optional($.payload), $._block_expr_statement),

    _block_expr_statement: $ => prec(1, choice(
      seq(optional($.block_label), $.block),
      $.assignment_statement,
      $.expression_statement,
    )),

    block_expression: $ => prec(1, seq(optional($.block_label), $.block)),

    labeled_block_expression: $ => seq($.block_label, $.block),

    labeled_statement: $ => prec(1, seq(
      optional($.block_label),
      choice($.block, $.for_statement, $.while_statement),
    )),

    expression_statement: $ => seq($.expression, ';'),

    if_statement: $ => seq(
      $._if_prefix,
      $._conditional_body,
    ),

    _if_prefix: $ => seq(
      'if',
      '(',
      field('condition', $.expression),
      ')',
      optional(alias($._ptr_payload, $.payload)),
    ),

    else_clause: $ => seq(
      'else',
      optional($.payload),
      field('else', $.statement),
    ),

    _for_else_clause: $ => seq(
      'else',
      field('else', $.statement),
    ),

    for_statement: $ => seq(
      optional('inline'),
      $._for_prefix,
      $._for_conditional_body,
    ),

    _for_prefix: $ => seq(
      'for',
      seq('(',
      field('iterable', optionalCommaSep1($._for_item)),
      ')'),
      alias($._ptr_list_payload, $.payload),
    ),

    _for_item: $ => choice(
      $.range_expression,
      $.expression,
    ),

    while_statement: $ => seq(
      optional('inline'),
      $._while_prefix,
      $._while_conditional_body,
    ),

    _while_prefix: $ => seq(
      'while',
      '(',
      field('condition', $.expression),
      ')',
      optional(alias($._ptr_payload, $.payload)),
      optional(seq(':', '(', field('continue', $.continue_clause), ')')),
    ),

    continue_clause: $ => choice(
      $._assign_expr,
      $.block_expression,
    ),

    _assign_expr: $ => prec.left(1, choice(
      $._single_assign_expr,
      seq(
        $.expression,
        repeat1(prec(1, seq(',', $.expression))),
        '=',
        $.expression,
      ),
    )),

    _single_assign_expr: $ => prec.left(1, choice(
      $.expression,
      $.assignment_expression,
    )),

    _while_conditional_body: $ => choice(
      seq(
        field('do', $.block_expression),
        optional($.else_clause),
      ),
      seq(
        field('do', $._assign_expr),
        choice(';', $.else_clause),
      ),
    ),

    _conditional_body: $ => choice(
      seq(
        field('then', $.block_expression),
        optional($.else_clause),
      ),
      seq(
        field('then', $._assign_expr),
        choice(';', $.else_clause),
      ),
    ),

    _for_conditional_body: $ => choice(
      seq(
        field('body', $.block_expression),
        optional(alias($._for_else_clause, $.else_clause)),
      ),
      seq(
        field('body', $._assign_expr),
        choice(';', alias($._for_else_clause, $.else_clause)),
      ),
    ),

    payload: $ => seq('|', $.identifier, '|'),

    _ptr_payload: $ => seq('|', optional('*'), $.identifier, '|'),

    _ptr_list_payload: $ => seq(
      '|',
      optional('*'),
      $.identifier,
      repeat(seq(',', optional('*'), $.identifier)),
      optional(','),
      '|',
    ),

    _switch_payload: $ => seq(
      '|',
      seq(optional('*'), $.identifier),
      optional(seq(',', $.identifier)),
      '|',
    ),

    byte_alignment: $ => seq('align', '(', $.expression, ')'),

    address_space: $ => seq('addrspace', '(', $.expression, ')'),

    link_section: $ => seq('linksection', '(', $.expression, ')'),

    calling_convention: $ => seq('callconv', '(', $.expression, ')'),

    expression: $ => prec.right(choice(
      $.asm_expression,
      $.if_expression,
      $.for_expression,
      $.while_expression,
      $.unary_expression,
      $.binary_expression,
      $.comptime_expression,
      $.nosuspend_expression,
      $.continue_expression,
      $.resume_expression,
      $.return_expression,
      $.break_expression,
      $.try_expression,
      $.catch_expression,
      $.type_expression,
      $.default_struct_value,
      $.literal_tuple_value,
      $.literal_struct_value,
      $.struct_initializer,
      $._suffix_expression,
      $.labeled_block_expression,
      $.block,
    )),

    asm_expression: $ => seq(
      'asm',
      optional('volatile'),
      '(',
      $.expression,
      optional($.asm_output),
      ')',
    ),
    asm_output: $ => seq(':', optionalCommaSep($.asm_output_item), optional($.asm_input)),
    asm_output_item: $ => seq(
      '[',
      $.identifier,
      ']',
      choice($.string, $.multiline_string),
      '(',
      choice(seq('->', $.type_expression), $.identifier),
      ')',
    ),
    asm_input: $ => seq(':', optionalCommaSep($.asm_input_item), optional($.asm_clobbers)),
    asm_input_item: $ => seq(
      '[',
      $.identifier,
      ']',
      choice($.string, $.multiline_string),
      '(',
      $.expression,
      ')',
    ),
    asm_clobbers: $ => seq(':', $.expression),

    if_expression: $ => prec.right(seq(
      $._if_prefix,
      field('then', $.expression),
      optional(seq('else', optional($.payload), field('else', $.expression))),
    )),

    for_expression: $ => prec.right(seq(
      optional($.block_label),
      optional('inline'),
      $._for_prefix,
      $.expression,
      optional(seq('else', field('else', $.expression))),
    )),

    while_expression: $ => prec.right(seq(
      optional($.block_label),
      optional('inline'),
      $._while_prefix,
      $.expression,
      optional(seq('else', optional($.payload), $.expression)),
    )),

    assignment_statement: $ => prec.right(seq(
      choice(
        alias($.assignment_expression, 'assignment'),
        seq(
          field('left', seq(
            $.expression,
            repeat1(prec(1, seq(',', $.expression))),
          )),
          '=',
          field('right', $.expression),
        ),
      ),
      ';',
    )),

    assignment_expression: $ => seq(
      field('left', $.expression),
      field('operator', choice(
        '=', '*=', '*%=', '*|=', '/=', '%=',
        '+=', '+%=', '+|=', '-=', '-%=', '-|=',
        '<<=', '<<|=', '>>=', '&=', '^=', '|=',
      )),
      field('right', $.expression),
    ),

    unary_expression: $ => prec.left(PREC.UNARY, seq(
      field('operator', choice('!', '~', '-', '-%', '&')),
      field('argument', $.expression),
    )),

    binary_expression: $ => {
      const table = [
        ['or', PREC.LOGICAL_OR],
        ['and', PREC.LOGICAL_AND],
        ['==', PREC.EQUAL],
        ['!=', PREC.EQUAL],
        ['>', PREC.EQUAL],
        ['>=', PREC.EQUAL],
        ['<=', PREC.EQUAL],
        ['<', PREC.EQUAL],
        ['&', PREC.BITWISE],
        ['^', PREC.BITWISE],
        ['|', PREC.BITWISE],
        ['orelse', PREC.BITWISE],
        ['<<', PREC.SHIFT],
        ['>>', PREC.SHIFT],
        ['<<|', PREC.SHIFT],
        ['+', PREC.ADD],
        ['-', PREC.ADD],
        ['++', PREC.ADD],
        ['+%', PREC.ADD],
        ['-%', PREC.ADD],
        ['+|', PREC.ADD],
        ['-|', PREC.ADD],
        ['*', PREC.MULTIPLY],
        ['/', PREC.MULTIPLY],
        ['%', PREC.MULTIPLY],
        ['**', PREC.MULTIPLY],
        ['*%', PREC.MULTIPLY],
        ['*|', PREC.MULTIPLY],
        ['||', PREC.MULTIPLY],
      ];

      return choice(...table.map(([operator, precedence]) => {
        return prec.left(precedence, seq(
          field('left', $.expression),
          // @ts-ignore
          field('operator', operator),
          field('right', $.expression),
        ));
      }));
    },

    comptime_expression: $ => prec.right(seq('comptime', $.expression)),

    nosuspend_expression: $ => prec.right(seq('nosuspend', $.expression)),

    continue_expression: $ => prec.right(seq(
      'continue',
      optional($.break_label),
      optional($.expression),
    )),

    resume_expression: $ => prec.right(seq('resume', $.expression)),

    return_expression: $ => prec.right(seq('return', optional($.expression))),

    break_expression: $ => prec.right(seq(
      'break',
      optional($.break_label),
      optional($.expression),
    )),

    try_expression: $ => prec.right(PREC.BITWISE, seq('try', $.expression)),

    catch_expression: $ => prec.right(PREC.BITWISE, seq(
      $.expression,
      'catch',
      optional($.payload),
      $.expression,
    )),

    switch_expression: $ => seq(
      optional($.block_label),
      'switch',
      '(', $.expression, ')',
      '{',
      optionalCommaSep($.switch_case),
      '}',
    ),
    switch_case: $ => seq(
      field('case', $._switch_case_exp),
      '=>',
      optional(alias($._switch_payload, $.payload)),
      field('then', $._single_assign_expr),
    ),
    _switch_case_exp: $ => seq(
      optional('inline'),
      choice(
        optionalCommaSep1(seq($.expression, optional(seq('...', $.expression)))),
        'else',
      ),
    ),

    type_expression: $ => prec.right(choice(
      $.nullable_type,
      $.anyframe_type,
      $.slice_type,
      $.pointer_type,
      $.array_type,
      $.error_union_type,
      $.labeled_type_expression,
      $.primary_type_expression,
      $._suffix_expression,
    )),

    primary_type_expression: $ => choice(
      prec.right(alias($._function_prototype, $.function_signature)),
      $.primary_expression,
      $.error_set_declaration,
      $.struct_declaration,
      $.tuple_declaration,
      $.opaque_declaration,
      $.enum_declaration,
      $.union_declaration,
      $.switch_expression,
    ),

    primary_expression: $ => choice(
      $.builtin_function,
      $.character,
      $.identifier,
      $.float,
      $.parenthesized_expression,
      $.integer,
      $.boolean,
      $.enum_literal,
      $.error_type,
      'anyframe',
      $.unreachable,
      $.undefined,
      $.null,
      $.string,
      $.multiline_string,
      $.builtin_type,
    ),

    _suffix_expression: $ => choice(
      $.field_expression,
      $.index_expression,
      $.dereference_expression,
      $.null_coercion_expression,
      $.call_expression,
    ),

    nullable_type: $ => prec(1, seq(
      '?',
      choice($.type_expression, $.if_type_expression, $.comptime_type_expression),
    )),

    anyframe_type: $ => prec(1, seq(
      'anyframe',
      '->',
      choice($.type_expression, $.if_type_expression, $.comptime_type_expression),
    )),

    slice_type: $ => prec.right(1, seq(
      '[',
      optional(seq(
        ':',
        field('sentinel', $.expression),
      )),
      ']',
      repeat(choice(
        $.byte_alignment,
        $.address_space,
        'const',
        'volatile',
        'allowzero',
      )),
      choice($.type_expression, $.if_type_expression, $.comptime_type_expression),
    )),

    pointer_type: $ => prec.right(1, seq(
      choice(
        '*',
        seq(
          '[',
          '*',
          optional(choice('c', seq(':', field('sentinel', $.expression)))),
          ']',
        ),
      ),
      repeat(choice(
        $.address_space,
        seq(
          'align',
          '(',
          $.expression,
          optional(seq(':', $.expression, ':', $.expression)),
          ')',
        ),
        'const',
        'volatile',
        'allowzero',
      )),
      choice($.type_expression, $.if_type_expression, $.comptime_type_expression),
    )),

    array_type: $ => prec(1, seq(
      '[',
      $.expression,
      optional(seq(':', field('sentinel', $.expression))),
      ']',
      $.type_expression,
    )),

    error_union_type: $ => prec.right(2, seq(
      optional(field('error', $.type_expression)),
      '!',
      field('ok', choice($.type_expression, $.if_type_expression, $.comptime_type_expression)),
    )),

    enum_literal: $ => seq('.', field('name', $._identifier)),

    field_expression: $ => prec(PREC.MEMBER, seq(
      field('object', $.expression),
      '.',
      field('member', $.identifier),
    )),

    index_expression: $ => prec(PREC.MEMBER, seq(
      field('object', $.expression),
      '[',
      choice(
        seq(
          $.range_expression,
          optional(seq(':', field('sentinel', $.expression))),
        ),
        field('index', $.expression),
      ),
      ']',
    )),

    dereference_expression: $ => prec(PREC.MEMBER, seq($.expression, '.*')),

    null_coercion_expression: $ => prec(PREC.MEMBER, seq($.expression, '.?')),

    range_expression: $ => prec.right(PREC.MEMBER, seq(
      field('from', $.expression),
      '..',
      optional(field('to', $.expression)),
    )),

    call_expression: $ => prec(PREC.MEMBER, seq(
      field('function', $.expression),
      field('arguments', $.arguments),
    )),

    default_struct_value: _ => seq('.', '{', '}'),

    literal_tuple_value: $ => seq(
      '.',
      '{',
      optionalCommaSep1($.item),
      '}',
    ),

    item: $ => $.expression,

    literal_struct_value: $ => seq(
      '.',
      '{',
      optionalCommaSep1($.pair),
      '}',
    ),

    struct_initializer: $ => prec(-1, seq($.type_expression, alias($._initializer_list, $.initializer_list))),

    _initializer_list: $ => seq(
      '{',
      choice(
        optionalCommaSep($.pair),
        optionalCommaSep($.expression),
      ),
      '}',
    ),

    pair: $ => seq(
      '.',
      field('field', $.identifier),
      '=',
      field('value', $.expression),
    ),

    labeled_type_expression: $ => seq($.block_label, $.block),

    comptime_type_expression: $ => seq('comptime', $.type_expression),

    if_type_expression: $ => prec.right(seq(
      $._if_prefix,
      $.type_expression,
      optional(seq('else', optional($.payload), $.type_expression)),
    )),

    parenthesized_expression: $ => seq('(', $.expression, ')'),

    block_label: $ => prec(-1, seq(
      choice($.identifier, alias($.builtin_type, $.identifier)),
      ':',
    )),
    break_label: $ => seq(':', $.identifier),

    arguments: $ => seq('(', optionalCommaSep($.expression), ')'),

    builtin_function: $ => seq(
      $.builtin_identifier,
      $.arguments,
    ),

    string: $ => seq(
      '"',
      repeat(choice(
        alias(token.immediate(prec(1, /[^\\"\n]+/)), $.string_content),
        $.escape_sequence,
      )),
      '"',
    ),

    multiline_string: _ => prec.right(repeat1(token(seq('\\\\', /[^\n]*/)))),

    escape_sequence: _ => token(prec(1, seq(
      '\\',
      choice(
        /[^xuU]/,
        /\d{2,3}/,
        /x[0-9a-fA-F]{2}/,
        /u\{[0-9a-fA-F]{1,6}\}/,
      ),
    ))),

    character: $ => seq(
      '\'',
      choice(
        alias(/[^'\n]/, $.character_content),
        $.escape_sequence,
      ),
      '\'',
    ),

    integer: _ => {
      const separator = '_';
      const hex = /[0-9A-Fa-f]/;
      const oct = /[0-7]/;
      const bin = /[0-1]/;
      const decimal = /[0-9]/;
      const hexDigits = seq(repeat1(hex), repeat(seq(separator, repeat1(hex))));
      const octDigits = seq(repeat1(oct), repeat(seq(separator, repeat1(oct))));
      const binDigits = seq(repeat1(bin), repeat(seq(separator, repeat1(bin))));
      const decimalDigits = seq(repeat1(decimal), repeat(seq(separator, repeat1(decimal))));

      return token(choice(
        seq('0x', hexDigits),
        seq('0o', octDigits),
        seq('0b', binDigits),
        decimalDigits,
      ));
    },

    float: _ => {
      const separator = '_';
      const hex = /[0-9A-Fa-f]/;
      const decimal = /[0-9]/;
      const hexDigits = seq(repeat1(hex), repeat(seq(separator, repeat1(hex))));
      const decimalDigits = seq(repeat1(decimal), repeat(seq(separator, repeat1(decimal))));

      return token(choice(
        seq('0x', hexDigits, '.', hexDigits, optional(seq(/[pP][+-]?/, decimalDigits))),
        seq(decimalDigits, '.', decimalDigits, optional(seq(/[eE][+-]?/, decimalDigits))),
        seq('0x', hexDigits, /[pP][+-]?/, decimalDigits),
        seq(decimalDigits, /[eE][+-]?/, decimalDigits),
      ));
    },

    boolean: _ => choice('true', 'false'),

    null: _ => 'null',

    undefined: _ => 'undefined',

    unreachable: _ => 'unreachable',

    builtin_type: _ => choice(...builtinTypes),

    error_type: $ => seq('error', '.', $.identifier),

    builtin_identifier: _ => /@[A-Za-z_][A-Za-z0-9_]*/,

    identifier: $ => choice($._identifier, seq('@', $.string)),
    _identifier: _ => /[A-Za-z_][A-Za-z0-9_]*/,
    _reserved_identifier: _ => choice(
      'undefined',
      'null',
      'true',
      'false',
    ),

    top_doc_comment: $ => repeat1($._top_doc_comment_line),

    _top_doc_comment_line: _ => token(seq('//!', /.*/)),

    doc_comment: $ => repeat1($._doc_comment_line),

    _doc_comment_line: _ => token(seq('///', /.*/)),

    comment: _ => token(seq('//', /.*/)),
  },
});

/**
 * Creates a rule to match optionally match one or more of the rules
 * separated by a comma and optionally ending with a comma
 *
 * @param {RuleOrLiteral} rule
 *
 * @returns {ChoiceRule}
 */
function optionalCommaSep(rule) {
  return optional(optionalCommaSep1(rule));
}

/**
 * Creates a rule to match one or more of the rules separated by a comma
 * and optionally ending with a comma
 *
 * @param {RuleOrLiteral} rule
 *
 * @returns {SeqRule}
 */
function optionalCommaSep1(rule) {
  return seq(commaSep1(rule), optional(','));
}

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {RuleOrLiteral} rule
 *
 * @returns {SeqRule}
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
