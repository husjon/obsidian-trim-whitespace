import tsparser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
	...obsidianmd.configs.recommended,
	{
		files: ["**/*.ts"],
		languageOptions: {
			parser: tsparser,
			parserOptions: { project: "./tsconfig.json" },
		},

		// You can add your own configuration to override or add rules
		rules: {
			// example: turn off a rule from the recommended set
			// "obsidianmd/sample-names": "off",
			// example: add a rule not in the recommended set and set its severity
			// "obsidianmd/rule-custom-message": "off",

			"obsidianmd/settings-tab/no-manual-html-headings": "off", // TODO: Remove once Settings API is implemented
			"obsidianmd/settings-tab/prefer-setting-definitions": "off", // TODO: Remove once Settings API is implemented
		},
	},
]);
