module.exports = grammar({
  name: "draft",

  rules: {
    document: ($) =>
      repeat(
        choice($.section, $.narrative, $.dialog, $.comment, seq($.tag, $._eol)),
      ),

    section: ($) =>
      prec.right(
        seq(
          alias($.name_section, $.name),
          $._eol,
          repeat(choice($.narrative, $.comment, $.dialog, seq($.tag, $._eol))),
          optional($.stop_section),
        ),
      ),

    name_section: ($) => />[^\n]+/,
    stop_section: ($) => "<\n",

    comment: ($) => /[ \t]+[^>\n]*\n/,
    tag: ($) => /[#]+[^\n]+/,
    narrative: ($) =>
      seq(
        /[^\t>—\n]/, // pierwszy znak NIE może być —, >, \t, \n
        optional(/[^\t>\n]+/), // reszta może zawierać — (ale nie >, \t, \n)
        $._eol,
      ),

    dialog: ($) =>
      choice(
        alias($._end_dialog, $.speech),
        seq(
          repeat1(
            seq(
              alias($._open_dialog, $.speech),
              alias($._open_narrative, $.narrative),
            ),
          ),
          alias($._end_dialog, $.speech),
        ),
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
        seq(
          alias($._open_dialog, $.speech),
          alias($._end_narrative, $.narrative),
        ),
      ),

    _open_dialog: ($) => seq("—", /[^—\n]+/, "—"),
    _end_dialog: ($) => seq("—", /[^—\n]+/, $._eol),

    _open_narrative: ($) => /[^\t>—\n]+/,
    _end_narrative: ($) => seq(/[^\t>—\n]+/, $._eol),
    _eol: ($) => "\n",
  },
});
