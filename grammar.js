module.exports = grammar({
  name: "draft",

  conflicts: ($) => [
    [$.document, $.group],
    [$.section, $.group],
  ],

  extras: ($) => [/[ \t]+/, /\n/],

  rules: {
    // ==========================================
    // 0. MAIN DOCUMENT ROOT
    // ==========================================
    document: ($) =>
      repeat(choice($.section, $.group, $.narration, $.quotation, $.dialog, $.asterix, $.comment)),

    // ==========================================
    // 1. SECTION BLOCK
    // ==========================================
    section: ($) =>
      prec.right(
        seq(
          $.title, // section title (# Chapter 69)
          repeat(choice($.group, $.narration, $.quotation, $.dialog, $.asterix, $.comment)),
        ),
      ),

    title: ($) => /[#]+[^\n]*\n/,

    // ==========================================
    // 2. GROUP BLOCK
    // ==========================================
    group: ($) =>
      prec.right(
        choice(
          seq(
            $.header,
            $._eol,
            repeat(choice($.narration, $.quotation, $.comment, $.dialog, $.asterix)),
            optional(seq($.footer, $._eol)),
          ),
          seq(
            repeat(choice($.narration, $.quotation, $.comment, $.dialog, $.asterix)),
            $.footer,
            $._eol,
          ),
        ),
      ),

    header: ($) => />[^\n]*/,
    footer: ($) => /<[^\n]*/,

    // ==========================================
    // 3. COMMENTS & SEPARATORS
    // ==========================================
    comment: ($) => /[ \t]+[^\n]*\n/,
    asterix: ($) => /\*{1,3}\n/,

    // ==========================================
    // 4. PARAGRAPHS
    // ==========================================
    // only text, any quotes and any speech
    narration: ($) => seq($.text, $._eol),

    // at least one quote
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
    // 5. DIALOGS
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
    // 6. HIDDEN HELPERS
    // ==========================================
    _open_quote: ($) => seq("„", /[^„”\n]+/, "”"),
    text: ($) => /[^—#\t>„”\n][^„”\n]*/,

    _open_speech: ($) => seq("—", /[^„”—\n]+/, "—"),
    _end_speech: ($) => seq("—", /[^„”—\n]+/, $._eol),

    _open_text: ($) => /[^\t>„”—\n]+/,
    _end_text: ($) => seq(/[^\t>„”—\n]+/, $._eol),

    
    _eol: ($) => "\n",
  },
});
