import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import TrimWhitespace from "./main";
import { parseSettingAsNumber } from "./utils/utils";

export class TrimWhitespaceSettingTab extends PluginSettingTab {
	plugin: TrimWhitespace;

	constructor(app: App, plugin: TrimWhitespace) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", {
			text: "General settings",
		});

		new Setting(containerEl)
			.setName("Trim on manual save")
			.setDesc("Trim the document during manual save (ctrl / cmd + s).")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.TrimOnSave)
					.onChange(async (value) => {
						this.plugin.settings.TrimOnSave = value;
						await this.plugin.saveSettings();

						this.plugin._toggleListenerEvent(value);
					});
			});

		new Setting(containerEl)
			.setName("Auto-trim")
			.setDesc(
				"Automatically trim document when modified, according to the settings below.",
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.AutoTrimDocument)
					.onChange(async (value) => {
						this.plugin.settings.AutoTrimDocument = value;
						await this.plugin.saveSettings();

						this.plugin._toggleListenerEvent(value);
					});
			});

		new Setting(containerEl)
			.setName("Auto-trim delay (seconds)")
			.setDesc("Seconds to wait before auto-trimming.")
			.addText((value) => {
				value
					.setValue(this.plugin.settings.AutoTrimTimeout.toString())
					.onChange(async (value) => {
						const textAsNumber = parseFloat(value);

						if (isNaN(textAsNumber)) {
							new Notice(
								"Trim whitespace: Enter a valid number!",
							);
							return;
						}

						this.plugin.settings.AutoTrimTimeout = textAsNumber;
						await this.plugin.saveSettings();

						this.plugin._toggleListenerEvent(false);
						this.plugin._initializeDebouncer(textAsNumber);
						this.plugin._toggleListenerEvent(true);
					});
			});

		new Setting(containerEl)
			.setName("Preserve code blocks")
			.setDesc("Whether to preserve whitespace within code blocks.")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.PreserveCodeBlocks)
					.onChange(async (value) => {
						this.plugin.settings.PreserveCodeBlocks = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Convert non-breaking spaces")
			.setDesc(
				"Whether to convert non-breaking spaces to regular spaces.",
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.ConvertNonBreakingSpaces)
					.onChange(async (value) => {
						this.plugin.settings.ConvertNonBreakingSpaces = value;
						await this.plugin.saveSettings();
					});
			});

		containerEl.createEl("h2", {
			text: "Trimming rules",
		});

		containerEl.createEl("h3", {
			text: "Trailing characters",
		});

		new Setting(containerEl)
			.setName("Preserve checkboxes")
			.setDesc(
				"Preserve one trailing space if it's used after a checkbox.",
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.PreserveCheckboxes)
					.onChange(async (value) => {
						this.plugin.settings.PreserveCheckboxes = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Trim trailing spaces")
			.setDesc("Trim spaces at the end of each line.")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.TrimTrailingSpaces)
					.onChange(async (value) => {
						this.plugin.settings.TrimTrailingSpaces = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Trim trailing tabs")
			.setDesc("Trim tabs at the end of each line.")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.TrimTrailingTabs)
					.onChange(async (value) => {
						this.plugin.settings.TrimTrailingTabs = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Trim trailing lines")
			.setDesc("Trim empty lines at the end of the document.")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.TrimTrailingLines)
					.onChange(async (value) => {
						this.plugin.settings.TrimTrailingLines = value;
						await this.plugin.saveSettings();

						window.setTimeout(() => this.display(), 100);
					});
			});

		this.plugin.settings.TrimTrailingLines &&
			new Setting(containerEl)
				.setName("Number of trailing lines to keep")
				.setDesc(
					"How many trailing lines to keep, default 0 (e.g. POSIX uses 1)",
				)
				.addText((value) => {
					value.inputEl.setCssStyles({ maxWidth: "5rem" });
					value.inputEl.placeholder = "Min";
					value.setValue(
						this.plugin.settings.TrailingLinesKeepMin > 0
							? this.plugin.settings.TrailingLinesKeepMin.toString()
							: "",
					);
					value.onChange(async (value) => {
						parseSettingAsNumber(value)
							.then(async (number) => {
								this.plugin.settings.TrailingLinesKeepMin =
									Math.max(0, number);

								if (
									this.plugin.settings.TrailingLinesKeepMin >
									this.plugin.settings.TrailingLinesKeepMax
								)
									this.plugin.settings.TrailingLinesKeepMax =
										this.plugin.settings.TrailingLinesKeepMin;

								await this.plugin.saveSettings();
							})
							.catch(
								() =>
									new Notice(
										"Trim whitespace: Enter a valid number!",
									),
							);
					});
				})
				.addText((value) => {
					value.inputEl.setCssStyles({ maxWidth: "5rem" });
					value.inputEl.placeholder = "Max";
					value.setValue(
						this.plugin.settings.TrailingLinesKeepMax > 0
							? this.plugin.settings.TrailingLinesKeepMax.toString()
							: "",
					);
					value.onChange(async (value) => {
						parseSettingAsNumber(value)
							.then(async (number) => {
								this.plugin.settings.TrailingLinesKeepMax =
									Math.max(0, number);

								if (
									this.plugin.settings.TrailingLinesKeepMax <
									this.plugin.settings.TrailingLinesKeepMin
								)
									this.plugin.settings.TrailingLinesKeepMin =
										this.plugin.settings.TrailingLinesKeepMax;

								await this.plugin.saveSettings();
							})
							.catch(
								() =>
									new Notice(
										"Trim whitespace: Enter a valid number!",
									),
							);
					});
				});

		containerEl.createEl("h3", {
			text: "Leading characters",
		});

		new Setting(containerEl)
			.setName("Preserve indented lists")
			.setDesc(
				"Preserve leading characters if they're used for list indentation.",
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.PreserveIndentedLists)
					.onChange(async (value) => {
						this.plugin.settings.PreserveIndentedLists = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Trim leading spaces")
			.setDesc("Trim spaces at the start of each line.")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.TrimLeadingSpaces)
					.onChange(async (value) => {
						this.plugin.settings.TrimLeadingSpaces = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Trim leading tabs")
			.setDesc("Trim tabs at the start of each line.")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.TrimLeadingTabs)
					.onChange(async (value) => {
						this.plugin.settings.TrimLeadingTabs = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Trim leading lines")
			.setDesc("Trim lines at the start of the document.")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.TrimLeadingLines)
					.onChange(async (value) => {
						this.plugin.settings.TrimLeadingLines = value;
						await this.plugin.saveSettings();
					});
			});

		containerEl.createEl("h3", {
			text: "Multiple characters",
		});

		new Setting(containerEl)
			.setName("Trim multiple spaces")
			.setDesc("Trim groups of multiple inline spaces.")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.TrimMultipleSpaces)
					.onChange(async (value) => {
						this.plugin.settings.TrimMultipleSpaces = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Trim multiple tabs")
			.setDesc("Trim groups of multiple inline tabs.")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.TrimMultipleTabs)
					.onChange(async (value) => {
						this.plugin.settings.TrimMultipleTabs = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Trim multiple lines")
			.setDesc("Trim groups of multiple blank lines.")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.TrimMultipleLines)
					.onChange(async (value) => {
						this.plugin.settings.TrimMultipleLines = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
