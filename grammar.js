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
  'f80',
  'f128',
  'void',
  'type',
  'anyerror',
  'anyopaque',
  'type',
  'noreturn',
  'isize',
  'usize',
  'comptime_int',
  'comptime_float',
  'c_char',
  'c_short',
  'c_ushort',
  'c_int',
  'c_uint',
  'c_long',
  'c_ulong',
  'c_longlong',
  'c_ulonglong',
  'c_longdouble',
  /(i|u)[0-9]+/,
];

export default grammar({
  name: 'zig',

  externals: ($) => [$.doc_comment_content, $._error_sentinel],

  conflicts: $ => [
    [$._container_members],
    [$.for_expression],
    [$.while_expression],
    [$.switch_expression],
    [$.for_type_expression],
    [$.while_type_expression],
    [$.parameter, $._type_expression],
    [$.primary_expression, $._type_expression],
  ],

  extras: $ => [
    $.comment,
    /\s/,
  ],

  inline: $ => [
    $.primitive_value,
  ],

  supertypes: $ => [
    $.expression,
    $.primary_expression,
    $.type_expression,
    $.primary_type_expression,
  ],

  word: $ => $._identifier,

  rules: {
    source_file: $ => optional($._container_members),

    _container_members: $ => seq(
      repeat($.container_doc_comment),
      repeat($._container_declaration),
      repeat(seq($.container_field, ',')),
      choice(
        seq($.container_field, optional(',')),
        repeat1($._container_declaration),
      ),
    ),

    _container_declaration: $ => choice(
      $.test_declaration,
      $.comptime_declaration,
      seq(
        repeat($.doc_comment),
        optional('pub'),
        choice(
          $.variable_declaration,
          $.function_declaration,
          $.using_namespace_declaration,
        ),
      ),
    ),

    test_declaration: $ => seq(
      'test',
      optional(choice($.string, $.identifier)),
      $.block,
    ),

    comptime_declaration: $ => seq(
      'comptime',
      $.block,
    ),

    container_field: $ => prec.right(2, seq(
      repeat($.doc_comment),
      optional('comptime'),
      choice(seq(
        field('name', choice($.identifier, $.primitive_value, alias($.builtin_type, $.identifier))),
        ':',
        field('type', $._type_expression),
      ),
      // explicitly disallowing $.function_signature to avoid $.container_field matching when $._container_declaration should
      // selecting only these also prevents $.comptime_type_expression from matching
      field('name', choice($.type_expression, $.if_type_expression, $._loop_type_expression)),
      ),
      optional($.byte_alignment),
      optional(seq('=', $.expression)),
    )),

    variable_declaration: $ => seq(
      optional(choice(
        'export',
        seq('extern', optional($.string)),
      )),
      optional('threadlocal'),
      $._variable_declaration_header, // VarDeclProto
      optional(seq('=', $.expression)),
      ';',
    ),

    // VarAssignStatement
    // assignment or destructure whose LHS are all lvalue expressions or variable declarations
    variable_assignment_statement: $ => seq(
      choice(
        seq(
          $._variable_declaration_header,
          repeat(prec(1, seq(',', choice($._variable_declaration_header, $.expression)))),
        ),
        seq(
          $.expression,
          repeat1(prec(1, seq(',', choice($._variable_declaration_header, $.expression)))), 
        ),
      ),
      '=',
      $.expression,
      ';',
    ),

    _variable_declaration_header: $ => prec(1, seq(
      choice('const', 'var'),
      $.identifier,
      optional(seq(
        ':',
        field('type', $._type_expression),
      )),
      optional($.byte_alignment),
      optional($.address_space),
      optional($.link_section),
    )),

    function_declaration: $ => choice(
      seq(
        optional(choice(
          'export',
          'inline',
          'noinline',
        )),
        $._function_prototype,
        choice(
          ';',
          field('body', $.block),
        ),
      ),
      // extern fn cannot be followed by a block
      seq(
        seq('extern', optional($.string)),
        $._function_prototype,
        ';',
      ),
    ),

    _function_prototype: $ => prec.left(seq(
      'fn',
      optional(field('name', $.identifier)),
      $.parameters,
      optional($.byte_alignment),
      optional($.address_space),
      optional($.link_section),
      optional($.calling_convention),
      optional('!'),
      field('type', $._type_expression),
    )),

    parameters: $ => seq(
      '(',
      optionalCommaSep($.parameter),
      ')',
    ),

    parameter: $ => choice(
      seq(
        repeat($.doc_comment),
        optional(choice('noalias', 'comptime')),
        choice(
          seq(
            field('name', choice($.identifier, alias($.builtin_type, $.identifier))),
            ':',
            field('type', choice($.type_expression, $._special_primary_type_expression, 'anytype')),
          ),
          field('name', choice($.type_expression, $._special_primary_type_expression, 'anytype')),
        ),
      ),
      '...',
    ),

    using_namespace_declaration: $ => seq(
      'usingnamespace',
      $.expression,
      ';',
    ),

    block: $ => seq(
      '{',
      repeat($._block_statement),
      '}',
    ),

    struct_declaration: $ => seq(
      optional(choice('extern', 'packed')),
      'struct',
      optional(seq('(', $.expression, ')')),
      '{',
      $._container_members,
      '}',
    ),

    opaque_declaration: $ => seq(
      optional(choice('extern', 'packed')),
      'opaque',
      '{',
      $._container_members,
      '}',
    ),

    enum_declaration: $ => seq(
      optional(choice('extern', 'packed')),
      'enum',
      optional(seq('(', $.expression, ')')),
      '{',
      $._container_members,
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
      $._container_members,
      '}',
    ),

    error_set_declaration: $ => seq(
      'error',
      '{',
      optionalCommaSep($.identifier),
      '}',
    ),

    _block_statement: $ => choice(
      $._statement,
      $.defer_statement,
      $.errdefer_statement,
      seq(optional('comptime'), alias($.variable_assignment_statement, $.variable_declaration)),
    ),

    _statement: $ => prec(3, choice(
      $.if_statement,
      $._labeled_statement,
      $.nosuspend_statement,
      $.comptime_statement,
      $.suspend_statement,
      seq(optional('comptime'), $._assignment_expression, ';'),
    )),

    comptime_statement: $ => prec(2, seq('comptime', $._block_expression)),

    nosuspend_statement: $ => prec(3, seq('nosuspend', $._block_expr_statement)),

    suspend_statement: $ => seq('suspend', $._block_expr_statement),

    defer_statement: $ => seq('defer', $._block_expr_statement),

    errdefer_statement: $ => seq('errdefer', optional($.payload), $._block_expr_statement),

    _block_expr_statement: $ => prec(1, choice(
      $._block_expression,
      seq($._assignment_expression, ';'),
    )),

    _block_expression: $ => prec(1, seq(optional($.block_label), $.block)),

    _labeled_statement: $ => prec(4, seq(
      optional($.block_label),
      choice($.block, $._loop_statement, $.switch_expression),
    )),

    if_statement: $ => prec(5, seq(
      $._if_prefix,
      $._conditional_body_else_payload,
    )),

    _if_prefix: $ => seq(
      'if',
      '(',
      field('condition', $.expression),
      ')',
      optional($.payload),
    ),

    else_clause: $ => seq(
      'else',
      field('alternative', $._statement),
    ),

    _else_clause_payload: $ => seq(
      'else',
      optional($.payload),
      field('alternative', $._statement),
    ),

    _loop_statement: $ => seq(
      optional('inline'),
      choice($.for_statement, $.while_statement),
    ),

    for_statement: $ => seq(
      $._for_prefix,
      $._conditional_body,
    ),

    _for_prefix: $ => seq(
      'for',
      '(',
      optionalCommaSep(seq(
        $.expression,
        optional(seq('..', optional($.expression))),
      )),
      ')',
      $.payload,
    ),

    while_statement: $ => seq(
      $._while_prefix,
      $._conditional_body_else_payload,
    ),

    _while_prefix: $ => seq(
      'while',
      '(',
      field('condition', $.expression),
      ')',
      optional($.payload),
      optional(seq(':', '(', $._assignment_expression, ')')),
    ),

    _conditional_body: $ => prec.left(5, choice(
      seq(
        field('body', $._block_expression),
        optional($.else_clause),
      ),
      seq(
        // force a conflict with $.if_expression
        field('body', choice($._assignment_expression, $.expression)),
        choice(';', $.else_clause),
      ),
    )),

    _conditional_body_else_payload: $ => prec.left(5, choice(
      seq(
        field('body', $._block_expression),
        optional(alias($._else_clause_payload, $.else_clause)),
      ),
      seq(
        // force a conflict with $.if_expression
        field('body', choice($._assignment_expression, $.expression)),
        choice(';', alias($._else_clause_payload, $.else_clause)),
      ),
    )),

    payload: $ => seq('|', optionalCommaSep1(seq(optional('*'), $.identifier)), '|'),

    byte_alignment: $ => seq('align', '(', $.expression, ')'),

    bit_alignment: $ => seq('align', '(', $.expression, optional(seq(':', $.expression, ':', $.expression)), ')'),

    address_space: $ => seq('addrspace', '(', $.expression, ')'),

    link_section: $ => seq('linksection', '(', $.expression, ')'),

    calling_convention: $ => seq('callconv', '(', $.expression, ')'),

    expression: $ => prec.right(choice(
      $.unary_expression,
      $.binary_expression,
      $.try_expression, // special case of unary_expression
      $.catch_expression, // special case of binary expression
      $.primary_expression,
    )),

    primary_expression: $ => prec.right(choice(
      $.asm_expression,
      $.if_expression,
      $.break_expression,
      $.comptime_expression,
      $.nosuspend_expression,
      $.continue_expression,
      $.async_expression,
      $.await_expression,
      $.resume_expression,
      $.return_expression,
      $.for_expression,
      $.while_expression,
      $.braced_expression,
      $.type_expression,
      $.block,
    )),

    braced_expression: $ => seq(
      $._type_expression,
      $.initializer_list,
    ),

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
      $.string,
      '(',
      choice(seq('->', $._type_expression), $.identifier),
      ')',
    ),
    asm_input: $ => seq(':', optionalCommaSep($.asm_input_item), optional($.asm_clobbers)),
    asm_input_item: $ => seq(
      '[',
      $.identifier,
      ']',
      $.string,
      '(',
      $.expression,
      ')',
    ),
    asm_clobbers: $ => seq(':', optionalCommaSep(choice($.string, $.multiline_string))),

    if_expression: $ => prec.left(2, seq(
      $._if_prefix,
      // force a conflict with $.if_type_expression
      choice($.expression, $._type_expression),
      optional(seq('else', optional($.payload), $.expression)),
    )),

    for_expression: $ => prec.right(2, seq(
      optional($.block_label),
      optional('inline'),
      $._for_prefix,
      $.expression,
      optional(seq('else', $.expression)),
    )),

    while_expression: $ => prec.right(2, seq(
      optional($.block_label),
      optional('inline'),
      $._while_prefix,
      $.expression,
      optional(seq('else', optional($.payload), $.expression)),
    )),

    _assignment_expression: $ => prec(1, choice(
      $.expression,
      alias($._simple_assignment_expression, $.assignment_expression),
      alias($._destructure_assignment_expression, $.assignment_expression),
    )),

    _simple_assignment_expression: $ => seq(
      field('left', $.expression),
      field('operator', choice(
        '=', '*=', '*%=', '*|=', '/=', '%=',
        '+=', '+%=', '+|=', '-=', '-%=', '-|=',
        '<<=', '<<|=', '>>=', '&=', '^=', '|=',
      )),
      field('right', $.expression),
    ),

    _destructure_assignment_expression: $ => seq(
      field('left', $._expression_list),
      field('operator', '='),
      field('right', $.expression),
    ),

    _expression_list: $ => seq($.expression, repeat1(seq(',', $.expression))),

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
          // @ts-ignore:
          field('operator', operator),
          field('right', $.expression),
        ));
      }));
    },

    comptime_expression: $ => prec.right(seq('comptime', $.expression)),

    async_expression: $ => prec.right(1, seq('async', $.expression)),

    await_expression: $ => prec.right(1, seq('await', $.expression)),

    nosuspend_expression: $ => prec.right(seq('nosuspend', $.expression)),

    continue_expression: $ => prec.right(1, seq(
      'continue',
      optional($.break_label),
      optional($.expression),
    )),

    resume_expression: $ => prec.right(1, seq('resume', $.expression)),

    return_expression: $ => prec.right(1, seq('return', optional($.expression))),

    break_expression: $ => prec.right(1, seq(
      'break',
      optional($.break_label),
      optional($.expression),
    )),

    try_expression: $ => prec.left(PREC.UNARY, seq('try', $.expression)),

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
      optionalCommaSep($.switch_case), // SwtichProngList
      '}',
    ),

    // SwitchProng
    switch_case: $ => seq(
      optional('inline'),
      $._switch_case_exp,
      '=>',
      optional($.payload),
      // SingleAssignExpr
      choice(
        $.expression,
        alias($._simple_assignment_expression, $.assignment_expression),
      ),
    ),

    _switch_case_exp: $ => seq(
      choice(
        optionalCommaSep1(seq($.expression, optional(seq('...', $.expression)))),
        'else',
      ),
    ),

    type_expression: $ => prec.right(choice(
      // Have PrefixTypeOp
      $.nullable_type,
      $.anyframe_type,
      $.slice_type,
      $.pointer_type,
      $.array_type,
      // Do not have PrefixTypeOp
      $.error_union_type,
      $.suffix_expression,
      $.primary_type_expression,
    )),

    _type_expression: $ => choice(
      $.type_expression,
      $._special_primary_type_expression,
    ),

    _special_primary_type_expression: $ => choice(
      $.if_type_expression,
      $._loop_type_expression,
      $.function_signature,
      $.comptime_type_expression,
    ),

    suffix_expression: $ => prec.right(PREC.MEMBER, seq(
      // where the head is just an identifier and the next node is `(arguments)`
      // this is a non-method function call
      field('head', $.primary_type_expression),
      repeat1(choice(
        field('arguments', $.arguments),
        alias($._index_suffix, $.index_expression),
        alias($._range_suffix, $.range_expression),
        alias($._field_suffix, $.field_expression),
        '.*',
        '.?',
      )),
    )),

    primary_type_expression: $ => choice(
      $.builtin_function,
      $.character,
      $.struct_declaration,
      $.opaque_declaration,
      $.enum_declaration,
      $.union_declaration,
      $.anonymous_struct_initializer, // DOT InitList
      $.error_set_declaration,
      $.parenthesized_expression,
      $.labeled_block_expression,
      $.switch_expression,
      alias($._field_suffix, $.field_expression), // DOT IDENTIFIER
      $.identifier,
      $.primitive_value, // Technically should be IDENTIFIER, but this way they can be highlighted separately
      $.float,
      $.integer,
      $.error_type, // KEYWORD_error DOT IDENTIFIER
      'anyframe',
      'unreachable',
      $.string,
      $.multiline_string,
      $.builtin_type,
    ),

    function_signature: $ => prec.right($._function_prototype),

    nullable_type: $ => prec(1, seq(
      '?',
      $._type_expression,
    )),

    anyframe_type: $ => prec(1, seq(
      'anyframe',
      '->',
      $._type_expression,
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
      $._type_expression,
    )),

    pointer_type: $ => choice(
      $._single_pointer_type,
      $._many_pointer_type,
    ),

    _single_pointer_type: $ => prec.right(1, seq(
      choice('*', '**'),
      repeat(choice(
        $.address_space,
        $.bit_alignment,
        'const',
        'volatile',
        'allowzero',
      )),
      $._type_expression,
    )),

    _many_pointer_type: $ => prec.right(1, seq(
      seq('[', '*', optional(choice('c', seq(':', $.expression))), ']'),
      repeat(choice(
        $.address_space,
        $.byte_alignment,
        'const',
        'volatile',
        'allowzero',
      )),
      $._type_expression,
    )),

    array_type: $ => prec(1, seq(
      '[',
      $.expression,
      optional(seq(':', $.expression)),
      ']',
      $._type_expression,
    )),

    error_union_type: $ => prec.right(seq(
      field('error', choice($.suffix_expression, $.primary_type_expression)),
      '!',
      field('ok', $._type_expression),
    )),

    _field_suffix: $ => seq(
      '.',
      field('member', $.identifier),
    ),

    _index_suffix: $ => seq(
      '[',
      field('index', $.expression),
      optional(seq(':', field('sentinel', $.expression))),
      ']',
    ),

    _range_suffix: $ => seq(
      '[',
      field('left', $.expression),
      '..',
      optional(field('right', $.expression)),
      ']',
    ),

    anonymous_struct_initializer: $ => seq('.', $.initializer_list),

    initializer_list: $ => seq(
      '{',
      choice(
        optionalCommaSep($.field_initializer),
        optionalCommaSep($.expression),
      ),
      '}',
    ),

    field_initializer: $ => seq(
      '.',
      $.identifier,
      '=',
      $.expression,
    ),

    labeled_block_expression: $ => seq($.block_label, $.block),

    _loop_type_expression: $ => choice(
      $.for_type_expression,
      $.while_type_expression,
    ),

    comptime_type_expression: $ => prec.right(1, seq('comptime', $._type_expression)),

    if_type_expression: $ => prec.right(1, seq(
      $._if_prefix,
      $._type_expression,
      optional(seq('else', optional($.payload), $._type_expression)),
    )),

    for_type_expression: $ => prec.right(1, seq(
      optional($.block_label),
      optional('inline'),
      $._for_prefix,
      $._type_expression,
      optional(seq('else', $._type_expression)),
    )),

    while_type_expression: $ => prec.right(1, seq(
      optional($.block_label),
      optional('inline'),
      $._while_prefix,
      $._type_expression,
      optional(seq('else', optional($.payload), $._type_expression)),
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

    multiline_string: _ => prec.right(repeat1(seq('\\\\', /[^\n]*/))),

    escape_sequence: _ => token(prec(1, seq(
      '\\',
      choice(
        /[^xuU]/,
        /\d{2,3}/,
        /x[0-9a-fA-F]{2,}/,
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

    builtin_type: _ => choice(...builtinTypes),

    error_type: $ => seq('error', '.', $.identifier),

    builtin_identifier: _ => /@[A-Za-z_][A-Za-z0-9_]*/,

    identifier: $ => choice($._identifier, seq('@', alias($.string, $._string))),
    _identifier: _ => /[A-Za-z_][A-Za-z0-9_]*/,
    primitive_value: $ => choice(
      'undefined',
      'null',
      $.boolean,
    ),

    container_doc_comment: $ => prec(3, seq('//!', $.doc_comment_content)),

    doc_comment: $ => prec(2, seq('///', $.doc_comment_content)),

    comment: _ => choice(
      prec(1, seq('//', /.*/)),
      // `//// ...` looks like a `doc_comment`, but it is not
      prec(4, seq('////', /.*/)),
    ),
  },
});

/**
 * Creates a rule to optionally match one or more of the rules
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
