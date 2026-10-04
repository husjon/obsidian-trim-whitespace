# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

---

## [Unreleased]

### Added

-

### Changed

-

### Fixed

-

<br/>

---

## [v0.5.0] - 2026/08/27

### Added

- Extend Lines to keep to work for min and max lines ([#46](https://github.com/husjon/obsidian-trim-whitespace/pull/46))

---

## [v0.4.1] - 2025/12/03

### Fixed

- Fix cursor shift ([#41](https://github.com/husjon/obsidian-trim-whitespace/issues/41))

---

## [v0.4.0] - 2025/09/28

### Added

- Option for converting non-breaking spaces ([#35](https://github.com/husjon/obsidian-trim-whitespace/issues/35))
- Option for preserving a set amount of lines at the end of the file ([#36](https://github.com/husjon/obsidian-trim-whitespace/issues/36))

### Changed

- Development: Formatting of project ([#30](https://github.com/husjon/obsidian-trim-whitespace/issues/30))
- Development: Update project setup ([#31](https://github.com/husjon/obsidian-trim-whitespace/issues/31))
- Development: Updated type signature ([#32](https://github.com/husjon/obsidian-trim-whitespace/issues/32))
- Development: Update release workflow ([#33](https://github.com/husjon/obsidian-trim-whitespace/issues/33))

### Fixed

- Trim-on-save was broken after an update to the Obsidian API ([#37](https://github.com/husjon/obsidian-trim-whitespace/issues/37))

---

## [v0.3.0] - 2023/07/30

### Added

- Jest test suite (thanks @velebit!)
- Setting to preserve leading characters if part of an indented list
- Setting to control whether `CTRL/CMD + S` trims document

### Changed

- Auto-Trim to skip currently-active text block ([\#5](https://github.com/husjon/obsidian-trim-whitespace/issues/5))
- Trimming via `CTRL/CMD + S` no longer requires Auto-Trim to be enabled ([\#12](https://github.com/husjon/obsidian-trim-whitespace/issues/12))
- "Skip Code Blocks" setting name to "Preserve Code Blocks"
- Improved detection of code blocks

### Fixed

- Trimming of indented lists ([\#9](https://github.com/husjon/obsidian-trim-whitespace/issues/9))
- Plugin not loading on iOS (thanks @velebit!) ([\#14](https://github.com/husjon/obsidian-trim-whitespace/issues/14))
- Typo in settings ([\#16](https://github.com/husjon/obsidian-trim-whitespace/issues/16))
- Issue trimming code blocks containing template literals ([\#17](https://github.com/husjon/obsidian-trim-whitespace/issues/17))

---

## [v0.2.2] - 2022/08/10

### Changed

- "Cmd/Ctrl+S" triggers auto-trim, if enabled ([\#6](https://github.com/husjon/obsidian-trim-whitespace/issues/6))

### Fixed

- "Skip code blocks" failing with multiple nearby code fences ([\#8](https://github.com/husjon/obsidian-trim-whitespace/issues/8))
- "Skip code blocks" misplacing selection cursors in documents containing code

---

## [v0.2.1] - 2022/07/24

### Fixed

- "Skip code blocks" failing if more than 10 code blocks present in document ([\#7](https://github.com/husjon/obsidian-trim-whitespace/issues/7))

---

## [v0.2.0] - 2022/07/13

### Added

- Setting to control minimum time delay between auto-trim ([\#1](https://github.com/husjon/obsidian-trim-whitespace/issues/1))
- Option to skip code blocks ([\#4](https://github.com/husjon/obsidian-trim-whitespace/issues/4))

### Changed

- Mechanism used for auto-trimming
- 'Multiple Characters' to only trim inline characters ([\#2](https://github.com/husjon/obsidian-trim-whitespace/issues/2))

### Fixed

- 'Multiple Characters' trimming within tables ([\#3](https://github.com/husjon/obsidian-trim-whitespace/issues/3))

---

## [v0.1.0] - 2022/06/27

### Added

- Initial commit!

[Unreleased]: https://github.com/husjon/obsidian-trim-whitespace/compare/main...develop
[v0.5.0]: https://github.com/husjon/obsidian-trim-whitespace/compare/0.4.1...0.5.0
[v0.4.1]: https://github.com/husjon/obsidian-trim-whitespace/compare/0.4.0...0.4.1
[v0.4.0]: https://github.com/husjon/obsidian-trim-whitespace/compare/0.3.0...0.4.0
[v0.3.0]: https://github.com/husjon/obsidian-trim-whitespace/compare/0.2.2...0.3.0
[v0.2.2]: https://github.com/husjon/obsidian-trim-whitespace/compare/0.2.1...0.2.2
[v0.2.1]: https://github.com/husjon/obsidian-trim-whitespace/compare/0.2.0...0.2.1
[v0.2.0]: https://github.com/husjon/obsidian-trim-whitespace/compare/0.1.0...0.2.0
[v0.1.0]: https://github.com/husjon/obsidian-trim-whitespace/compare/a53bdb3...0.1.0
