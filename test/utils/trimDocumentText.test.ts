import { describe, expect, test } from "@jest/globals";
import { TrimWhitespaceSettings } from "typings";

import { trimDocumentText } from "../../src/utils/trimDocumentText";

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

describe("trimming document text", () => {
	test("trims the whole document and updates selection offsets", () => {
		const text = "one  \ntwo  \n";
		const result = trimDocumentText({
			text,
			fromOffset: text.indexOf("two"),
			toOffset: text.length,
			settings: { ...ALL_FALSE, TrimTrailingSpaces: true },
			mode: "trim-whole-document",
		});

		expect(result).toEqual({
			status: "changed",
			text: "one\ntwo\n",
			fromOffset: 4,
			toOffset: 8,
		});
	});

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

	test("trims outside an active text region", () => {
		const text = "one  \ntwo  \nthree  \n";
		const fromOffset = text.indexOf("two") + 1;
		const toOffset = fromOffset + 1;
		const result = trimDocumentText({
			text,
			fromOffset,
			toOffset,
			settings: { ...ALL_FALSE, TrimTrailingSpaces: true },
			mode: "trim-outside-active-region",
		});

		expect(result).toEqual({
			status: "changed",
			text: "one\ntwo\nthree\n",
			fromOffset: 5,
			toOffset: 6,
		});
	});

	test("expands the preserved region to surrounding whitespace", () => {
		const text = "one  \n\n\ntwo  \n";
		const fromOffset = text.indexOf("\n\n\n") + 1;
		const result = trimDocumentText({
			text,
			fromOffset,
			toOffset: fromOffset,
			settings: {
				...ALL_FALSE,
				TrimTrailingSpaces: true,
				TrimMultipleLines: true,
			},
			mode: "trim-outside-active-region",
		});

		expect(result).toEqual({
			status: "changed",
			text: "one  \n\n\ntwo\n",
			fromOffset: 6,
			toOffset: 6,
		});
	});
});