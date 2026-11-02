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
      repeat(choice($.section, $.group, $.paragraph, alias($.dialog_line, $.paragraph), $.asterix, $.comment)),

    // ==========================================
    // 1. SECTION BLOCK
    // ==========================================
    section: ($) =>
      prec.right(
        seq(
          $.title, // section title (# Chapter 69)
          repeat(choice($.group, $.paragraph, alias($.dialog_line, $.paragraph), $.asterix, $.comment)),
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
            repeat(choice($.paragraph, $.comment, alias($.dialog_line, $.paragraph), $.asterix)),
            optional(seq($.footer, $._eol)),
          ),
          seq(
            repeat(choice($.paragraph, $.comment, alias($.dialog_line, $.paragraph), $.asterix)),
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
    // 4. PARAGRAPHS WITH QUOTES
    // ==========================================
    paragraph: ($) =>
      choice(
        seq(
          alias($._open_narrative, $.narrative),
          repeat(
            seq(
              alias($._open_quote, $.quote),
              alias($._open_narrative, $.narrative)
            )
          ),
          choice(
            alias($._end_quote, $.quote),
            $._eol
          )
        ),

        seq(
          alias($._open_quote, $.quote),
          repeat(
            seq(
              alias($._open_narrative, $.narrative),
              alias($._open_quote, $.quote),
            )
          ),
          choice(
            $._eol,
            seq(alias($._open_narrative, $.narrative), $._eol),
          )
        )
      ),

    // ==========================================
    // 5. DIALOGS
    // ==========================================
    dialog_line: ($) =>
      seq(
        repeat(
          seq(
            alias($._open_dialog, $.speech),
            alias($._open_tag, $.narrative),
          ),
        ),
        choice(
          alias($._end_dialog, $.speech),
          seq(
            alias($._open_dialog, $.speech),
            alias($._end_tag, $.narrative),
          ),
        ),
      ),
    // ==========================================
    // 6. HIDDEN HELPERS
    // ==========================================
    _open_quote: ($) => seq("„", /[^„”\n]+/, "”"),
    _end_quote: ($) => seq($._open_quote, $._eol),

    _open_dialog: ($) => seq("—", /[^„”—\n]+/, "—"),
    _end_dialog: ($) => seq("—", /[^„”—\n]+/, $._eol),

    _open_tag: ($) => /[^\t>„”—\n]+/,
    _end_tag: ($) => seq(/[^\t>„”—\n]+/, $._eol),

    _open_narrative: ($) => /[^—#\t>„”\n][^„”\n]*/,
    
    _eol: ($) => "\n",
  },
});
