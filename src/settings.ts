import { App, PluginSettingTab, SettingDefinitionItem } from "obsidian";
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
	currentThemeColors: string[];

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.currentThemeColors = plugin.currentThemeColors;
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
			{
				name: 'Test',
				control: {
					type: 'dropdown',
					key: 'test',
					options: {
						value: 'Display',
						value2: this.currentThemeColors[0] ?? '',
					},
				},
			},
		];
	}
}

