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
	const trimmedText = handleTextTrim(text, settings);

	const fromBeforeText = text.slice(0, fromOffset);
	const fromBeforeTrimmed = handleTextTrim(fromBeforeText, {
		...settings,
		TrimTrailingLines: false,
	});

	const toBeforeText = text.slice(0, toOffset);
	const toBeforeTrimmed = handleTextTrim(toBeforeText, settings);

	const newToOffset = toBeforeTrimmed.length;

	return {
		status: trimmedText == text ? "unchanged" : "changed",
		text: trimmedText,
		fromOffset: Math.min(fromBeforeTrimmed.length, newToOffset),
		toOffset: newToOffset,
	};
}

function trimOutsideSelection({
	text,
	fromOffset,
	toOffset,
	settings,
}: TrimDocumentInput): TrimDocumentResult {
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

	const textBeforeCursor = text.slice(0, fromCursorFenceIndices.start);
	const textBeforeCursorTrimmed = handleTextTrim(textBeforeCursor, {
		...settings,
		TrimTrailingLines: false,
	});

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
		textBeforeCursorTrimmed + textAtCursor + textAfterCursorTrimmed;
	const cursorOffsetDelta =
		textBeforeCursorTrimmed.length - textBeforeCursor.length;

	return {
		status: trimmedText == text ? "unchanged" : "changed",
		text: trimmedText,
		fromOffset: fromOffset + cursorOffsetDelta,
		toOffset: toOffset + cursorOffsetDelta,
	};
}

export function trimDocumentText(input: TrimDocumentInput): TrimDocumentResult {
	if (input.mode == "trim-outside-active-region") {
		return trimOutsideSelection(input);
	}

	return trimWholeDocument(input);
}
