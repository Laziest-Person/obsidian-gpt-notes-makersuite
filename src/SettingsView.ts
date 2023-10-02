import GPTNotes, { DEFAULT_SETTINGS } from "main";
import {
	ButtonComponent,
	DropdownComponent,
	Notice,
	PluginSettingTab,
	Setting,
	TextAreaComponent,
	TextComponent,
} from "obsidian";

export const modeltypes = {
	"text-bison-001-chat": "chat",
	"text-bison-001-text": "text"
};
export const modelnames = {
	"text-bison-001-chat": "text-bison-001",
	"text-bison-001-text": "text-bison-001"
};

export const modelsKeys = Object.keys(modeltypes);

export default class SettingsView extends PluginSettingTab {
	constructor(private plugin: GPTNotes) {
		super(plugin.app, plugin);
	}

	display() {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h1", { text: "GPT-3 Settings" });

		new Setting(containerEl)
			.setName("MakerSuite API Key")
			.setDesc("The token generated in your OpenAI dashboard.")
			.addText((text: TextComponent) => {
				text.setPlaceholder("Token")
					.setValue(this.plugin.settings.token || "")
					.onChange((change) => {
						this.plugin.settings.token = change;
						this.plugin.saveSettings();
					});
			})
			.addButton((button: ButtonComponent) => {
				button.setButtonText("Generate token");
				button.onClick((evt: MouseEvent) => {
					window.open("https://makersuite.google.com/app/apikey");
				});
			});

		new Setting(containerEl)
			.setName("API URL")
			.setDesc(
				"The URL to use for the API. Please note that it needs the same paths as the regular OpenAI API."
			)
			.addText((text: TextComponent) => {
				text.setPlaceholder("https://generativelanguage.googleapis.com")
					.setValue(this.plugin.settings.apiUrl || "")
					.onChange((change) => {
						this.plugin.settings.apiUrl = change;
						this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("GPT Model")
			.setDesc("The type of GPT model to use.")
			.addDropdown((dropdown: DropdownComponent) => {
				for (let model in modelsKeys) {
					dropdown.addOption(modelsKeys[model], modelsKeys[model]);
				}
				dropdown.onChange((change) => {
					this.plugin.settings.model = change;
				});
				dropdown.setValue(this.plugin.settings.model);
			});

		new Setting(containerEl)
			.setName("Temperature")
			.setDesc(
				"The amount of variation in the model (randomness)."
			)
			.addText((text: TextComponent) => {
				text.setPlaceholder("0.8")
					.setValue(this.plugin.settings.temperature.toString() || "0.8")
					.onChange((change) => {
						this.plugin.settings.temperature = parseFloat(change);
						this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("TopP")
			.setDesc(
				"Setting for TopP sampling."
			)
			.addText((text: TextComponent) => {
				text.setPlaceholder("0.95")
					.setValue(this.plugin.settings.topP.toString() || "0.95")
					.onChange((change) => {
						this.plugin.settings.topP = parseFloat(change);
						this.plugin.saveSettings();
					});
			});
		
		new Setting(containerEl)
			.setName("TopK")
			.setDesc(
				"Setting for TopP sampling."
			)
			.addText((text: TextComponent) => {
				text.setPlaceholder("40")
					.setValue(this.plugin.settings.topK.toString() || "40")
					.onChange((change) => {
						this.plugin.settings.topK = parseInt(change);
						this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Delete history")
			.setDesc("This will purge your prompt history")
			.addButton((button: ButtonComponent) => {
				button.setButtonText("Delete History");
				button.onClick((evt: MouseEvent) => {
					try {
						this.plugin.history_handler.reset();
						new Notice("History reset");
					} catch (e: any) {}
				});
			});

		new Setting(containerEl)
			.setName("Custom Prefixes")
			.setDesc("Set your custom prefixes, each on a separate line.")
			.addTextArea((textArea: TextAreaComponent) => {
				textArea.inputEl.className = "gpt_settings-text-area";
				textArea.setPlaceholder("Prefixes");
				let text = "";
				for (let i in this.plugin.settings.tokenParams.prefix) {
					let prefix = this.plugin.settings.tokenParams.prefix[i];
					text += `${prefix}\n`;
				}
				textArea.onChange((value: string) => {
					let prefixes = this.parseParams(value);
					this.plugin.settings.tokenParams.prefix = prefixes;
					this.plugin.saveSettings();
				});
				textArea.setValue(text);
			});

		new Setting(containerEl)
			.setName("Custom Postfixes")
			.setDesc("Set your custom postfixes, each on a separate line.")
			.addTextArea((textArea: TextAreaComponent) => {
				textArea.inputEl.className = "gpt_settings-text-area";
				textArea.setPlaceholder("Postfixes");
				let text = "";
				for (let i in this.plugin.settings.tokenParams.postfix) {
					let postfix = this.plugin.settings.tokenParams.postfix[i];
					text += `${postfix}\n`;
				}
				textArea.onChange((value: string) => {
					let postfixes = this.parseParams(value);
					this.plugin.settings.tokenParams.postfix = postfixes;
					this.plugin.saveSettings();
				});
				textArea.setValue(text);
			});

		new Setting(containerEl)
			.setName("Reset Defaults")
			.setDesc("Reset to plugin default settings.")
			.addButton((button: ButtonComponent) => {
				button.setButtonText("Reset to Defaults");
				button.onClick((evt: MouseEvent) => {
					try {
						this.plugin.settings = DEFAULT_SETTINGS;
						this.plugin.saveSettings();
						new Notice(
							"Default settings restored. You may need to reload the settings page."
						);
					} catch (e: any) {}
				});
			});
	}

	parseParams(text: string): string[] {
		let res = text.split("\n");
		res.remove("");
		return res;
	}
}
