module.exports = grammar({
  name: "draft",

  rules: {
    // ==========================================
    // 0. MAIN DOCUMENT ROOT
    // ==========================================
    document: ($) =>
      repeat(choice($.header, $.main_context, $.head_context, $.foot_context, alias($.narration, $.paragraph), alias($.quotation, $.paragraph), alias($.dialog, $.paragraph), $.asterix, $.comment)),

    // ==========================================
    // 1. HEADER
    // ==========================================
    header: ($) => seq(
      $.tag,
      $.name
    ),

    tag: ($) => '_',
    name: ($) => token.immediate(/[^ \t\n][^\n]*/),

    // ==========================================
    // 2. COMMENT
    // ==========================================
    comment: ($) => /[ \t]+[^\n]*\n/,

    // ==========================================
    // 2. CONTEXT
    // ==========================================

    main_context: ($) => /#+[^\n]*\n/,
    head_context: ($) => />+[^\n]*\n/,
    foot_context: ($) => /<+[^\n]*\n/,

    // ==========================================
    // 3. ASTERIX
    // ==========================================
    asterix: ($) => /\*{1,3}\n/,
 
    // ==========================================
    // 4. NARRATION
    // ==========================================
    narration: ($) => seq($.text, $._eol),

    // ==========================================
    // 5. QUOTATION
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
    // 6. DIALOGS
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
    // 7. HIDDEN HELPERS
    // ==========================================
    _open_quote: ($) => seq("„", /[^„”\n]+/, "”"),
    text: ($) => /[^<>—_\t„”\n][^„”\n]*/,

    _open_speech: ($) => seq("—", /[^„”—\n]+/, "—"),
    _end_speech: ($) => seq("—", /[^„”—\n]+/, $._eol),

    _open_text: ($) => /[^\t„”—\n]+/,
    _end_text: ($) => seq(/[^\t„”—\n]+/, $._eol),

    _eol: ($) => "\n",
  },
});
