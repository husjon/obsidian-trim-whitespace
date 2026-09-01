import { describe, expect, test } from "@jest/globals";
import { TrimWhitespaceSettings } from "typings";

import {
	trimDocumentText,
	TrimDocumentMode,
} from "../../src/utils/trimDocumentText";

const ALL_FALSE: TrimWhitespaceSettings = {
	TrimOnSave: false,

	AutoTrimDocument: false,
	AutoTrimTimeout: 99,

	PreserveCodeBlocks: false,
	PreserveIndentedLists: false,
	ConvertNonBreakingSpaces: false,

	TrimTrailingSpaces: false,
	TrimLeadingSpaces: false,
	TrimMultipleSpaces: false,

	TrimTrailingTabs: false,
	TrimLeadingTabs: false,
	TrimMultipleTabs: false,

	TrimTrailingLines: false,
	TrimLeadingLines: false,
	TrimMultipleLines: false,

	TrailingLinesKeepMin: 0,
	TrailingLinesKeepMax: 0,
};

const TRAILING_SPACES: TrimWhitespaceSettings = {
	...ALL_FALSE,
	TrimTrailingSpaces: true,
};

const LEADING_SPACES: TrimWhitespaceSettings = {
	...ALL_FALSE,
	TrimLeadingSpaces: true,
};

const MULTIPLE_SPACES: TrimWhitespaceSettings = {
	...ALL_FALSE,
	TrimMultipleSpaces: true,
};

const LINES: TrimWhitespaceSettings = {
	...ALL_FALSE,
	TrimLeadingLines: true,
	TrimMultipleLines: true,
	TrimTrailingLines: true,
};

function keepTrailingLines(min: number, max: number): TrimWhitespaceSettings {
	return {
		...ALL_FALSE,
		TrimTrailingLines: true,
		TrailingLinesKeepMin: min,
		TrailingLinesKeepMax: max,
	};
}

/**
 * Marks up a plain text string to show cursor/selection offsets.
 *
 * Uses `|` for a bare cursor, and `[`...`]` for a selection.
 */
function renderMarked(
	text: string,
	fromOffset: number,
	toOffset: number,
): string {
	if (fromOffset == toOffset) {
		return text.slice(0, fromOffset) + "|" + text.slice(fromOffset);
	}

	return (
		text.slice(0, fromOffset) +
		"[" +
		text.slice(fromOffset, toOffset) +
		"]" +
		text.slice(toOffset)
	);
}

/**
 * Turns a marked up string into plain text and cursor/selection offsets.
 *
 * Assumes (does not check) that the input string contains either a cursor (`|`)
 * or a selection (`[`...`]`), and no other instances of `|`, `[`, or `]`.
 */
function parseMarked(marked: string): {
	text: string;
	fromOffset: number;
	toOffset: number;
} {
	const cursor = marked.indexOf("|");

	if (cursor != -1) {
		return {
			text: marked.slice(0, cursor) + marked.slice(cursor + 1),
			fromOffset: cursor,
			toOffset: cursor,
		};
	}

	const start = marked.indexOf("[");
	const end = marked.indexOf("]");

	return {
		text:
			marked.slice(0, start) +
			marked.slice(start + 1, end) +
			marked.slice(end + 1),
		fromOffset: start,
		toOffset: end - 1,
	};
}

/** Applies trimDocumentText to a marked input and checks the result. */
function expectMarked(
	marked: string,
	settings: TrimWhitespaceSettings,
	mode: TrimDocumentMode,
	expected: string,
): string {
	const parsed = parseMarked(marked);
	const result = trimDocumentText({ ...parsed, settings, mode });
	const markedResult = renderMarked(
		result.text,
		result.fromOffset,
		result.toOffset,
	);
	expect(markedResult).toEqual(expected);
	expect(result.status).toBe(
		parsed.text === result.text ? "unchanged" : "changed",
	);
	return markedResult;
}

describe("trimming document text", () => {
	test("reports unchanged whole-document trims", () => {
		const result = trimDocumentText({
			text: "one\ntwo\n",
			fromOffset: 4,
			toOffset: 7,
			settings: { ...ALL_FALSE, TrimTrailingSpaces: true },
			mode: "trim-whole-document",
		});

		expect(result).toEqual({
			status: "unchanged",
			text: "one\ntwo\n",
			fromOffset: 4,
			toOffset: 7,
		});
	});

	test.each([
		["|one  \ntwo  \nthree  \n", "|one\ntwo\nthree\n"],
		["one|  \ntwo  \nthree  \n", "one|\ntwo\nthree\n"],
		["one | \ntwo  \nthree  \n", "one|\ntwo\nthree\n"],
		["one  |\ntwo  \nthree  \n", "one|\ntwo\nthree\n"],
		["one  \n|two  \nthree  \n", "one\n|two\nthree\n"],
		["one  \nt|wo  \nthree  \n", "one\nt|wo\nthree\n"],
		["one  \ntwo|  \nthree  \n", "one\ntwo|\nthree\n"],
		["one  \ntwo | \nthree  \n", "one\ntwo|\nthree\n"],
		["one  \ntwo  |\nthree  \n", "one\ntwo|\nthree\n"],
		["one  \ntwo  \n|three  \n", "one\ntwo\n|three\n"],
		["one  \ntwo  \nthree|  \n", "one\ntwo\nthree|\n"],
		["one  \ntwo  \nthree | \n", "one\ntwo\nthree|\n"],
		["one  \ntwo  \nthree  |\n", "one\ntwo\nthree|\n"],
		["one  \ntwo  \nthree  \n|", "one\ntwo\nthree\n|"],
		["one  \n[two]  \nthree  \n", "one\n[two]\nthree\n"],
		["one  \nt[w]o  \nthree  \n", "one\nt[w]o\nthree\n"],
		["one[  \ntwo ] \nthree  \n", "one[\ntwo]\nthree\n"],
		["on[e  \ntwo  \nt]hree  \n", "on[e\ntwo\nt]hree\n"],
		["[one  \ntwo  \nthree  \n]", "[one\ntwo\nthree\n]"],
		["o[ne  \ntwo  \nthree ] \n", "o[ne\ntwo\nthree]\n"],
	])(
		"trims trailing spaces in the whole document: %j -> %j",
		(input, expected) => {
			expectMarked(
				input,
				TRAILING_SPACES,
				"trim-whole-document",
				expected,
			);
		},
	);

	test.each([
		["|one  \ntwo  \nthree  \n", "|one\ntwo\nthree\n"],
		["one|  \ntwo  \nthree  \n", "one|  \ntwo\nthree\n"],
		["one | \ntwo  \nthree  \n", "one | \ntwo\nthree\n"],
		["one  |\ntwo  \nthree  \n", "one  |\ntwo\nthree\n"],
		["one  \n|two  \nthree  \n", "one  \n|two\nthree\n"],
		["one  \nt|wo  \nthree  \n", "one\nt|wo\nthree\n"],
		["one  \ntwo|  \nthree  \n", "one\ntwo|  \nthree\n"],
		["one  \ntwo | \nthree  \n", "one\ntwo | \nthree\n"],
		["one  \ntwo  |\nthree  \n", "one\ntwo  |\nthree\n"],
		["one  \ntwo  \n|three  \n", "one\ntwo  \n|three\n"],
		["one  \ntwo  \nthree|  \n", "one\ntwo\nthree|  \n"],
		["one  \ntwo  \nthree | \n", "one\ntwo\nthree | \n"],
		["one  \ntwo  \nthree  |\n", "one\ntwo\nthree  |\n"],
		["one  \ntwo  \nthree  \n|", "one\ntwo\nthree  \n|"],
		["one  \n[two]  \nthree  \n", "one  \n[two]  \nthree\n"],
		["one  \nt[w]o  \nthree  \n", "one\nt[w]o\nthree\n"],
		["one[  \ntwo ] \nthree  \n", "one[  \ntwo ] \nthree\n"],
		["on[e  \ntwo  \nt]hree  \n", "on[e  \ntwo  \nt]hree\n"],
		["[one  \ntwo  \nthree  \n]", "[one  \ntwo  \nthree  \n]"],
		["o[ne  \ntwo  \nthree ] \n", "o[ne  \ntwo  \nthree ] \n"],
	])(
		"trims trailing spaces outside an active region: %j -> %j",
		(input, expected) => {
			expectMarked(
				input,
				TRAILING_SPACES,
				"trim-outside-active-region",
				expected,
			);
		},
	);

	test.each([
		["|  one\n  two\n  three\n", "|one\ntwo\nthree\n"],
		[" | one\n  two\n  three\n", "|one\ntwo\nthree\n"],
		["  |one\n  two\n  three\n", "|one\ntwo\nthree\n"],
		["  o|ne\n  two\n  three\n", "o|ne\ntwo\nthree\n"],
		["  one|\n  two\n  three\n", "one|\ntwo\nthree\n"],
		["  one\n|  two\n  three\n", "one\n|two\nthree\n"],
		["  one\n | two\n  three\n", "one\n|two\nthree\n"],
		["  one\n  |two\n  three\n", "one\n|two\nthree\n"],
		["  one\n  two|\n  three\n", "one\ntwo|\nthree\n"],
		["  one\n  two\n|  three\n", "one\ntwo\n|three\n"],
		["  one\n  two\n  three\n|", "one\ntwo\nthree\n|"],
		["  one\n  [two]\n  three\n", "one\n[two]\nthree\n"],
		["  one\n  t[w]o\n  three\n", "one\nt[w]o\nthree\n"],
		["  one[\n  two\n ] three\n", "one[\ntwo\n]three\n"],
		["  on[e\n  two\n  t]hree\n", "on[e\ntwo\nt]hree\n"],
		["[  one\n  two\n  three\n]", "[one\ntwo\nthree\n]"],
		[" [ one\n  two\n  thre]e\n", "[one\ntwo\nthre]e\n"],
	])(
		"trims leading spaces in the whole document: %j -> %j",
		(input, expected) => {
			expectMarked(
				input,
				LEADING_SPACES,
				"trim-whole-document",
				expected,
			);
		},
	);

	test.each([
		["|  one\n  two\n  three\n", "|  one\ntwo\nthree\n"],
		[" | one\n  two\n  three\n", " | one\ntwo\nthree\n"],
		["  |one\n  two\n  three\n", "  |one\ntwo\nthree\n"],
		["  o|ne\n  two\n  three\n", "o|ne\ntwo\nthree\n"],
		["  one|\n  two\n  three\n", "one|\n  two\nthree\n"],
		["  one\n|  two\n  three\n", "one\n|  two\nthree\n"],
		["  one\n | two\n  three\n", "one\n | two\nthree\n"],
		["  one\n  |two\n  three\n", "one\n  |two\nthree\n"],
		["  one\n  two|\n  three\n", "one\ntwo|\n  three\n"],
		["  one\n  two\n|  three\n", "one\ntwo\n|  three\n"],
		["  one\n  two\n  three\n|", "one\ntwo\nthree\n|"],
		["  one\n  [two]\n  three\n", "one\n  [two]\n  three\n"],
		["  one\n  t[w]o\n  three\n", "one\nt[w]o\nthree\n"],
		["  one[\n  two\n ] three\n", "one[\n  two\n ] three\n"],
		["  on[e\n  two\n  t]hree\n", "on[e\n  two\n  t]hree\n"],
		["[  one\n  two\n  three\n]", "[  one\n  two\n  three\n]"],
		[" [ one\n  two\n  thre]e\n", " [ one\n  two\n  thre]e\n"],
	])(
		"trims leading spaces outside an active region: %j -> %j",
		(input, expected) => {
			expectMarked(
				input,
				LEADING_SPACES,
				"trim-outside-active-region",
				expected,
			);
		},
	);

	test.each([
		[
			"|one   two\nthree   four\nfive   six\n",
			"|one two\nthree four\nfive six\n",
		],
		[
			"one|   two\nthree   four\nfive   six\n",
			"one| two\nthree four\nfive six\n",
		],
		[
			"one |  two\nthree   four\nfive   six\n",
			"one |two\nthree four\nfive six\n",
		],
		[
			"one  | two\nthree   four\nfive   six\n",
			"one |two\nthree four\nfive six\n",
		],
		[
			"one   |two\nthree   four\nfive   six\n",
			"one |two\nthree four\nfive six\n",
		],
		[
			"one   two\n|three   four\nfive   six\n",
			"one two\n|three four\nfive six\n",
		],
		[
			"one   two\nthree   four\nfive   six\n|",
			"one two\nthree four\nfive six\n|",
		],
		[
			"one   [two]\nthree   four\nfive   six\n",
			"one [two]\nthree four\nfive six\n",
		],
		[
			"[one   two\nthree   four\nfive   six\n]",
			"[one two\nthree four\nfive six\n]",
		],
	])(
		"trims multiple spaces in the whole document: %j -> %j",
		(input, expected) => {
			expectMarked(
				input,
				MULTIPLE_SPACES,
				"trim-whole-document",
				expected,
			);
		},
	);

	test.each([
		[
			"|one   two\nthree   four\nfive   six\n",
			"|one two\nthree four\nfive six\n",
		],
		[
			"one|   two\nthree   four\nfive   six\n",
			"one|   two\nthree four\nfive six\n",
		],
		[
			"one |  two\nthree   four\nfive   six\n",
			"one |  two\nthree four\nfive six\n",
		],
		[
			"one  | two\nthree   four\nfive   six\n",
			"one  | two\nthree four\nfive six\n",
		],
		[
			"one   |two\nthree   four\nfive   six\n",
			"one   |two\nthree four\nfive six\n",
		],
		[
			"one   t|wo\nthree   four\nfive   six\n",
			"one t|wo\nthree four\nfive six\n",
		],
		[
			"one   two\n|three   four\nfive   six\n",
			"one two\n|three four\nfive six\n",
		],
		[
			"one   two\nthree   four\nfive   six\n|",
			"one two\nthree four\nfive six\n|",
		],
		[
			"one   [two]\nthree   four\nfive   six\n",
			"one   [two]\nthree four\nfive six\n",
		],
		[
			"[one   two\nthree   four\nfive   six\n]",
			"[one   two\nthree   four\nfive   six\n]",
		],
	])(
		"trims multiple spaces outside an active region: %j -> %j",
		(input, expected) => {
			expectMarked(
				input,
				MULTIPLE_SPACES,
				"trim-outside-active-region",
				expected,
			);
		},
	);

	test.each([
		["|\n\n\none\n\n\ntwo\n\n\nthree\n\n\n", "|one\n\ntwo\n\nthree"],
		["\n\n\n|one\n\n\ntwo\n\n\nthree\n\n\n", "|one\n\ntwo\n\nthree"],
		["\n\n\no|ne\n\n\ntwo\n\n\nthree\n\n\n", "o|ne\n\ntwo\n\nthree"],
		["\n\n\none|\n\n\ntwo\n\n\nthree\n\n\n", "one|\n\ntwo\n\nthree"],
		["\n\n\none\n|\n\ntwo\n\n\nthree\n\n\n", "one\n|\ntwo\n\nthree"],
		["\n\n\none\n\n|\ntwo\n\n\nthree\n\n\n", "one\n\n|two\n\nthree"],
		["\n\n\none\n\n\n|two\n\n\nthree\n\n\n", "one\n\n|two\n\nthree"],
		["\n\n\none\n\n\ntwo\n\n\nthree\n\n\n|", "one\n\ntwo\n\nthree|"],
		["\n\n\none\n\n\n[two]\n\n\nthree\n\n\n", "one\n\n[two]\n\nthree"],
		["[\n\n\none\n\n\ntwo\n\n\nthree\n\n\n]", "[one\n\ntwo\n\nthree]"],
	])("trims lines in the whole document: %j -> %j", (input, expected) => {
		expectMarked(input, LINES, "trim-whole-document", expected);
	});

	test.each([
		["|\n\n\none\n\n\ntwo\n\n\nthree\n\n\n", "|\n\n\none\n\ntwo\n\nthree"],
		["\n\n\n|one\n\n\ntwo\n\n\nthree\n\n\n", "\n\n\n|one\n\ntwo\n\nthree"],
		["\n\n\no|ne\n\n\ntwo\n\n\nthree\n\n\n", "o|ne\n\ntwo\n\nthree"],
		["\n\n\none|\n\n\ntwo\n\n\nthree\n\n\n", "one|\n\n\ntwo\n\nthree"],
		["\n\n\none\n|\n\ntwo\n\n\nthree\n\n\n", "one\n|\n\ntwo\n\nthree"],
		["\n\n\none\n\n|\ntwo\n\n\nthree\n\n\n", "one\n\n|\ntwo\n\nthree"],
		["\n\n\none\n\n\n|two\n\n\nthree\n\n\n", "one\n\n\n|two\n\nthree"],
		["\n\n\none\n\n\ntwo\n\n\nthree\n\n\n|", "one\n\ntwo\n\nthree\n\n\n|"],
		["\n\n\none\n\n\n[two]\n\n\nthree\n\n\n", "one\n\n\n[two]\n\n\nthree"],
		[
			"[\n\n\none\n\n\ntwo\n\n\nthree\n\n\n]",
			"[\n\n\none\n\n\ntwo\n\n\nthree\n\n\n]",
		],
	])("trims lines outside an active region: %j -> %j", (input, expected) => {
		expectMarked(input, LINES, "trim-outside-active-region", expected);
	});

	test.each([
		[0, 0, "one\ntwo|\n\n", "one\ntwo|"],
		[0, 0, "one\ntwo\n\n|", "one\ntwo|"],
		[1, 2, "|one\ntwo\n\n\n\n\n", "|one\ntwo\n\n"],
		[1, 2, "one\nt|wo\n\n\n\n\n", "one\nt|wo\n\n"],
		[1, 2, "one\ntwo|\n\n\n\n\n", "one\ntwo|\n\n"],
		[1, 2, "one\ntwo\n|\n\n\n\n", "one\ntwo\n|\n"],
		[1, 2, "one\ntwo\n\n|\n\n\n", "one\ntwo\n\n|"],
		[1, 2, "one\ntwo\n\n\n|\n\n", "one\ntwo\n\n|"],
		[1, 2, "one\ntwo\n\n\n\n\n|", "one\ntwo\n\n|"],
		[2, 2, "one\ntwo|", "one\ntwo|\n\n"],
		[2, 2, "one\ntwo|\n", "one\ntwo|\n\n"],
		[3, 3, "one\ntwo|\n\n\n\n\n", "one\ntwo|\n\n\n"],
		[1, 2, "one\n[two]\n\n\n\n\n", "one\n[two]\n\n"],
		[1, 2, "one\nt[w]o\n\n\n\n\n", "one\nt[w]o\n\n"],
		[1, 2, "[one\ntwo\n\n\n\n\n]", "[one\ntwo\n\n]"],
	])(
		"keeps %i to %i trailing lines in the whole document: %j -> %j",
		(min, max, input, expected) => {
			expectMarked(
				input,
				keepTrailingLines(min, max),
				"trim-whole-document",
				expected,
			);
		},
	);

	test.each([
		[0, 0, "one\ntwo|\n\n", "one\ntwo|\n\n"],
		[0, 0, "one\ntwo\n\n|", "one\ntwo\n\n|"],
		[1, 2, "|one\ntwo\n\n\n\n\n", "|one\ntwo\n\n"],
		[1, 2, "one\nt|wo\n\n\n\n\n", "one\nt|wo\n\n"],
		[1, 2, "one\ntwo|\n\n\n\n\n", "one\ntwo|\n\n\n\n\n"],
		[1, 2, "one\ntwo\n|\n\n\n\n", "one\ntwo\n|\n\n\n\n"],
		[1, 2, "one\ntwo\n\n|\n\n\n", "one\ntwo\n\n|\n\n\n"],
		[1, 2, "one\ntwo\n\n\n|\n\n", "one\ntwo\n\n\n|\n\n"],
		[1, 2, "one\ntwo\n\n\n\n\n|", "one\ntwo\n\n\n\n\n|"],
		[2, 2, "one\ntwo|", "one\ntwo|"],
		[2, 2, "one\ntwo|\n", "one\ntwo|"],
		[3, 3, "one\ntwo|\n\n\n\n\n", "one\ntwo|\n\n\n\n\n"],
		[1, 2, "one\n[two]\n\n\n\n\n", "one\n[two]\n\n\n\n\n\n"],
		[1, 2, "one\nt[w]o\n\n\n\n\n", "one\nt[w]o\n\n"],
		[1, 2, "[one\ntwo\n\n\n\n\n]", "[one\ntwo\n\n\n\n\n]"],
	])(
		"keeps %i to %i trailing lines outside an active region: %j -> %j",
		(min, max, input, expected) => {
			expectMarked(
				input,
				keepTrailingLines(min, max),
				"trim-outside-active-region",
				expected,
			);
		},
	);

	const WELL_FORMED_FIXTURES = [
		["trailing spaces", "one  \ntwo  \nthree  \n", TRAILING_SPACES],
		["leading spaces", "  one\n  two\n  three\n", LEADING_SPACES],
		["multiple spaces", "one   two\nthree   four\n", MULTIPLE_SPACES],
		["lines", "\n\n\none\n\n\ntwo\n\n\nthree\n\n\n", LINES],
		["kept trailing lines", "one\ntwo\n\n\n\n\n", keepTrailingLines(1, 2)],
	];

	test.each(WELL_FORMED_FIXTURES)(
		"a cursor never becomes a selection when trimming %s in the whole document",
		(name, text, settings) => {
			for (let offset = 0; offset <= text.length; offset++) {
				const result = trimDocumentText({
					text,
					fromOffset: offset,
					toOffset: offset,
					settings,
					mode: "trim-whole-document",
				});

				expect(result.toOffset).toEqual(result.fromOffset);
				expect(result.fromOffset).toBeGreaterThanOrEqual(0);
				expect(result.fromOffset).toBeLessThanOrEqual(
					result.text.length,
				);
			}
		},
	);

	test.each(WELL_FORMED_FIXTURES)(
		"a cursor never becomes a selection when trimming %s outside active region",
		(name, text, settings) => {
			for (let offset = 0; offset <= text.length; offset++) {
				const result = trimDocumentText({
					text,
					fromOffset: offset,
					toOffset: offset,
					settings,
					mode: "trim-outside-active-region",
				});

				expect(result.toOffset).toEqual(result.fromOffset);
				expect(result.fromOffset).toBeGreaterThanOrEqual(0);
				expect(result.fromOffset).toBeLessThanOrEqual(
					result.text.length,
				);
			}
		},
	);

	test.each(WELL_FORMED_FIXTURES)(
		"a selection stays ordered and in bounds when trimming %s in the whole document",
		(name, text, settings) => {
			for (let fromOffset = 0; fromOffset <= text.length; fromOffset++) {
				for (
					let toOffset = fromOffset + 1;
					toOffset <= text.length;
					toOffset++
				) {
					const result = trimDocumentText({
						text,
						fromOffset,
						toOffset,
						settings,
						mode: "trim-whole-document",
					});

					expect(result.fromOffset).toBeGreaterThanOrEqual(0);
					expect(result.fromOffset).toBeLessThanOrEqual(
						result.toOffset,
					);
					expect(result.toOffset).toBeLessThanOrEqual(
						result.text.length,
					);
				}
			}
		},
	);

	test.each(WELL_FORMED_FIXTURES)(
		"a selection stays ordered and in bounds when trimming %s outside active region",
		(name, text, settings) => {
			for (let fromOffset = 0; fromOffset <= text.length; fromOffset++) {
				for (
					let toOffset = fromOffset + 1;
					toOffset <= text.length;
					toOffset++
				) {
					const result = trimDocumentText({
						text,
						fromOffset,
						toOffset,
						settings,
						mode: "trim-outside-active-region",
					});

					expect(result.fromOffset).toBeGreaterThanOrEqual(0);
					expect(result.fromOffset).toBeLessThanOrEqual(
						result.toOffset,
					);
					expect(result.toOffset).toBeLessThanOrEqual(
						result.text.length,
					);
				}
			}
		},
	);

	test.each(WELL_FORMED_FIXTURES)(
		"cursor offsets never move backwards when trimming %s in the whole document",
		(name, text, settings) => {
			let previousOffset = 0;

			for (let offset = 0; offset <= text.length; offset++) {
				const result = trimDocumentText({
					text,
					fromOffset: offset,
					toOffset: offset,
					settings,
					mode: "trim-whole-document",
				});

				expect(result.fromOffset).toBeGreaterThanOrEqual(
					previousOffset,
				);

				previousOffset = result.fromOffset;
			}
		},
	);
});
