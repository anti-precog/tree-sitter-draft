# Draft TreeSitter Parser 

A TreeSitter grammar for [Draft](https://github.com/anti-precog/draft.nvim).

## Available Commands
| Command           | Result																				|
| -                 | -																						|
| `tree-sitter generate`		| Generates the parser files necessary for building
| `tree-sitter test`		| Runs a comprehensive tests suite with known edge cases
| `tree-sitter build`		| Builds a `draft.so` file that can be used by your favourite editor |

# Features
- support full formating text in [draft.nvim](https://github.com/anti-precog/draft.nvim) plugin.
- necessary for outline.nvim [external provider](https://github.com/anti-precog/outline-draft-provider.nvim)

# Structure
```
==================        ===============
Section structure         Group structure
==================        ===============

# CHAPTER                 > Group
Paragraph.                Simple paragraph.
— dialogue.                Comment.
                          — dialogue.
------                    ------

(document                 (document
  (section                  (group
    (title)                 (header)
    (narrative)               (narrative)
    (dialog                   (comment)
      (speech))))             (dialog
                                (speech))))
=======
```draft
# Section
> group header

Paragraph.
— dialog
    comment

< group footer
```

# Setup for nvim
There are two common ways to deliver parser to your nvim configuration:
1. manualy copy a `draft.so` file to nvim configuration path e.g. `.config/nvim/parser/draft.so`
2. configure [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter) to manages the parser:

nvim-treesiter configuration example:
``` lua
config = function()
    local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
    parser_config.draft = {
        install_info = {
            url = "https://github.com/anti-precog/tree-sitter-draft",
            files = { "src/parser.c" },
            branch = "main",
        },
        filetype = "draft",
    }

    vim.filetype.add({
        extension = {
            draft = "draft",
        },
    })

    require("nvim-treesitter.configs").setup({
        ensure_installed = { "draft" },
        highlight = {
            enable = true,
        },
    })
end
```

