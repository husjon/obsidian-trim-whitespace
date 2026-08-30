import {
	debounce,
	Debouncer,
	Editor,
	MarkdownView,
	Notice,
	Plugin,
} from "obsidian";

import { TrimWhitespaceSettingTab } from "./settings";
import handleTextTrim from "./utils/trimText";
import getCursorFenceIndices from "./utils/getCursorFenceIndices";
import { TrimWhitespaceSettings } from "typings";

const DEFAULT_SETTINGS: TrimWhitespaceSettings = {
	TrimOnSave: true,

	AutoTrimDocument: true,
	AutoTrimTimeout: 2.5,

	PreserveCodeBlocks: true,
	PreserveIndentedLists: true,
	ConvertNonBreakingSpaces: false,

	TrimTrailingSpaces: true,
	TrimLeadingSpaces: false,
	TrimMultipleSpaces: false,

	TrimTrailingTabs: true,
	TrimLeadingTabs: false,
	TrimMultipleTabs: false,

	TrimTrailingLines: true,
	TrimLeadingLines: false,
	TrimMultipleLines: false,

	TrailingLinesKeepMin: 0,
	TrailingLinesKeepMax: 0,
};

enum TrimTrigger {
	Command,
	Save,
	AutoTrim,
}

export default class TrimWhitespace extends Plugin {
	settings: TrimWhitespaceSettings;
	debouncedTrim: Debouncer<[], void>;

	async onload() {
		await this.loadSettings();

		// Register event to trim on save, based on option
		this._initializeDebouncer(this.settings.AutoTrimTimeout);
		this._toggleListenerEvent(this.settings.AutoTrimDocument);

		// Left ribbon button
		this.addRibbonIcon(
			"unindent-glyph",
			"Trim whitespace",
			(evt: MouseEvent) => {
				if (evt.shiftKey) {
					this.trimSelection(TrimTrigger.Command);
				} else {
					this.trimDocument(TrimTrigger.Command);
				}
			},
		);

		this.addCommand({
			id: "trim-whitespace-selection",
			name: "Remove whitespace in selection",
			editorCallback: () => this.trimSelection(TrimTrigger.Command),
		});

		this.addCommand({
			id: "trim-whitespace-document",
			name: "Remove whitespace in document",
			editorCallback: () => this.trimDocument(TrimTrigger.Command),
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TrimWhitespaceSettingTab(this.app, this));

		// Highjack ctrl+s
		const saveCommandDefinition =
			this.app.commands.commands["editor:save-file"];
		const save = saveCommandDefinition.checkCallback;

		if (typeof save === "function") {
			saveCommandDefinition.checkCallback = () => {
				if (this.settings.TrimOnSave) {
					this.trimDocument(TrimTrigger.Save);
				}

				save();
			};
		}
	}

	/**
	 * Gets the active editor, if present
	 *
	 * @return Active editor, or null
	 */
	_getEditor(): Editor | null {
		const markdownView =
			this.app.workspace.getActiveViewOfType(MarkdownView);

		if (!markdownView) {
			return null;
		}

		return markdownView.editor;
	}

	/**
	 * Initializes the auto-trim debouncer, with a given timeout frequency
	 *
	 * @param delaySeconds Timeout value debounce with
	 */
	_initializeDebouncer(delaySeconds: number): void {
		this.debouncedTrim = debounce(
			() => {
				this._toggleListenerEvent(false);
				this.trimDocument(TrimTrigger.AutoTrim);
				this._toggleListenerEvent(true);
			},
			delaySeconds * 1000,
			true,
		);
	}

	/**
	 * Enables or disables the listener
	 *
	 * @param toggle Whether to enabled or disable the listener
	 */
	_toggleListenerEvent(toggle: boolean): void {
		if (!this.debouncedTrim) {
			new Notice("Trim whitespace: Can't start auto trimmer!");
			return;
		}

		if (toggle) {
			this.registerEvent(
				this.app.workspace.on(
					"editor-change",
					this.debouncedTrim,
					this,
				),
			);
		} else {
			this.app.workspace.off("editor-change", this.debouncedTrim);
		}
	}

	/**
	 * Trims whitespace in selected text
	 *
	 * @param causedBy What triggered the trim
	 */
	trimSelection(causedBy: TrimTrigger): void {
		const editor = this._getEditor();

		if (!editor) {
			return;
		}

		const input = editor.getSelection();

		// Make sure something is selected
		if (input.length == 0) {
			new Notice("Select text to trim!");
			return;
		}

		const trimmed = handleTextTrim(input, this.settings);

		// Only process if text is different
		if (trimmed == input) {
			return;
		}

		editor.replaceSelection(trimmed);

		const toCursor = editor.posToOffset(editor.getCursor("to"));
		const toDelta = trimmed.length;
		const newFrom = toCursor - toDelta;

		editor.setSelection(
			editor.offsetToPos(newFrom),
			editor.offsetToPos(toCursor),
		);
	}

	/**
	 * Trims whitespace in document
	 *
	 * @param causedBy What triggered the trim
	 */
	trimDocument(causedBy: TrimTrigger): void {
		const editor = this._getEditor();

		if (!editor) {
			return;
		}

		const input = editor.getValue();

		const fromCursor = editor.getCursor("from");
		const fromCursorOffset = editor.posToOffset(fromCursor);

		const toCursor = editor.getCursor("to");
		const toCursorOffset = editor.posToOffset(toCursor);

		let trimmed;
		let newFromCursorOffset = fromCursorOffset;
		let newToCursorOffset = toCursorOffset;

		if (causedBy == TrimTrigger.AutoTrim) {
			// Get 'from' cursor, snapping to nearest code fence or whitespace block
			const fromCursorFenceIndices = getCursorFenceIndices(
				input,
				fromCursorOffset,
				this.settings.PreserveCodeBlocks,
			);

			// Get 'to' cursor, snapping to nearest code fence or whitespace block
			const toCursorFenceIndices = getCursorFenceIndices(
				input,
				toCursorOffset,
				this.settings.PreserveCodeBlocks,
			);

			// Get and trim the text before the cursor
			const textBeforeCursor = input.slice(
				0,
				fromCursorFenceIndices.start,
			);
			const textBeforeCursorTrimmed = handleTextTrim(
				textBeforeCursor,
				{ ...this.settings, TrimTrailingLines: false },
			);

			// Get the active text, where the cursor is
			const textAtCursor = input.slice(
				fromCursorFenceIndices.start,
				toCursorFenceIndices.end,
			);

			// Get and trim the text after the cursor
			const textAfterCursor = input.slice(toCursorFenceIndices.end);
			const textAfterCursorTrimmed = handleTextTrim(
				textAfterCursor,
				{ ...this.settings, TrimLeadingLines: false },
			);

			// Concatenate the trimmed and current text blocks
			trimmed =
				textBeforeCursorTrimmed + textAtCursor + textAfterCursorTrimmed;

			// Calculate new selection offsets
			newFromCursorOffset =
				fromCursorOffset -
				textBeforeCursor.length +
				textBeforeCursorTrimmed.length;
			newToCursorOffset =
				toCursorOffset -
				textBeforeCursor.length +
				textBeforeCursorTrimmed.length;
		} else {
			trimmed = handleTextTrim(input, this.settings);

			// Some tedium to calculate new selection start/end values
			const fromBeforeText = input.slice(0, fromCursorOffset);
			const fromBeforeTrimmed = handleTextTrim(
				fromBeforeText,
				{ ...this.settings, TrimTrailingLines: false },
			);

			const toBeforeText = input.slice(0, toCursorOffset);
			const toBeforeTrimmed = handleTextTrim(toBeforeText, this.settings);

			// Calculate new selection offsets
			newToCursorOffset = toBeforeTrimmed.length;
			newFromCursorOffset = Math.min(fromBeforeTrimmed.length, newToCursorOffset);
		}

		// Only process if text is different
		if (trimmed == input) {
			return;
		}

		editor.setValue(trimmed);
		editor.setSelection(
			editor.offsetToPos(newFromCursorOffset),
			editor.offsetToPos(newToCursorOffset),
		);
	}

	/**
	 * Loads settings from disk
	 */
	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as TrimWhitespaceSettings,
		);
	}

	/**
	 * Saves settings to disk
	 */
	async saveSettings() {
		await this.saveData(this.settings);
	}
}
