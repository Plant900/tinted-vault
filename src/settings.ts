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
		const base16Keys = [
			'base00', 'base01', 'base02', 'base03',
			'base04', 'base05', 'base06', 'base07',
			'base08', 'base09', 'base0A', 'base0B',
			'base0C', 'base0D', 'base0E', 'base0F'
		];

		const settingsMap: SettingDefinitionItem[] = base16Keys.map((key, index) => ({
			name: key,
			render: (setting) => {
				setting.addColorPicker((color) =>
					color
						.setValue(this.currentThemeColors[index]!)
						.onChange(async (value) => {
							console.log(value);
							await this.plugin.saveData(this.plugin.settings);
						})
				);
			},
		}));

		// return settingsMap;
		return [
			{
				name: 'Enable feature X',
				render: (setting) => {
					setting.addColorPicker((color) => color
						.setValue('#111111')
						.onChange(async (value) => {
							console.log(value);
							// this.plugin.applyFeatureX();
							await this.plugin.saveData(this.plugin.settings);
						}));
				},
			}
		];
	}
}

