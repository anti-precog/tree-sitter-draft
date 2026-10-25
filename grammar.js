module.exports = grammar({
  name: "draft",

  rules: {
    // ==========================================
    // 1. MAIN DOCUMENT ROOT
    // ==========================================
    document: ($) =>
      repeat(choice($.group, $.narrative, $.dialog, $.comment)),

    // ==========================================
    // 2. GROUP BLOCK (#Thread ... #)
    // ==========================================
    group: ($) =>
      prec.right(
        seq(
          alias($.start_group, $.head), // group header (e.g. # Chapter 69)
          $._eol,
          repeat(choice($.narrative, $.comment, $.dialog)), // inner groups are not permitted
          optional(seq(alias($.break_group, $.stop), $._eol)), // optional end of group by # symbol
        ),
      ),

    start_group: ($) => /#[^\n]+/, // start group symbol
    break_group: ($) => "#", // end group symbol

    // ==========================================
    // 4. COMMENTS
    // ==========================================
    comment: ($) => /[ \t]+[^>\n]*\n/, // Start with space or tabulator

    // ==========================================
    // 5. SIMPLE TEXT
    // ==========================================
    narrative: ($) => seq(/[^\t>—\n]/, optional(/[^\t>\n]+/), $._eol), // Simple line of paragraph which is not dialog

    // ==========================================
    // 5. DIALOGS
    // ==========================================
    dialog: ($) =>
      choice(
        // variant 1: Simple staement to end of line (— Hi!)
        alias($._end_dialog, $.speech),

        // variant 2: Multiple stetements cut by narratives. (— Hi — he said — what is up?)
        seq(
          repeat1(
            seq(
              alias($._open_dialog, $.speech),
              alias($._open_narrative, $.narrative),
            ),
          ),
          alias($._end_dialog, $.speech),
        ),

        // variant 3: Multiple statments with narration on the end (— Hi — he said — what is up? — he smail.)
        seq(
          repeat1(
            seq(
              alias($._open_dialog, $.speech),
              alias($._open_narrative, $.narrative),
            ),
          ),
          alias($._open_dialog, $.speech),
          alias($._end_narrative, $.narrative),
        ),

        // variant 4: One statments with narration on the end (— Hi — he said.)
        seq(
          alias($._open_dialog, $.speech),
          alias($._end_narrative, $.narrative),
        ),
      ),

    // ==========================================
    // 6. HIDDEN HELPERS
    // ==========================================
    _open_dialog: ($) => seq("—", /[^—\n]+/, "—"),
    _end_dialog: ($) => seq("—", /[^—\n]+/, $._eol),

    _open_narrative: ($) => /[^\t>—\n]+/,
    _end_narrative: ($) => seq(/[^\t>—\n]+/, $._eol),

    _eol: ($) => "\n", // End of line
  },
});
