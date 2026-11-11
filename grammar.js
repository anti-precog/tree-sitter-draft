module.exports = grammar({
  name: "draft",

  rules: {
    // ==========================================
    // 0. MAIN DOCUMENT ROOT
    // ==========================================
    document: ($) =>
      repeat(choice($.header, $.context, $.sub_context, seq($.markers, $._eol), alias($.narration, $.paragraph), alias($.quotation, $.paragraph), alias($.dialog, $.paragraph), $.asterix, $.comment)),

    // ==========================================
    // 1. HEADER
    // ==========================================
    header: ($) => seq(
      $.prefix,
      $.name
    ),

    prefix: ($) => '_',
    name: ($) => token.immediate(/[^ \t\n][^\n]*/),

    // ==========================================
    // 2. COMMENT
    // ==========================================
    comment: ($) => /[ \t]+[^\n]*\n/,

    // ==========================================
    // 3. CONTEXT
    // ==========================================
    context: ($) => /\+[^\n]*\n/,
    sub_context: ($) => /-[^\n]*\n/,

    // ==========================================
    // 4. MARKERS
    // ==========================================
    markers: ($) => seq(
      sep1(choice($.start, $.stop), seq(',', optional(' '))),
    ),

    start: ($) => seq(
      '@',
      $.namespace,
      '.',
      $.type,
    ),

    stop: ($) => seq(
      '~',
      $.namespace,
    ),

    namespace: $ => /[^.@\s,\n]+/,
    type: $ => /[^\s,\n.~]+/,

    // ==========================================
    // 5. ASTERIX
    // ==========================================
    asterix: ($) => /\*{1,3}\n/,
 
    // ==========================================
    // 6. NARRATION
    // ==========================================
    narration: ($) => seq($.text, $._eol),

    // ==========================================
    // 7. QUOTATION
    // ==========================================
    quotation: ($) => seq(
      choice(
        seq($.text, alias($._open_quote, $.quote)),
        alias($._open_quote, $.quote)
      ),
      repeat(
        choice(
          $.text,
          alias($._open_quote, $.quote)
        )
      ),
      $._eol
    ),

    // ==========================================
    // 8. DIALOGS
    // ==========================================
    dialog: ($) =>
      seq(
        repeat(
          seq(
            alias($._open_speech, $.speech),
            alias($._open_text, $.text),
          ),
        ),
        choice(
          alias($._end_speech, $.speech),
          seq(
            alias($._open_speech, $.speech),
            alias($._end_text, $.text),
          ),
        ),
      ),

    // ==========================================
    // 9. HIDDEN HELPERS
    // ==========================================
    _open_quote: ($) => seq("„", /[^„”\n]+/, "”"),
    text: ($) => /[^~@\+\-—_\t„”\n][^„”\n]*/,

    _open_speech: ($) => seq("—", /[^„”—\n]+/, "—"),
    _end_speech: ($) => seq("—", /[^„”—\n]+/, $._eol),

    _open_text: ($) => /[^\t„”—\n]+/,
    _end_text: ($) => seq(/[^\t„”—\n]+/, $._eol),

    _eol: ($) => "\n",
  },
});

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}
