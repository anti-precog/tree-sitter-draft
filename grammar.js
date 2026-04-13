module.exports = grammar({
  name: "draft",

  rules: {
    document: ($) =>
      repeat(choice($.group, $.narrative, $.dialog, $.comment, $._tag_group)),

    group: ($) =>
      prec.right(
        seq(
          alias($.group_data, $.head),
          $._eol,
          repeat(choice($.narrative, $.comment, $.dialog, $._tag_group)),
          optional(seq($.end, $._eol)),
        ),
      ),

    _tag_group: ($) =>
      prec.right(seq($.tags, $._eol, optional(choice($.narrative, $.dialog)))),
    tags: ($) => repeat1($.tag),

    group_data: ($) => /@[^\n]+/,
    end: ($) => "@",

    comment: ($) => /[ \t]+[^>\n]*\n/,
    tag: ($) => /[#]+[^#\n]+/,
    narrative: ($) => seq(/[^\t>—\n]/, optional(/[^\t>\n]+/), $._eol),

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
