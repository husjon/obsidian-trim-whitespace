import { TrimWhitespaceSettings } from "typings";

import getCursorFenceIndices from "./getCursorFenceIndices";
import handleTextTrim from "./trimText";

export type TrimDocumentMode =
	"trim-whole-document" | "trim-outside-active-region";
export type TrimDocumentStatus = "changed" | "unchanged";

export interface TrimDocumentInput {
	text: string;
	fromOffset: number;
	toOffset: number;
	settings: TrimWhitespaceSettings;
	mode: TrimDocumentMode;
}

export interface TrimDocumentResult {
	status: TrimDocumentStatus;
	text: string;
	fromOffset: number;
	toOffset: number;
}

function trimWholeDocument({
	text,
	fromOffset,
	toOffset,
	settings,
}: TrimDocumentInput): TrimDocumentResult {
	const isSelection = fromOffset !== toOffset;

	// Get whitespace boundaries around start of selection / cursor
	const fromCursorFenceIndices = getCursorFenceIndices(
		text,
		fromOffset,
		settings.PreserveCodeBlocks,
	);

	// Get whitespace boundaries around end of selection / cursor
	const toCursorFenceIndices = getCursorFenceIndices(
		text,
		toOffset,
		settings.PreserveCodeBlocks,
	);

	// In case the text input starts with whitespace, we'd like to know how many
	const beginningFence = getCursorFenceIndices(
		text,
		0,
		settings.PreserveCodeBlocks,
	);
	// In case the text input ends with whitespace, we'd like to know how many
	const endFence = getCursorFenceIndices(
		text,
		text.length,
		settings.PreserveCodeBlocks,
	);

	// Get relative cursor position within the whitespace boundaries
	let fromCurRel = fromOffset - fromCursorFenceIndices.start;
	// In case the whitespace boundary is at the beginning of the text, reset relative position
	if (fromCursorFenceIndices.end <= beginningFence.end) fromCurRel = 0;

	let toCurRel = toOffset - toCursorFenceIndices.start;
	// In case the whitespace boundary is at the end of the text, reset relative position
	// if (toCursorFenceIndices.start <= endFence.start) fromCurRel = 0;

	// Handle input text from the beginning up to the start of the selection fence
	const section1 = text.slice(0, fromCursorFenceIndices.start) + "X"; // "X" appended to maintain leading and trailing whitespace
	const section1Trimmed = handleTextTrim(section1, {
		...settings,
		TrailingLinesKeepMax: 0, // we do not want any new trailing lines to be added
	}).slice(0, -1);

	// Handle input text spanning the start selection fence
	const section2 =
		"X" + // "X" prepended to maintain leading and trailing whitespace
		text.slice(fromCursorFenceIndices.start, fromCursorFenceIndices.end) +
		"X"; // "X" appended to maintain leading and trailing whitespace
	const section2Trimmed = handleTextTrim(section2, {
		...settings,
		TrailingLinesKeepMax: 0, // we do not want any new trailing lines to be added
	}).slice(1, -1);

	// Handle input text spanning the end selection fence
	const section3 =
		"X" + // "X" prepended to maintain leading and trailing whitespace
		text.slice(fromCursorFenceIndices.end, toCursorFenceIndices.start) +
		"X"; // "X" appended to maintain leading and trailing whitespace
	const section3Trimmed = handleTextTrim(section3, {
		...settings,
		TrailingLinesKeepMax: 0, // we do not want any new trailing lines to be added
	}).slice(1, -1);

	// Handle input text spanning the end selection fence
	const section4 =
		"X" + // "X"  prepended to maintain leading and trailing whitespace
		text.slice(
			isSelection ? toCursorFenceIndices.start : toCursorFenceIndices.end,
		);
	const section4Trimmed = handleTextTrim(section4, {
		...settings,
	}).slice(1);

	let newFromOffset =
		section1Trimmed.length + Math.min(section2Trimmed.length, fromCurRel);
	let newToOffset = isSelection // TODO: newToOffset might need to be calculated from the end instead
		? section1Trimmed.length +
			section2Trimmed.length +
			section3Trimmed.length +
			toCurRel
		: newFromOffset;

	let result = handleTextTrim(
		section1Trimmed + section2Trimmed + section3Trimmed + section4Trimmed,
		settings,
	);

	return {
		status: result === text ? "unchanged" : "changed",
		text: result,
		fromOffset: newFromOffset,
		toOffset: newToOffset,
	};
}

function trimOutsideSelection({
	text,
	fromOffset,
	toOffset,
	settings,
}: TrimDocumentInput): TrimDocumentResult {
	const isSelection = fromOffset !== toOffset;

	// Get the boundary of whitespace characters surrounding the cursor / start of selection
	const fromCursorFenceIndices = getCursorFenceIndices(
		text,
		fromOffset,
		settings.PreserveCodeBlocks,
	);

	// Get the relative cursor position of the start of the selection inside the fence
	const fromOffsetInsideFence = fromOffset - fromCursorFenceIndices.start;

	// Get the text from the very beginning to the start of the whitespace boundary
	const textBeforeCursorFence = text.slice(0, fromCursorFenceIndices.start);
	const textBeforeCursorFenceTrimmed = handleTextTrim(textBeforeCursorFence, {
		...settings,
		TrimTrailingLines: false,
		TrimLeadingLines: false,
	});

	// The new selection fromOffset with respect to the cursor fence
	let newFromOffset =
		textBeforeCursorFenceTrimmed.length + fromOffsetInsideFence;

	// Get the boundary of whitespace characters surrounding the cursor / end of selection
	const toCursorFenceIndices = getCursorFenceIndices(
		text,
		toOffset,
		settings.PreserveCodeBlocks,
	);

	// get the relative position of the end of the selection inside the fence
	const toOffsetInsideFence = toOffset - toCursorFenceIndices.start;

	const textAfterCursorFence = text.slice(
		fromCursorFenceIndices.end,
		toCursorFenceIndices.start,
	);
	const textAfterCursorFenceTrimmed = handleTextTrim(textAfterCursorFence, {
		...settings,
		TrimTrailingLines: false,
	});

	let newToOffset = isSelection
		? textAfterCursorFenceTrimmed.length + toOffsetInsideFence
		: newFromOffset;

	const textAtCursor = text.slice(
		fromCursorFenceIndices.start,
		toCursorFenceIndices.end,
	);

	const textAfterCursor = text.slice(toCursorFenceIndices.end);
	const textAfterCursorTrimmed = handleTextTrim(textAfterCursor, {
		...settings,
		TrimLeadingLines: false,
	});

	const trimmedText =
		textBeforeCursorFenceTrimmed + textAtCursor + textAfterCursorTrimmed;

	return {
		status: trimmedText == text ? "unchanged" : "changed",
		text: trimmedText,
		fromOffset: newFromOffset,
		toOffset: newToOffset,
	};
}

export function trimDocumentText(input: TrimDocumentInput): TrimDocumentResult {
	if (input.mode == "trim-outside-active-region") {
		return trimOutsideSelection(input);
	}

	return trimWholeDocument(input);
}
