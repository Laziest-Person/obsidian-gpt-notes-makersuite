import CommandHandler from "CommandHandler";
import { EventHandler } from "EventHandler";
import { HistoryHandler } from "HistoryHandler";
import { Editor, Menu, Modal, Notice, Plugin, View } from "obsidian";
import { PluginModal } from "PluginModal";
import { PreviewModal } from "PreviewModal";
import SettingsView, { modelsKeys } from "SettingsView";
import { GPTModelParams, GPTHistoryItem, TokenParams } from "types";
import data from "../prompts.json";

// Remember to rename these classes and interfaces!

interface GPT3_NOTES_SETTINGS {
	appName: string;
	token: string | null;
	apiUrl: string | null;
	model: string;
	tokens: number;
	temperature: number;
	topP: number;
	topK: number;
	promptHistory: GPTHistoryItem[];
	tokenParams: TokenParams;
}

export const DEFAULT_SETTINGS: GPT3_NOTES_SETTINGS = {
	appName: "GP3_NOTES",
	token: null,
	apiUrl: null,
	model: modelsKeys[0],
	tokens: 300,
	temperature: 0.8,
	topP: 0.95,
	topK: 40,
	promptHistory: [],
	tokenParams: data as TokenParams,
};

export default class GPTNotes extends Plugin {
	settings: GPT3_NOTES_SETTINGS;
	event_handler: EventHandler;
	settings_view: SettingsView;
	command_handler: CommandHandler;
	history_handler: HistoryHandler;

	// Executed when the app is first loaded
	async onload() {
		await this.loadSettings();
		console.log(this.settings);

		this.settings_view = new SettingsView(this);
		this.command_handler = new CommandHandler(this);
		this.command_handler.setup();
		this.history_handler = new HistoryHandler(this);

		this.addSettingTab(this.settings_view);
		this.registerRibbonButtons();
	}

	onunload() {}

	// Registers the ribbon button
	private registerRibbonButtons() {
		const ribbonIcon = this.addRibbonIcon(
			"bot",
			"GPT Notes",
			(evt: MouseEvent) => {
				new PluginModal(this).open();
			}
		);
	}

	showPreviewModal(modelParams: GPTModelParams, previewText: string) {
		new PreviewModal(this, modelParams, previewText).open();
	}

	// Loads the settings from memory
	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	// Save the settings after the session settings have been changed
	async saveSettings() {
		await this.saveData(this.settings);
	}
}
