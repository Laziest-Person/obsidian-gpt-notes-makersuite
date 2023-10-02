import { Notice, requestUrl } from "obsidian";
import https from 'https';
import { GPTModelParams } from "types";
import { modeltypes, modelnames } from "SettingsView";

export class GPTModel {
	constructor() {}

	static endpoints = {
		text: "/v1beta2/models/text-bison-001:generateText",
		chat: "/v1beta2/models/chat-bison-001:generateMessage",
	};

	static async generate(
		token: string,
		apiUrl: string,
		params: GPTModelParams,
		retry?: number
	): Promise<any> {
		if (!retry) {
			retry = 0;
		}
		const modelType = modeltypes[
			params.model as keyof typeof modeltypes
		] as keyof typeof this.endpoints;

		const data = this.paramsToModelParams(params, modelType);

		/*const response_raw = fetch( ( apiUrl + this.endpoints[modelType] + "?token=" + token ) , {
			method: 'POST',
			body: JSON.stringify(data),
			headers: { 'Content-Type': 'application/json'},
			mode: 'no-cors'
		});*/

		var path = this.endpoints[modelType];
		const method = 'POST';

		const headers = {
			'Content-Type': 'application/json'
		};

		const response = await requestUrl({
			url: (apiUrl + path + "?key=" + token),
			method: method,
			body: JSON.stringify(data),
			headers: headers
		});

		console.log(response.text);

		var json_data = JSON.parse(response.text);

		if (modelType === "text") { 
			console.log("Got: " + json_data.candidates[0].output);
			return json_data.candidates[0].output 
		}
		else if (modelType === "chat") { 
			console.log("Got: " + json_data.candidates[0].content);
			return json_data.candidates[0].content 
		}
		else { return false; }

	}

	static paramsToModelParams(params: GPTModelParams, modelType: string) {
		if (modelType === "text") {
			return {
				prompt: 
				{
					text: params.prompt
				},
				temperature: params.temperature,
				maxOutputTokens: params.tokens,
				topP: params.topP,
				topK: params.topK,
				candidateCount: 1
			};
		} else if (modelType === "chat") {
			return {
				prompt:
				{
					messages: [
						{
							author: "user",
							content: params.prompt,
						}
					]
				},
				temperature: params.temperature,
				topP: params.topP,
				topK: params.topK,
				candidateCount: 1
			};
		}
	}
}
