import {
	debounce,
	Debouncer,
	Editor,
	MarkdownView,
	Notice,
	Plugin,
} from "obsidian";

import { TrimWhitespaceSettingTab } from "./settings";
import { trimDocumentText, TrimDocumentMode } from "./utils/trimDocumentText";
import { trimSelectionText } from "./utils/trimSelectionText";
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

		const toCursor = editor.posToOffset(editor.getCursor("to"));
		const result = trimSelectionText({
			selectedText: editor.getSelection(),
			toOffset: toCursor,
			settings: this.settings,
		});

		if (result.status == "empty-selection") {
			new Notice("Select text to trim!");
			return;
		}

		if (result.status == "unchanged") {
			return;
		}

		editor.replaceSelection(result.replacementText);

		editor.setSelection(
			editor.offsetToPos(result.fromOffset),
			editor.offsetToPos(result.toOffset),
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

		const mode: TrimDocumentMode =
			causedBy == TrimTrigger.AutoTrim
				? "trim-outside-active-region"
				: "trim-whole-document";
		const result = trimDocumentText({
			text: input,
			fromOffset: fromCursorOffset,
			toOffset: toCursorOffset,
			settings: this.settings,
			mode,
		});

		if (result.status == "unchanged") {
			return;
		}

		editor.setValue(result.text);
		editor.setSelection(
			editor.offsetToPos(result.fromOffset),
			editor.offsetToPos(result.toOffset),
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
