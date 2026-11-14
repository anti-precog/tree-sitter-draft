module.exports = grammar({
  name: "draft",

  rules: {
    // ==========================================
    // 0. MAIN DOCUMENT ROOT
    // ==========================================
    document: ($) =>
      repeat(
        choice(
          $.header,
          $.context,
          $.sub_context,
          $.comment,
          $.asterix,
          alias($.narration, $.paragraph),
          alias($.quotation, $.paragraph),
          alias($.dialog, $.paragraph),
        ),
      ),

    // ==========================================
    // 1. HEADER
    // ==========================================
    header: ($) => seq($.prefix, $.name),

    prefix: ($) => "_",
    name: ($) => token.immediate(/[^\- \t\n][^\n]*/),

    // ==========================================
    // 2. COMMENT
    // ==========================================
    comment: ($) => /[ \t]+[^\n]*\n/,

    // ==========================================
    // 2. MARKER
    // ==========================================
    //marker: ($) => /[@]+[^ \n\t]*\n/,
    marker: ($) => seq("@", optional($.namespace), $.value, $._eol),

    namespace: ($) => /[a-zA-Z0-9_-]+[:]/,
    value: ($) => /[a-zA-Z0-9_-]+/,

    // ==========================================
    // 2. CONTEXT
    // ==========================================
    context: ($) => seq("--", $.info, "--", $._eol),

    sub_context: ($) => seq("--", optional($.info), optional($.label), $._eol),

    info: ($) => token.immediate(/ [^\[\]\-\n]+/),
    label: ($) => seq("[", token.immediate(/[^\[\]\n]+/), "]"),

    // ==========================================
    // 3. ASTERIX
    // ==========================================
    asterix: ($) => /\*{1,3}\n/,

    // ==========================================
    // 4. NARRATION
    // ==========================================
    narration: ($) => seq($.text, choice($._eol, $.marker)),

    // ==========================================
    // 5. QUOTATION
    // ==========================================
    quotation: ($) =>
      seq(
        choice(
          seq($.text, alias($._open_quote, $.quote)),
          alias($._open_quote, $.quote),
        ),
        repeat(choice($.text, alias($._open_quote, $.quote))),
        choice($._eol, $.marker),
      ),

    // ==========================================
    // 6. DIALOGS
    // ==========================================
    dialog: ($) =>
      seq(
        repeat(
          seq(alias($._open_speech, $.speech), alias($._open_text, $.text)),
        ),
        choice(
          seq(alias($._open_speech, $.speech), $.marker),
          alias($._end_speech, $.speech),
          seq(
            alias($._open_speech, $.speech),
            seq(alias($._open_text, $.text), $.marker),
          ),
          seq(alias($._open_speech, $.speech), alias($._end_text, $.text)),
        ),
      ),

    // ==========================================
    // 7. HIDDEN HELPERS
    // ==========================================
    _open_quote: ($) => seq("„", /[^@„”\n]+/, "”"),
    text: ($) => /[^-@—_\t„”\n][^@„”\n]*/,

    _open_speech: ($) => seq("—", /[^@„”—\n]+/, "—"),
    _end_speech: ($) => seq("—", /[^@„”—\n]+/, $._eol),

    _open_text: ($) => /[^\t@„”—\n]+/,
    _end_text: ($) => seq(/[^\t@„”—\n]+/, $._eol),

    _eol: ($) => "\n",
  },
});
