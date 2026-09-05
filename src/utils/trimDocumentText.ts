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

	const fromCursorFenceIndices = getCursorFenceIndices(
		text,
		fromOffset,
		settings.PreserveCodeBlocks,
	);

	const toCursorFenceIndices = getCursorFenceIndices(
		text,
		toOffset,
		settings.PreserveCodeBlocks,
	);

	// Handle input text from the beginning up to the end selection fence
	const textBeforeSelection = text.slice(0, fromCursorFenceIndices.end) + "X"; // extra character added to force trailing lines to be retained
	let textBeforeSelectionTrimmed = handleTextTrim(textBeforeSelection, {
		...settings,
		TrailingLinesKeepMax: 0, // we do not want any new trailing lines to be added
	}).slice(0, -1); // extra character stripped off

	// Handle input text from the beginning up to the end selection fence
	const textInSelection =
		"X" + // extra character added to force leading characters to be retained
		text.slice(fromCursorFenceIndices.start, toCursorFenceIndices.end) +
		"X"; // extra character added to force trailing characters to be retained
	let textInSelectionTrimmed = handleTextTrim(textInSelection, {
		...settings,
		TrailingLinesKeepMax: 0, // we do not want any new trailing lines to be added
	}).slice(1, -1); // extra character stripped off

	// Handle input text from the end of the selection / cursor to the end of the input
	const textAfterSelection =
		"X" + // extra character added to force leading characters to be retained
		text.slice(toCursorFenceIndices.start);
	let textAfterSelectionTrimmed = handleTextTrim(
		textAfterSelection,
		settings,
	).slice(1);

	// strip of characters that are overlapping between the selections
	if (
		textBeforeSelectionTrimmed.slice(-1) ===
		textInSelectionTrimmed.slice(0, 1)
	)
		textBeforeSelectionTrimmed = textBeforeSelectionTrimmed.slice(0, -1);

	if (textAfterSelectionTrimmed.slice(0) === textInSelectionTrimmed.slice(-1))
		textAfterSelectionTrimmed = textAfterSelectionTrimmed.slice(1);

	// Calculate the new offsets based on the trimmed lengths
	const newFromOffset = textBeforeSelectionTrimmed.length;
	const newToOffset =
		fromOffset === toOffset
			? newFromOffset
			: newFromOffset + textInSelectionTrimmed.length;

	// Combine all 3 text sections
	const result =
		textBeforeSelectionTrimmed +
		textInSelectionTrimmed +
		textAfterSelectionTrimmed;

	return {
		status: result === text ? "unchanged" : "changed",
		text: handleTextTrim(result, settings),
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
