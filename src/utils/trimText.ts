import { TrimWhitespaceSettings } from "typings";

import {
	buildTokenReplaceMap,
	replaceSwappedTokens,
} from "./searchReplaceTokens";

/** Trailing */

/**
 * Trims trailing characters at end of each line
 *
 * @param str   Text to trim
 * @param chars Characters to trim
 * @return      Trimmed text
 */
function _trimTrailingCharacters(str: string, chars: string[]): string {
	const reg = new RegExp(`(${chars.join("|")})+$`, "gm");
	return str.replace(reg, "");
}

/**
 * Ensures the document's trailing lines match the configured limits
 *
 * @param str     Text to trim
 * @param options Preferences to control trimming
 * @return        Trimmed text
 */
function _fixTrailingLines(
	str: string,
	options: TrimWhitespaceSettings,
): string {
	const trimmed = str.replace(/\n+$/, "");
	const removedNewlines = str.slice(trimmed.length).split("\n").length - 1;
	const newlineCount = Math.min(
		Math.max(removedNewlines, options.TrailingLinesKeepMin),
		options.TrailingLinesKeepMax,
	);

	// Obsidian's internal editor always uses LF, regardless of host OS
	return trimmed + "\n".repeat(newlineCount);
}

/** Leading */

/**
 * Trims leading characters at start of each line.
 *
 * If preserveIndentedLists is true, this preserves leading space if
 * followed by a list indication character (*, -, +, or digits)
 *
 * @param str                   Text to trim
 * @param chars                 Characters to trim
 * @param preserveIndentedLists Whether to preserve indented lists
 * @return                      Trimmed text
 */
function _trimLeadingCharacters(
	str: string,
	chars: string[],
	preserveIndentedLists: boolean,
): string {
	const LIST_CHARACTERS = ["\\*", "\\-", "\\+", "\\d\\."];
	const listCharacterRegex = preserveIndentedLists
		? `(?!\\s*(${LIST_CHARACTERS.join("|")}))`
		: "";

	const reg = new RegExp(`^(${chars.join("|")})+${listCharacterRegex}`, "gm");
	return str.replace(reg, "");
}

/**
 * Trims empty lines at the start of the document
 *
 * @param str Text to trim
 * @return    Trimmed text
 */
function _trimLeadingLines(str: string): string {
	return str.replace(/^\n+/, "");
}

/** Multiple */

/**
 * Trims groups of multiple inline spaces
 *
 * @param str Text to trim
 * @return    Trimmed text
 */
function _trimMultipleSpaces(str: string): string {
	for (;;) {
		const next = str.replace(
			/([^|\n \t](?:[ \t]*\t)?) {2,}(?=(?:\t[ \t]*)?[^|\n \t])/gm,
			"$1 ",
		);
		if (next == str) {
			return str;
		}
		str = next;
	}
}

/**
 * Trims groups of multiple inline tabs
 *
 * @param str Text to trim
 * @return    Trimmed text
 */
function _trimMultipleTabs(str: string): string {
	for (;;) {
		const next = str.replace(
			/([^|\n \t](?:[ \t]* )?)\t{2,}(?=(?: [ \t]*)?[^|\n \t])/gm,
			"$1\t",
		);
		if (next == str) {
			return str;
		}
		str = next;
	}
}

/**
 * Trims groups of multiple blank lines
 *
 * @param str Text to trim
 * @return    Trimmed text
 */
function _trimMultipleLines(
	str: string,
	preserveTrailingLines: boolean,
): string {
	const trailingLineLookahead = preserveTrailingLines
		? "(?=\\r?\\n[^\\r\\n])"
		: "(?=(\\n|\\r|$))";

	return str.replace(
		// /(?<=[^\r\n])[\r\n]+?(?=(?:\r?\n\r?\n|\r\r)[^\r\n])/gm,
		// /^\s+(?=(\n|\r|$))/gm,
		new RegExp(`^\\s+${trailingLineLookahead}`, "gm"),
		"",
	);
}

/**
 * Trims text according to settings
 *
 * @param text    Text to trim
 * @param options Preferences to control trimming
 * @return        Trimmed string
 */
function trimText(text: string, options: TrimWhitespaceSettings): string {
	let trimmed = text;
	const CHAR_SPACE = " ";
	const CHAR_TAB = "\t";

	if (options.ConvertNonBreakingSpaces) {
		// replace all instances of non-breaking spaces with regular spaces
		trimmed = trimmed.replace(/\u00a0/g, " ");
	}

	if (options.TrimTrailingSpaces || options.TrimTrailingTabs) {
		const trailingCharacters = [];

		if (options.TrimTrailingSpaces) {
			trailingCharacters.push(CHAR_SPACE);
		}
		if (options.TrimTrailingTabs) {
			trailingCharacters.push(CHAR_TAB);
		}

		trimmed = _trimTrailingCharacters(trimmed, trailingCharacters);
	}

	if (options.TrimTrailingLines) {
		trimmed = _fixTrailingLines(trimmed, options);
	}

	if (options.TrimLeadingSpaces || options.TrimLeadingTabs) {
		const leadingCharacters = [];

		if (options.TrimLeadingSpaces) {
			leadingCharacters.push(CHAR_SPACE);
		}
		if (options.TrimLeadingTabs) {
			leadingCharacters.push(CHAR_TAB);
		}

		const preserveIndentedLists = options.PreserveIndentedLists;

		trimmed = _trimLeadingCharacters(
			trimmed,
			leadingCharacters,
			preserveIndentedLists,
		);
	}

	if (options.TrimLeadingLines) {
		trimmed = _trimLeadingLines(trimmed);
	}

	if (options.TrimMultipleSpaces) {
		trimmed = _trimMultipleSpaces(trimmed);
	}

	if (options.TrimMultipleTabs) {
		trimmed = _trimMultipleTabs(trimmed);
	}

	if (options.TrimMultipleLines) {
		trimmed = _trimMultipleLines(trimmed, options.TrimTrailingLines);
	}

	return trimmed;
}

/**
 * Trims text, skipping code blocks if applicable
 *
 * @param text     Text to trim
 * @param settings Preferences to control trimming
 * @return         Trimmed text
 */
export default function handleTextTrim(
	text: string,
	settings: TrimWhitespaceSettings,
): string {
	let terms: string[] = [];
	const skipCodeBlocks = settings.PreserveCodeBlocks;

	const CODE_SWAP_PREFIX = "TRIM_WHITESPACE_REPLACE_";
	const CODE_SWAP_REGEX = [
		// new RegExp(/`{3}([\s\S]+?)`{3}/gm), // markdown code fences
		// new RegExp(/`{1}([\s\S]+?)`{1}/gm), // markdown code inline
		new RegExp(/(`+)([\s\S]+?)\1/gm), // WIP improvement for arbitrary code blocks
	];

	if (skipCodeBlocks) {
		const swapData = buildTokenReplaceMap(
			text,
			CODE_SWAP_PREFIX,
			CODE_SWAP_REGEX,
		);
		text = swapData.text;
		terms = swapData.terms;
	}

	let trimmed = trimText(text, settings);

	if (skipCodeBlocks) {
		trimmed = replaceSwappedTokens(trimmed, CODE_SWAP_PREFIX, terms);
	}

	return trimmed;
}
