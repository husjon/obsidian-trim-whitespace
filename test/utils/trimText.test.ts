import { describe, expect, test } from "@jest/globals";
import { TrimWhitespaceSettings } from "typings";
import handleTextTrim from "../../src/utils/trimText";

interface TextWhitespace {
	leading?: string;
	trailing?: string;
	interParagraph?: string;
	lineLeading?: string;
	lineInternal?: string;
	lineTrailing?: string;
}

function _mkText(wsp?: TextWhitespace): string {
	const leading: string = wsp?.leading ?? "";
	const trailing: string = wsp?.trailing ?? "";
	const interParagraph: string = wsp?.interParagraph ?? "\n\n";
	const lineLeading: string = wsp?.lineLeading ?? "";
	const lineInternal: string = wsp?.lineInternal ?? " ";
	const lineTrailing: string = wsp?.lineTrailing ?? "";
	const text = `\
${leading}Sed ut perspiciatis unde omnis iste natus error sit voluptatem
${lineLeading}accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
quae ab illo inventore${lineInternal}veritatis et quasi architecto beatae
vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia${lineTrailing}
${lineLeading}voluptas sit${lineInternal}aspernatur aut odit${lineTrailing}
aut fugit.${interParagraph}Sed quia consequuntur magni dolores eos qui ratione
voluptat sequi nesciunt.

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
adipisci velit, sed quia non numquam eius modi tempora incidunt${lineTrailing}
${lineLeading}ut labore et dolore${lineInternal}magnam aliquam quaerat
voluptatem.${trailing}`;
	return text;
}

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

function _trimNothing(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
	};
	return handleTextTrim(input, settings);
}

function _trimTrailingSpacesTabs(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		TrimTrailingSpaces: true,
		TrimTrailingTabs: true,
	};
	return handleTextTrim(input, settings);
}
function _trimTrailingSpaces(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		TrimTrailingSpaces: true,
	};
	return handleTextTrim(input, settings);
}
function _trimTrailingTabs(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		TrimTrailingTabs: true,
	};
	return handleTextTrim(input, settings);
}
function _trimTrailingLines(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		TrimTrailingLines: true,
	};
	return handleTextTrim(input, settings);
}

function _convertNonBreakingSpaces(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		ConvertNonBreakingSpaces: true,
	};
	return handleTextTrim(input, settings);
}

function _trimLeadingSpacesTabsPreserveLists(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		TrimLeadingSpaces: true,
		TrimLeadingTabs: true,
		PreserveIndentedLists: true,
	};
	return handleTextTrim(input, settings);
}
function _trimLeadingSpacesPreserveLists(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		TrimLeadingSpaces: true,
		PreserveIndentedLists: true,
	};
	return handleTextTrim(input, settings);
}
function _trimLeadingTabsPreserveLists(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		TrimLeadingTabs: true,
		PreserveIndentedLists: true,
	};
	return handleTextTrim(input, settings);
}
function _trimLeadingSpacesTabs(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		TrimLeadingSpaces: true,
		TrimLeadingTabs: true,
	};
	return handleTextTrim(input, settings);
}
function _trimLeadingSpaces(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		TrimLeadingSpaces: true,
	};
	return handleTextTrim(input, settings);
}
function _trimLeadingTabs(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		TrimLeadingTabs: true,
	};
	return handleTextTrim(input, settings);
}
function _trimLeadingLines(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		TrimLeadingLines: true,
	};
	return handleTextTrim(input, settings);
}

function _trimMultipleSpacesTabs(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		TrimMultipleSpaces: true,
		TrimMultipleTabs: true,
	};
	return handleTextTrim(input, settings);
}
function _trimMultipleSpaces(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		TrimMultipleSpaces: true,
	};
	return handleTextTrim(input, settings);
}
function _trimMultipleTabs(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		TrimMultipleTabs: true,
	};
	return handleTextTrim(input, settings);
}
function _trimMultipleLines(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		TrimMultipleLines: true,
	};
	return handleTextTrim(input, settings);
}
function _trimMultipleLinesKeep3EOLs(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		TrimTrailingLines: true,
		TrailingLinesKeepMin: 3,
		TrailingLinesKeepMax: 3,
	};
	return handleTextTrim(input, settings);
}
function _trimMultipleLinesKeep1to2EOLs(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		TrimTrailingLines: true,
		TrailingLinesKeepMin: 1,
		TrailingLinesKeepMax: 2,
	};
	return handleTextTrim(input, settings);
}
function _trimMultipleLinesAndTrailingSpacesTabs(input: string): string {
	const settings: TrimWhitespaceSettings = {
		...ALL_FALSE,
		TrimMultipleLines: true,
		TrimTrailingSpaces: true,
		TrimTrailingTabs: true,
	};
	return handleTextTrim(input, settings);
}

describe("trimming trailing characters", () => {
	test("no trailing whitespace to trim", () => {
		const input = _mkText();
		expect(_trimTrailingSpacesTabs(input)).toEqual(input);
		expect(_trimTrailingSpaces(input)).toEqual(input);
		expect(_trimTrailingTabs(input)).toEqual(input);
		expect(_trimNothing(input)).toEqual(input);
	});
	test("trailing spaces to trim", () => {
		const input = _mkText({
			lineTrailing: "  ",
			lineLeading: "  ",
			lineInternal: "  ",
		});
		const trimmed = _mkText({
			lineLeading: "  ",
			lineInternal: "  ",
		});
		expect(_trimTrailingSpacesTabs(input)).toEqual(trimmed);
		expect(_trimTrailingSpaces(input)).toEqual(trimmed);
		expect(_trimTrailingTabs(input)).toEqual(input); // not trimmed!
		expect(_trimNothing(input)).toEqual(input); // not trimmed!
	});
	test("trailing tabs to trim", () => {
		const input = _mkText({
			lineTrailing: "\t\t",
			lineLeading: "\t\t",
			lineInternal: "\t\t",
		});
		const trimmed = _mkText({
			lineLeading: "\t\t",
			lineInternal: "\t\t",
		});
		expect(_trimTrailingSpacesTabs(input)).toEqual(trimmed);
		expect(_trimTrailingSpaces(input)).toEqual(input); // not trimmed!
		expect(_trimTrailingTabs(input)).toEqual(trimmed);
		expect(_trimNothing(input)).toEqual(input); // not trimmed!
	});
	test("trailing spaces and tabs to trim", () => {
		const input1 = _mkText({
			lineTrailing: " \t ",
			lineLeading: "\t ",
			lineInternal: " \t",
		});
		const input2 = _mkText({
			lineTrailing: "\t \t",
			lineLeading: "\t ",
			lineInternal: " \t",
		});
		const trimmed = _mkText({
			lineLeading: "\t ",
			lineInternal: " \t",
		});
		const input1_no_space = _mkText({
			lineTrailing: " \t",
			lineLeading: "\t ",
			lineInternal: " \t",
		});
		const input2_no_tab = _mkText({
			lineTrailing: "\t ",
			lineLeading: "\t ",
			lineInternal: " \t",
		});
		expect(_trimTrailingSpacesTabs(input1)).toEqual(trimmed);
		expect(_trimTrailingSpacesTabs(input2)).toEqual(trimmed);
		expect(_trimTrailingSpaces(input1)).toEqual(input1_no_space); // partial
		expect(_trimTrailingSpaces(input2)).toEqual(input2); // not trimmed!
		expect(_trimTrailingTabs(input1)).toEqual(input1); // not trimmed!
		expect(_trimTrailingTabs(input2)).toEqual(input2_no_tab); // partial
		expect(_trimNothing(input1)).toEqual(input1); // not trimmed!
		expect(_trimNothing(input2)).toEqual(input2); // not trimmed!
	});
});

describe("trimming trailing lines", () => {
	test("no trailing whitespace to trim", () => {
		const input = _mkText();
		expect(_trimTrailingLines(input)).toEqual(input);
	});
	test("trailing lines to trim", () => {
		const input = _mkText({
			trailing: "\n\n\n",
			lineLeading: " ",
			lineInternal: "   ",
			lineTrailing: " ",
		});
		const trimmed = _mkText({
			lineLeading: " ",
			lineInternal: "   ",
			lineTrailing: " ",
		});
		expect(_trimTrailingLines(input)).toEqual(trimmed);
		expect(_trimNothing(input)).toEqual(input); // not trimmed!
	});
	test("trailing lines to trim, keep last 3 lines", () => {
		const input = _mkText({
			trailing: "\n\n\n\n\n",
		});
		const trimmed = _mkText({
			trailing: "\n\n\n",
		});
		expect(_trimMultipleLinesKeep3EOLs(input)).toEqual(trimmed);
	});
	test("trailing lines to trim, add 3 lines", () => {
		const input = _mkText({
			trailing: "",
		});
		const trimmed = _mkText({
			trailing: "\n\n\n",
		});
		expect(_trimMultipleLinesKeep3EOLs(input)).toEqual(trimmed);
	});
	test("trailing lines to trim, keep last 2 lines (out of 1-2)", () => {
		const input = _mkText({
			trailing: "\n\n\n\n\n",
		});
		const trimmed = _mkText({
			trailing: "\n\n",
		});
		expect(_trimMultipleLinesKeep1to2EOLs(input)).toEqual(trimmed);
	});
	test("trailing lines to trim, add 1 line (out of 1-2)", () => {
		const input = _mkText({
			trailing: "",
		});
		const trimmed = _mkText({
			trailing: "\n",
		});
		expect(_trimMultipleLinesKeep1to2EOLs(input)).toEqual(trimmed);
	});
	test("trailing lines to trim, preserve 1 line (within 1-2)", () => {
		const input = _mkText({
			trailing: "\n",
		});
		expect(_trimMultipleLinesKeep1to2EOLs(input)).toEqual(input);
	});
	test("trailing mixed whitespace to trim", () => {
		const input = _mkText({
			trailing: " \n\t \r\n ",
			lineTrailing: " \t ",
			lineInternal: "   ",
			interParagraph: "\n\n \n",
			leading: " \n\n",
		});
		const trimmed = _mkText({
			lineTrailing: " \t ",
			lineInternal: "   ",
			interParagraph: "\n\n \n",
			leading: " \n\n",
		});
		expect(_trimTrailingLines(input)).toEqual(trimmed);
		expect(_trimNothing(input)).toEqual(input); // not trimmed!
	});
	test("trailing non-newline whitespace to trim", () => {
		const input = _mkText({
			trailing: "\t \t",
			lineTrailing: " \t ",
			interParagraph: "\n\n \n",
		});
		const trimmed = _mkText({
			lineTrailing: " \t ",
			interParagraph: "\n\n \n",
		});
		expect(_trimTrailingLines(input)).toEqual(trimmed);
		expect(_trimNothing(input)).toEqual(input); // not trimmed!
	});
});

describe("trimming leading characters", () => {
	test("no leading whitespace to trim", () => {
		const input = _mkText();
		expect(_trimLeadingSpacesTabs(input)).toEqual(input);
		expect(_trimLeadingSpaces(input)).toEqual(input);
		expect(_trimLeadingTabs(input)).toEqual(input);
	});
	test("leading spaces to trim", () => {
		const input = _mkText({
			lineLeading: "  ",
			lineTrailing: "  ",
			lineInternal: "  ",
		});
		const trimmed = _mkText({
			lineTrailing: "  ",
			lineInternal: "  ",
		});
		expect(_trimLeadingSpacesTabs(input)).toEqual(trimmed);
		expect(_trimLeadingSpaces(input)).toEqual(trimmed);
		expect(_trimLeadingTabs(input)).toEqual(input); // not trimmed!
	});
	test("leading lists with tabs to not trim if preserveIndentedLists enabled", () => {
		const input = _mkText().replace(/^/gm, "\t\t* ");
		const trimmed = _mkText().replace(/^/gm, "\t\t* ");
		expect(_trimLeadingSpacesTabsPreserveLists(input)).toEqual(trimmed);
		expect(_trimLeadingSpacesPreserveLists(input)).toEqual(input); // not trimmed!
		expect(_trimLeadingTabsPreserveLists(input)).toEqual(trimmed);
	});
	test("leading lists with spaces to not trim if preserveIndentedLists enabled", () => {
		const input = _mkText().replace(/^/gm, "        * ");
		const trimmed = _mkText().replace(/^/gm, "        * ");
		expect(_trimLeadingSpacesTabsPreserveLists(input)).toEqual(trimmed);
		expect(_trimLeadingSpacesPreserveLists(input)).toEqual(trimmed);
		expect(_trimLeadingTabsPreserveLists(input)).toEqual(input); // not trimmed!
	});
	test("leading ordered lists with spaces to not trim if preserveIndentedLists enabled", () => {
		const input = _mkText().replace(/^/gm, "        1. ");
		const trimmed = _mkText().replace(/^/gm, "        1. ");
		expect(_trimLeadingSpacesTabsPreserveLists(input)).toEqual(trimmed);
		expect(_trimLeadingSpacesPreserveLists(input)).toEqual(trimmed);
		expect(_trimLeadingTabsPreserveLists(input)).toEqual(input); // not trimmed!
	});
	test("leading lists with tabs to trim if preserveIndentedLists disabled", () => {
		const input = _mkText().replace(/^/gm, "\t\t* ");
		const trimmed = _mkText().replace(/^/gm, "* ");
		expect(_trimLeadingSpacesTabs(input)).toEqual(trimmed);
		expect(_trimLeadingSpaces(input)).toEqual(input); // not trimmed!
		expect(_trimLeadingTabs(input)).toEqual(trimmed);
	});
	test("leading lists with spaces to trim if preserveIndentedLists disabled", () => {
		const input = _mkText().replace(/^/gm, "        * ");
		const trimmed = _mkText().replace(/^/gm, "* ");
		expect(_trimLeadingSpacesTabs(input)).toEqual(trimmed);
		expect(_trimLeadingSpaces(input)).toEqual(trimmed);
		expect(_trimLeadingTabs(input)).toEqual(input); // not trimmed!
	});
	test("leading ordered lists with spaces to trim if preserveIndentedLists disabled", () => {
		const input = _mkText().replace(/^/gm, "        1. ");
		const trimmed = _mkText().replace(/^/gm, "1. ");
		expect(_trimLeadingSpacesTabs(input)).toEqual(trimmed);
		expect(_trimLeadingSpaces(input)).toEqual(trimmed);
		expect(_trimLeadingTabs(input)).toEqual(input); // not trimmed!
	});
	test("leading tabs to trim", () => {
		const input = _mkText({
			lineLeading: "\t\t",
			lineTrailing: "\t\t",
			lineInternal: "\t\t",
		});
		const trimmed = _mkText({
			lineTrailing: "\t\t",
			lineInternal: "\t\t",
		});
		expect(_trimLeadingSpacesTabs(input)).toEqual(trimmed);
		expect(_trimLeadingSpaces(input)).toEqual(input); // not trimmed!
		expect(_trimLeadingTabs(input)).toEqual(trimmed);
	});
	test("leading spaces and tabs to trim", () => {
		const input1 = _mkText({
			lineLeading: " \t ",
			lineTrailing: " \t",
			lineInternal: "\t ",
		});
		const input2 = _mkText({
			lineLeading: "\t \t",
			lineTrailing: " \t",
			lineInternal: "\t ",
		});
		const trimmed = _mkText({
			lineTrailing: " \t",
			lineInternal: "\t ",
		});
		const input1_no_space = _mkText({
			lineLeading: "\t ",
			lineTrailing: " \t",
			lineInternal: "\t ",
		});
		const input2_no_tab = _mkText({
			lineLeading: " \t",
			lineTrailing: " \t",
			lineInternal: "\t ",
		});
		expect(_trimLeadingSpacesTabs(input1)).toEqual(trimmed);
		expect(_trimLeadingSpacesTabs(input2)).toEqual(trimmed);
		expect(_trimLeadingSpaces(input1)).toEqual(input1_no_space); // partial
		expect(_trimLeadingSpaces(input2)).toEqual(input2); // not trimmed!
		expect(_trimLeadingTabs(input1)).toEqual(input1); // not trimmed!
		expect(_trimLeadingTabs(input2)).toEqual(input2_no_tab); // partial
	});
});

describe("trimming leading lines", () => {
	test("no leading whitespace to trim", () => {
		const input = _mkText();
		expect(_trimLeadingLines(input)).toEqual(input);
	});
	test("leading lines to trim", () => {
		const input = _mkText({
			leading: "\n\n\n",
			lineLeading: " ",
			lineInternal: "   ",
			lineTrailing: " ",
		});
		const trimmed = _mkText({
			lineLeading: " ",
			lineInternal: "   ",
			lineTrailing: " ",
		});
		expect(_trimLeadingLines(input)).toEqual(trimmed);
	});
	test("leading mixed whitespace to trim", () => {
		const input = _mkText({
			leading: " \n\t \r\n ",
			lineLeading: " \t ",
			lineInternal: "   ",
			interParagraph: "\n\n \n",
			trailing: "\n \n",
		});
		const trimmed = _mkText({
			lineLeading: " \t ",
			lineInternal: "   ",
			interParagraph: "\n\n \n",
			trailing: "\n \n",
		});
		expect(_trimLeadingLines(input)).toEqual(trimmed);
	});
	test("leading non-newline whitespace to trim", () => {
		const input = _mkText({
			leading: "\t \t",
			lineLeading: " \t ",
			interParagraph: "\n\n \n",
		});
		const trimmed = _mkText({
			lineLeading: " \t ",
			interParagraph: "\n\n \n",
		});
		expect(_trimLeadingLines(input)).toEqual(trimmed);
	});
});

describe("trimming multiple characters", () => {
	test("no multiple whitespace to trim", () => {
		const input = _mkText();
		expect(_trimMultipleSpacesTabs(input)).toEqual(input);
		expect(_trimMultipleSpaces(input)).toEqual(input);
		expect(_trimMultipleTabs(input)).toEqual(input);
	});
	test("multiple spaces to trim", () => {
		const input = _mkText({
			lineInternal: "  ",
			lineLeading: "  ",
			lineTrailing: "  ",
		});
		const trimmed = _mkText({
			lineLeading: "  ",
			lineTrailing: "  ",
		});
		expect(_trimMultipleSpacesTabs(input)).toEqual(trimmed);
		expect(_trimMultipleSpaces(input)).toEqual(trimmed);
		expect(_trimMultipleTabs(input)).toEqual(input); // not trimmed!
	});
	test("multiple tabs to trim", () => {
		const input = _mkText({
			lineInternal: "\t\t",
			lineLeading: "\t\t",
			lineTrailing: "\t\t",
		});
		const trimmed = _mkText({
			lineInternal: "\t",
			lineLeading: "\t\t",
			lineTrailing: "\t\t",
		});
		expect(_trimMultipleSpacesTabs(input)).toEqual(trimmed);
		expect(_trimMultipleSpaces(input)).toEqual(input); // not trimmed!
		expect(_trimMultipleTabs(input)).toEqual(trimmed);
	});
	test("multiple spaces and tabs to trim", () => {
		// Note: An adjacent mix of spaces and tabs consolidates just each
		//   sequence of spaces into a space, and each sequence of tabs into a
		//   tab. Maybe there should be an option for collapsing further?
		const input1 = _mkText({
			lineInternal: "\t\t  ",
			lineLeading: "\t\t  ",
			lineTrailing: "  \t\t",
		});
		const trimmed1 = _mkText({
			lineInternal: "\t ",
			lineLeading: "\t\t  ",
			lineTrailing: "  \t\t",
		});
		const trimSpc1 = _mkText({
			lineInternal: "\t\t ",
			lineLeading: "\t\t  ",
			lineTrailing: "  \t\t",
		});
		const trimTab1 = _mkText({
			lineInternal: "\t  ",
			lineLeading: "\t\t  ",
			lineTrailing: "  \t\t",
		});
		const input2 = _mkText({
			lineInternal: "  \t\t",
			lineLeading: "  \t\t",
			lineTrailing: "\t\t  ",
		});
		const trimmed2 = _mkText({
			lineInternal: " \t",
			lineLeading: "  \t\t",
			lineTrailing: "\t\t  ",
		});
		const trimSpc2 = _mkText({
			lineInternal: " \t\t",
			lineLeading: "  \t\t",
			lineTrailing: "\t\t  ",
		});
		const trimTab2 = _mkText({
			lineInternal: "  \t",
			lineLeading: "  \t\t",
			lineTrailing: "\t\t  ",
		});
		expect(_trimMultipleSpacesTabs(input1)).toEqual(trimmed1);
		expect(_trimMultipleSpacesTabs(input2)).toEqual(trimmed2);
		expect(_trimMultipleSpaces(input1)).toEqual(trimSpc1); // partial
		expect(_trimMultipleSpaces(input2)).toEqual(trimSpc2); // partial
		expect(_trimMultipleTabs(input1)).toEqual(trimTab1); // partial
		expect(_trimMultipleTabs(input2)).toEqual(trimTab2); // partial
	});
	test("multiple mixed spaces and tabs to trim", () => {
		// Note: An adjacent mix of spaces and tabs consolidates just each
		//   sequence of spaces into a space, and each sequence of tabs into a
		//   tab. Maybe there should be an option for collapsing further?
		const input1 = _mkText({
			lineInternal: "\t\t  \t\t  ",
			lineLeading: "\t\t  \t\t  ",
			lineTrailing: "  \t\t  \t\t",
		});
		const trimmed1 = _mkText({
			lineInternal: "\t \t ",
			lineLeading: "\t\t  \t\t  ",
			lineTrailing: "  \t\t  \t\t",
		});
		const trimSpc1 = _mkText({
			lineInternal: "\t\t \t\t ",
			lineLeading: "\t\t  \t\t  ",
			lineTrailing: "  \t\t  \t\t",
		});
		const trimTab1 = _mkText({
			lineInternal: "\t  \t  ",
			lineLeading: "\t\t  \t\t  ",
			lineTrailing: "  \t\t  \t\t",
		});
		const input2 = _mkText({
			lineInternal: "  \t\t  \t\t",
			lineLeading: "  \t\t  \t\t",
			lineTrailing: "\t\t  \t\t  ",
		});
		const trimmed2 = _mkText({
			lineInternal: " \t \t",
			lineLeading: "  \t\t  \t\t",
			lineTrailing: "\t\t  \t\t  ",
		});
		const trimSpc2 = _mkText({
			lineInternal: " \t\t \t\t",
			lineLeading: "  \t\t  \t\t",
			lineTrailing: "\t\t  \t\t  ",
		});
		const trimTab2 = _mkText({
			lineInternal: "  \t  \t",
			lineLeading: "  \t\t  \t\t",
			lineTrailing: "\t\t  \t\t  ",
		});
		expect(_trimMultipleSpacesTabs(input1)).toEqual(trimmed1);
		expect(_trimMultipleSpacesTabs(input2)).toEqual(trimmed2);
		expect(_trimMultipleSpaces(input1)).toEqual(trimSpc1); // partial
		expect(_trimMultipleSpaces(input2)).toEqual(trimSpc2); // partial
		expect(_trimMultipleTabs(input1)).toEqual(trimTab1); // partial
		expect(_trimMultipleTabs(input2)).toEqual(trimTab2); // partial
	});
});

describe("trimming multiple lines", () => {
	test("no multiple whitespace to trim", () => {
		const input = _mkText();
		expect(_trimMultipleLines(input)).toEqual(input);
	});
	test("multiple lines to trim", () => {
		const input = _mkText({
			interParagraph: "\n\n\n",
			lineLeading: " ",
			lineInternal: "   ",
			lineTrailing: " ",
		});
		const trimmed = _mkText({
			lineLeading: " ",
			lineInternal: "   ",
			lineTrailing: " ",
		});
		expect(_trimMultipleLines(input)).toEqual(trimmed);
	});
	test("multiple mixed whitespace to trim", () => {
		const input = _mkText({
			interParagraph: "\n\t \n\n\n",
			lineLeading: " \t ",
			lineInternal: "   ",
			leading: "\n\n \n",
			trailing: "\n \n\n",
		});
		const trimmed = _mkText({
			lineLeading: " \t ",
			lineInternal: "   ",
			leading: "\n",
			trailing: "\n",
		});
		// Note: Right now, TrimMultipleLines removes groups of lines
		//   that have trailing whitespace even when TrimTrailingSpaces
		//   and TrimTrailingTabs are false. It also consolidates (but
		//   does not fully remove) leading and training lines.
		expect(_trimMultipleLines(input)).toEqual(trimmed);
		expect(_trimMultipleLinesAndTrailingSpacesTabs(input)).toEqual(trimmed);
	});
});

describe("conversion of non-breaking space characters", () => {
	test("convert with no trimming", () => {
		const input = _mkText({
			leading: "\u00a0".repeat(5),
			trailing: "\u00a0".repeat(5),
			interParagraph: "\u00a0".repeat(5),
			lineLeading: "\u00a0".repeat(5),
			lineInternal: "\u00a0".repeat(5),
			lineTrailing: "\u00a0".repeat(5),
		});
		const trimmed = _mkText({
			leading: " ".repeat(5),
			trailing: " ".repeat(5),
			interParagraph: " ".repeat(5),
			lineLeading: " ".repeat(5),
			lineInternal: " ".repeat(5),
			lineTrailing: " ".repeat(5),
		});
		expect(_convertNonBreakingSpaces(input)).toEqual(trimmed);
	});
});

describe("trimming (unimplemented)", () => {
	test.todo("code blocks");
});
