import { App, PluginSettingTab, Setting } from "obsidian";
import { getSchemeColors } from "./tinty-utils"; 
import MyPlugin from "./main";

export interface MyPluginSettings {
	mySetting: string;
}

interface ColorMapping {
	"--background-primary": 0;
	"--background-primary-alt": 1;
	"--background-secondary": 0;
	"--background-secondary-alt": 1;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Tinty Theme Palette')
	}
}
