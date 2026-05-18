import { App, PluginSettingTab, Setting } from "obsidian";
import { getSchemeColors } from "./tinty-utils"; 
import MyPlugin from "./main";

export interface MyPluginSettings {
	customizations: Record<string, Partial<ColorMapping>>;
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

export const DEFAULT_SETTINGS: MyPluginSettings = {
	customizations: {}
}

export class MySettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async display(): Promise<void> {
		const { containerEl } = this;
		containerEl.empty();

		const schemeColors: string[] = await getSchemeColors();

		new Setting(containerEl)
			.setName('Background')
			.addDropdown((dropdown) => {
				const options: Record<string, string> = {};
				schemeColors.forEach((hex, index) => {
					options[index.toString()] = `base${index} - ${hex}`;
				})

				dropdown.addOptions(options);
				dropdown.setValue('0');
				dropdown.onChange((value) => {
					// TO DO: Save mapping
					console.log('hamber');
				})
			})
	}
}
