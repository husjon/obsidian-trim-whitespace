export interface TrimWhitespaceSettings {
	TrimOnSave: boolean;

	AutoTrimDocument: boolean;
	AutoTrimTimeout: number;

	PreserveCodeBlocks: boolean;
	PreserveIndentedLists: boolean;
	PreserveCheckboxes: boolean;
	ConvertNonBreakingSpaces: boolean;

	TrimTrailingSpaces: boolean;
	TrimLeadingSpaces: boolean;
	TrimMultipleSpaces: boolean;

	TrimTrailingTabs: boolean;
	TrimLeadingTabs: boolean;
	TrimMultipleTabs: boolean;

	TrimTrailingLines: boolean;
	TrimLeadingLines: boolean;
	TrimMultipleLines: boolean;

	TrailingLinesKeepMin: number;
	TrailingLinesKeepMax: number;
}

export interface TokenReplaceMap {
	text: string;
	terms: string[];
}

declare module "obsidian" {
	interface App {
		commands: {
			commands: {
				"editor:save-file": { checkCallback: () => void };
			};
		};
	}
}
