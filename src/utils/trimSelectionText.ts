import { TrimWhitespaceSettings } from "typings";

import handleTextTrim from "./trimText";

export type TrimSelectionStatus = "changed" | "unchanged" | "empty-selection";

export interface TrimSelectionInput {
	selectedText: string;
	toOffset: number;
	settings: TrimWhitespaceSettings;
}

export interface TrimSelectionResult {
	status: TrimSelectionStatus;
	replacementText: string;
	fromOffset: number;
	toOffset: number;
}

export function trimSelectionText({
	selectedText,
	toOffset,
	settings,
}: TrimSelectionInput): TrimSelectionResult {
	if (selectedText.length == 0) {
		return {
			status: "empty-selection",
			replacementText: selectedText,
			fromOffset: toOffset,
			toOffset,
		};
	}

	const replacementText = handleTextTrim(selectedText, settings);
	const status = replacementText == selectedText ? "unchanged" : "changed";

	return {
		status,
		replacementText,
		fromOffset: toOffset - replacementText.length,
		toOffset,
	};
}
