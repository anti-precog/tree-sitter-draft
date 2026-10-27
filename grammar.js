module.exports = grammar({
  name: "draft",

  extras: ($) => [/[ \t]*\n/],

  rules: {
    // ==========================================
    // 0. MAIN DOCUMENT ROOT
    // ==========================================
    document: ($) =>
      repeat(choice($.section, $.group, $.narrative, $.dialog, $.comment, $.summary)),

    // ==========================================
    // 1. SECTION BLOCK
    // ==========================================
    section: ($) =>
      prec.right(
        seq(
          $.title, // section title (# Chapter 69)
          repeat(choice($.group, $.narrative, $.dialog, $.comment, $.summary)), // inner groups are not permitted
        ),
      ),

    title: ($) => /[#]+[^\n]*\n/, // Start with #

    // ============================ ==============
    // 2. GROUP BLOCK
    // ==========================================
    group: ($) =>
      prec.right(
        seq(
          $.header, // group header (e.g.   Chapter 69)
          $._eol,
          repeat(choice($.narrative, $.comment, $.dialog, $.summary)), // inner groups are not permitted
          optional(seq($.footer, $._eol)), // optional end of group
        ),
      ),

    header: ($) => />[^\n]+/, // start wtich >
    footer: ($) => "~", // stop with ~

    // ==========================================
    // 4. COMMENTS
    // ==========================================
    comment: ($) => /[!?-]+[^\n]*\n/, // Start with symbols ! or ? or -

    // ==========================================
    // 5. SIMPLE TEXT
    // ==========================================
    narrative: ($) => seq(/[^—\n]/, optional(/[^\n]+/), $._eol), // Simple line of paragraph which is not dialog

    // ==========================================
    // 6. SUMMARY
    // ==========================================
    
    //_summary_wrap: ($) => seq($.summary, $._eol),
    //summary: ($) => seq("@", /[^\n]*/),

    // uwaga!:
    summary: ($) => /[@]+[^\n]*\n/, // Start with symbol @

    // ==========================================
    // 7. DIALOGS
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
    // 8. HIDDEN HELPERS
    // ==========================================
    _open_dialog: ($) => seq("—", /[^—\n]+/, "—"),
    _end_dialog: ($) => seq("—", /[^—\n]+/, $._eol),

    _open_narrative: ($) => /[^\t>—\n]+/,
    _end_narrative: ($) => seq(/[^\t>—\n]+/, $._eol),

    _eol: ($) => "\n", // End of line
  },
});
