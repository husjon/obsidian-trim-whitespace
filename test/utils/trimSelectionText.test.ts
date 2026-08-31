import { describe, expect, test } from "@jest/globals";
import { TrimWhitespaceSettings } from "typings";

import { trimSelectionText } from "../../src/utils/trimSelectionText";

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

describe("trimming selected text", () => {
	test("reports empty selections", () => {
		const result = trimSelectionText({
			selectedText: "",
			toOffset: 12,
			settings: ALL_FALSE,
		});

		expect(result).toEqual({
			status: "empty-selection",
			replacementText: "",
			fromOffset: 12,
			toOffset: 12,
		});
	});

	test("reports unchanged selections", () => {
		const result = trimSelectionText({
			selectedText: "alpha",
			toOffset: 8,
			settings: { ...ALL_FALSE, TrimTrailingSpaces: true },
		});

		expect(result).toEqual({
			status: "unchanged",
			replacementText: "alpha",
			fromOffset: 3,
			toOffset: 8,
		});
	});

	test("trims and calculates replacement selection offsets", () => {
		const result = trimSelectionText({
			selectedText: "alpha  ",
			toOffset: 9,
			settings: { ...ALL_FALSE, TrimTrailingSpaces: true },
		});

		expect(result).toEqual({
			status: "changed",
			replacementText: "alpha",
			fromOffset: 4,
			toOffset: 9,
		});
	});
});