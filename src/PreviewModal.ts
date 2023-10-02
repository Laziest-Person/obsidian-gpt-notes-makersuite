import { GPTModel } from "GPT3";
import {
	ButtonComponent,
	MarkdownView,
	Modal,
	Notice,
	TextAreaComponent,
} from "obsidian";
import GPT3Notes from "main";
import { GPTModelParams } from "types";
import { modeltypes } from "SettingsView";
import { PluginModal } from "PluginModal";

export class PreviewModal extends Modal {
	previewText: string;
	previewTextArea: TextAreaComponent;
	regenerateButton: ButtonComponent;

	constructor(
		private plugin: GPT3Notes,
		private modelParams: GPTModelParams,
		private modelResponse: string
	) {
		super(plugin.app);
		this.previewText = modelResponse;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.setText("Preview GPT Note");

		const container = contentEl.createDiv();
		container.className = "gpt_preview-container";

		// const text: string = this.modelResponse.choices[0].text as string;
		// this.previewText = text.slice(2, text.length);

		this.previewTextArea = new TextAreaComponent(container);
		this.previewTextArea.inputEl.className = "gpt_preview-textarea";
		this.previewTextArea.setPlaceholder("Loading...");
		this.previewTextArea.onChange((change: string) => {
			this.previewText = change;
		});

		if(this.previewText){
			this.previewTextArea.setValue(this.previewText);
		}

		const buttonContainer = contentEl.createDiv();
		buttonContainer.className = "gpt_preview-button-container";

		const cancelButton = new ButtonComponent(buttonContainer);
		cancelButton.buttonEl.style.backgroundColor = "#b33939";
		cancelButton.buttonEl.style.marginRight = "auto";
		cancelButton.setButtonText("Go Back").onClick(() => {
			this.close();
			new PluginModal(this.plugin, { loadLastItem: true }).open();
		});

		this.regenerateButton = new ButtonComponent(buttonContainer);
		this.regenerateButton.buttonEl.style.backgroundColor = "#218c74";
		this.regenerateButton.setButtonText("Regenerate").onClick(() => {
			this.handleRegenerateClick().then((response: any) => {
				if (response) {
					this.previewTextArea.setValue(response);
				}
			});
		});

		const addToDocumentButton = new ButtonComponent(buttonContainer);
		addToDocumentButton.buttonEl.style.backgroundColor = "#218c74";
		addToDocumentButton.setButtonText("Add to document").onClick(() => {
			const view =
				this.plugin.app.workspace.getActiveViewOfType(MarkdownView);

			if (view) {
				this.close();
				let newText =
					view.editor.getSelection().length > 0
						? view.editor.getSelection() + "\n\n" + this.previewText
						: this.previewText;
				view.editor.replaceSelection(newText);
			}
		});

	}

	onClose(): void {}

	async handleRegenerateClick() {
		
		this.regenerateButton.setButtonText("Regenerating...");

		const lastHistoryItemIndex =
			this.plugin.settings.promptHistory.length - 1;
		const lastHistoryItem =
			this.plugin.settings.promptHistory[lastHistoryItemIndex];

		const params: GPTModelParams = {
			...lastHistoryItem,
			temperature: this.plugin.settings.temperature,
			topP: this.plugin.settings.topP,
			topK: this.plugin.settings.topK,
			model: this.plugin.settings.model
		};

		const token = this.plugin.settings.token as string;
		const apiUrl = this.plugin.settings.apiUrl as string;

		const response = GPTModel.generate(
			token,
			apiUrl ? apiUrl : "https://generativelanguage.googleapis.com",
			params
		);
		return response;
	}
}
