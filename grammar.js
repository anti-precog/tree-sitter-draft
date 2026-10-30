module.exports = grammar({
  name: "draft",
// Jawna deklaracja, że konflikty między document/section a group są celowe
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
      repeat(choice($.section, $.group, $.narrative, $.dialog, $.asterix, $.comment)),

    // ==========================================
    // 1. SECTION BLOCK
    // ==========================================
    section: ($) =>
      prec.right(
        seq(
          $.title, // section title (# Chapter 69)
          repeat(choice($.group, $.narrative, $.dialog, $.asterix, $.comment)), // inner groups are not permitted
        ),
      ),

    title: ($) => /[#]+[^\n]*\n/, // Start with #

    // ============================ ==============
    // 2. GROUP BLOCK
    // ==========================================
    group: ($) =>
      prec.right(
        choice(
          // Wariant A: Zaczyna się od nagłówka, w środku treść, opcjonalnie kończy się stopką
          seq(
            $.header,
            $._eol,
            repeat(choice($.narrative, $.comment, $.dialog, $.asterix)),
            optional(seq($.footer, $._eol)),
          ),
          // Wariant B: Nie ma nagłówka, ale JEST stopka na końcu. 
          // Klucz: zawartość grupy znajduje się PRZED stopką, ale ograniczamy ją tak, 
          // aby nie "podkradała" elementów z wyższego poziomu (document/section).
          seq(
            repeat1(choice($.narrative, $.comment, $.dialog, $.asterix)),
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
    narrative: ($) => seq(/[^ \t—*\n]/, optional(/[^\n]+/), $._eol), // Simple line of paragraph which is not dialog

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
