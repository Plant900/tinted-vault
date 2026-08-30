import { App, PluginSettingTab, SettingDefinitionItem } from "obsidian";
import { getSchemeColors } from "./tinty-utils";
import MyPlugin from "./main";

export interface MySettings {
	sampleValue: string;
}

export const DEFAULT_SETTINGS: Partial<MySettings> = {
	sampleValue: "sample",
}

interface ColorMapping {
	"--background-primary": number;
	"--background-primary-alt": number;
	"--background-secondary": number;
	"--background-secondary-alt": number;
}

export const TEMPLATE_DEFAULTS: ColorMapping = {
	"--background-primary": 0,
	"--background-primary-alt": 1,
	"--background-secondary": 0,
	"--background-secondary-alt": 1,
}

export class MySettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: 'Default value',
				control: {
					type: 'text',
					key: 'sampleValue',
					placeholder: 'Lorem ipsum',
				},
			},
		];
	}
}

