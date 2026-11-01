module.exports = grammar({
  name: "draft",

  conflicts: ($) => [
    [$.document, $.group],
    [$.section, $.group],
  ],

  extras: ($) => [/[ \t]*\n/],

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
          repeat(choice($.group, $.paragraph, alias($.dialog_line, $.paragraph), $.asterix, $.comment)), // inner groups are not permitted
        ),
      ),

    title: ($) => /[#]+[^\n]*\n/, // Start with #

    // ============================ ==============
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

    header: ($) => />[^\n]*/, // start witch >
    footer: ($) => /<[^\n]*/, // start witch <

    // ==========================================
    // 4. COMMENTS
    // ==========================================
    comment: ($) => /[ \t]+[^\n]*\n/, // Start with whitespace

    // ==========================================
    // 4. SEPARATOR
    // ==========================================
    asterix: ($) => /\*{1,3}\n/,

    // ==========================================
    // 5. SIMPLE TEXT
    // ==========================================
    paragraph: ($) => alias($._end_narrative, $.narrative), // Simple line of paragraph which is not dialog

    // ==========================================
    // 7. DIALOGS
    // ==========================================
    dialog_line: ($) =>
      choice(
        // variant 1: Simple staement to end of line (— Hi!)
        alias($._end_dialog, $.speech),

        // variant 2: Multiple stetements cut by narratives. (— Hi — he said — what is up?)
        seq(
          repeat1(
            seq(
              alias($._open_dialog, $.speech),
              alias($._open_tag, $.narrative),
            ),
          ),
          alias($._end_dialog, $.speech),
        ),

        // variant 3: Multiple statments with narration on the end (— Hi — he said — what is up? — he smail.)
        seq(
          repeat1(
            seq(
              alias($._open_dialog, $.speech),
              alias($._open_tag, $.narrative),
            ),
          ),
          alias($._open_dialog, $.speech),
          alias($._end_tag, $.narrative),
        ),

        // variant 4: One statments with narration on the end (— Hi — he said.)
        seq(
          alias($._open_dialog, $.speech),
          alias($._end_tag, $.narrative),
        ),
      ),

    // ==========================================
    // 8. HIDDEN HELPERS
    // ==========================================

    _open_dialog: ($) => seq("—", /[^—\n]+/, "—"),
    _end_dialog: ($) => seq("—", /[^—\n]+/, $._eol),

    _open_tag: ($) => /[^\t>—\n]+/,
    _end_tag: ($) => seq(/[^\t>—\n]+/, $._eol),

    _end_narrative: ($) => seq(/[^—\t>\n][^\n]*/, $._eol),
    
    _eol: ($) => "\n", // End of line
  },
});
