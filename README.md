# Trim Whitespace

[![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?color=7e6ad6&labelColor=34208c&label=Obsidian%20Downloads&query=$['obsidian-trim-whitespace'].downloads&url=https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugin-stats.json&)](obsidian://show-plugin?id=obsidian-trim-whitespace) ![GitHub stars](https://img.shields.io/github/stars/husjon/obsidian-trim-whitespace?style=flat)

Trim Whitespace trims unnecessary blank characters from your Obsidian documents. This is a common feature in code editing software, and mostly exists to pare down irksome document clutter.

> [!NOTE]
> Ownership transferred from Zack ([@zlovatt][zlovatt_profile]) on 3rd of October 2026.  
> Thank you for starting this plugin. ❤️

---

## Features

The plugin operates on three different types of whitespace, with three different targets.

### Whitespace Types

1. **Spaces** - The space character, (` `, stylised as `·`)
2. **Tabs** - The tab character, (`\t` or `	`, stylised as `→`)
3. **Lines** - Newline character, either, (`\r` or `\n`, stylised as `¬`)

### Targets

#### Trailing

Trim whitespace at the **end** of each line, or open document.

| Before                                            | After                               |
| ------------------------------------------------- | ----------------------------------- |
| <pre>Hello·World!····</pre>                       | <pre>Hello·World!</pre>             |
| <pre>Hello·World!→→→</pre>                        | <pre>Hello·World!</pre>             |
| <pre># Hello¬<br>¬<br>World!¬<br>¬<br>¬<br></pre> | <pre># Hello¬<br>¬<br>World!¬</pre> |

#### Leading

Trim whitespace at the **start** of each line, or open document.

| Before                                        | After                               |
| --------------------------------------------- | ----------------------------------- |
| <pre>····Hello·World!</pre>                   | <pre>Hello·World!</pre>             |
| <pre>→→→Hello·World!</pre>                    | <pre>Hello·World!</pre>             |
| <pre>¬<br>¬<br># Hello¬<br>¬<br>World!¬</pre> | <pre># Hello¬<br>¬<br>World!¬</pre> |

#### Multiple

Trim groups of whitespace (2 or more consecutive **inline** spaces/tabs, or **consecutive lines**)

| Before                                             | After                               |
| -------------------------------------------------- | ----------------------------------- |
| <pre>Hello···World!</pre>                          | <pre>Hello·World!</pre>             |
| <pre>Hello→→→World!</pre>                          | <pre>Hello→World!</pre>             |
| <pre># Hello¬<br>¬<br>¬<br>World!¬<br>¬<br>¬</pre> | <pre># Hello¬<br>¬<br>World!¬</pre> |

---

## Commands

- **Trim whitespace in document** trims all whitespace in the active document, according to the settings below
- **Trim whitespace in selection** trims all whitespace in the selected region in the active document, according to the settings below

Trim Whitespace also adds a ribbon button to trim document whitespace. Hold **shift** when clicking the button to trim whitespace in selection instead.

---

## Settings

| Name                        | Description                                                                     |
| --------------------------- | ------------------------------------------------------------------------------- |
| Trim on Manual Save         | **Manually trim document** with CTRL / CMD + S                                  |
| Auto-Trim                   | **Automatically trim document** when modified, according to the settings below. |
| Auto-Trim Delay             | Time to wait **in seconds** before auto-trimming.                               |
| Preserve Code Blocks        | Whether to preserve whitespace within code blocks.                              |
| Convert Non-Breaking Spaces | Whether to convert non-breaking spaces to regular spaces.                       |
| Trim Trailing Spaces        | Trim **spaces** at the **end of each line**.                                    |
| Trim Trailing Tabs          | Trim **tabs** at the **end of each line**.                                      |
| Trim Trailing Lines         | Trim **empty** lines at the **end of the document**.                            |
| Min Trailing Lines          | Minimum trailing lines to keep; lines are added when needed.                    |
| Max Trailing Lines          | Maximum trailing lines to keep; extra lines are removed.                        |
| Preserve Indented Lists     | Whether to preserve whitespace if used for list indentation.                    |
| Trim Leading Spaces         | Trim **spaces** at the **start of each line**.                                  |
| Trim Leading Tabs           | Trim **tabs** at the **start of each line**.                                    |
| Trim Leading Lines          | Trim **lines** at the **start of the document**.                                |
| Trim Multiple Spaces        | Trim **groups** of **multiple inline spaces**.                                  |
| Trim Multiple Tabs          | Trim **groups** of **multiple inline tabs**.                                    |
| Trim Multiple Lines         | Trim **groups** of **multiple blank lines**.                                    |

---

## Installation

To install, either:

1. Download from the [Obsidian Community Plugin library](obsidian://show-plugin?id=obsidian-trim-whitespace), or
2. Install manually with the zip in [Releases](http://github.com/husjon/obsidian-trim-whitespace/releases)

---

### Known Bugs

- Trimming the whole document doesn't reset cursor position properly, if the original location started before the first non-space character in the document.

---

### Contribution

Want to help develop or maintain this plugin? Please do! PRs and input extremely welcome!

---

### Credit Due

- Original author Zack ([@zlovatt][zlovatt_profile]) for starting this plugin
- Community interest sparked by [this forum post](https://forum.obsidian.md/t/trim-trailing-whitespace/17047)
- Plugin basics grokked from [@Benature](https://github.com/Benature)'s [obsidian-text-format](https://github.com/Benature/obsidian-text-format)
- Lots of support from the [Obsidian Community](https://obsidian.md/community) Discord server

[zlovatt_profile]: https://github.com/zlovatt
