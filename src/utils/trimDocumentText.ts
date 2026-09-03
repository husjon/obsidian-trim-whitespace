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

	// Handle input text from the beginning up to the start of the selection / cursor
	const textBeforeSelection = text.slice(0, fromOffset);
	const textBeforeSelectionTrimmed = handleTextTrim(textBeforeSelection, {
		...settings,
		TrimTrailingLines: false,
		TrimLeadingLines: false,
	});
	// The new selection fromOffset is the trimmed length up to the selection
	let newFromOffset = textBeforeSelectionTrimmed.length;

	// Handle input text that is in the selection
	const textInSelection = text.slice(fromOffset, toOffset);
	let textInSelectionTrimmed = "";
	if (
		text.slice(fromOffset - 1, fromOffset) === " " ||
		text.slice(fromOffset, fromOffset + 1) === " "
	)
		textInSelectionTrimmed += " ";

	if (isSelection) {
		textInSelectionTrimmed += handleTextTrim(textInSelection, {
			...settings,
			TrimTrailingLines: false,
		});
		// Add space back in at the end if there were one
		if (
			text.slice(toOffset - 1, toOffset) === " " ||
			text.slice(toOffset, toOffset + 1) === " "
		)
			textInSelectionTrimmed += " ";
	}
	// If the selection only contains spaces, keep at most 1
	textInSelectionTrimmed = textInSelectionTrimmed.replace(/^[ ]+$/, " ");

	// The new toOffset is the trimmed text from the beginning including the selection
	let newToOffset = (textBeforeSelectionTrimmed + textInSelectionTrimmed)
		.length;

	// Use the newFromOffset as the new offset for both if we're not working with a selection.
	// This avoid accidental selections and selection shifts
	if (!isSelection) newToOffset = newFromOffset;

	// Handle input text from the end of the selection / cursor to the end of the input
	const textAfterSelection = text.slice(toOffset);
	let textAfterSelectionTrimmed = handleTextTrim(textAfterSelection, {
		...settings,
		TrimLeadingLines: false,
	});

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
