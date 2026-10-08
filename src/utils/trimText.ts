import { TrimWhitespaceSettings } from "typings";

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
 * Trims empty lines at the end of the document
 *
 * @param str Text to trim
 * @return    Trimmed text
 */
function _trimTrailingLines(
	str: string,
	options: TrimWhitespaceSettings,
): string {
	return str.trimEnd() + "\n".repeat(options.TrailingLinesKeepMax);
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
	return str.trimStart();
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
function _trimMultipleLines(str: string): string {
	return str.replace(
		// /(?<=[^\r\n])[\r\n]+?(?=(?:\r?\n\r?\n|\r\r)[^\r\n])/gm,
		/^\s+(?=(\n|\r|$))/gm,
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
		trimmed = _trimTrailingLines(trimmed, options);
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
		trimmed = _trimMultipleLines(trimmed);
	}

	return trimmed;
}

/**
 * Trims text, skipping code blocks if applicable
 *
 * @param  text Text to trim
 * @return      Trimmed text
 */
export default function handleTextTrim(
	text: string,
	settings: TrimWhitespaceSettings,
): string {
	const skipCodeBlocks = settings.PreserveCodeBlocks;

	const pattern = new RegExp(/(`+)([\s\S]+?)\1/gm);
	const token = "\0\0TRIM_WHITESPACE_REPLACE\0\0";

	let codeblocks: RegExpMatchArray | [] = [];
	if (skipCodeBlocks) {
		// Get all codeblocks in the file
		codeblocks = text.match(pattern) || [];

		// Swap all codeblocks with token
		text = text.replace(pattern, token);
	}

	let trimmed = trimText(text, {
		...settings,
		TrailingLinesKeepMax: 0,
	});

	if (skipCodeBlocks) {
		// Get tokens form the trimmed result
		const trimmedText = Array.from(
			trimmed.matchAll(RegExp(`${token}`, "g")),
		);
		// Swap out all tokens with their respective codeblocks
		for (const [i, match] of trimmedText.entries()) {
			trimmed = trimmed.replace(match[0], codeblocks[i]);
		}
	}

	return trimmed;
}
