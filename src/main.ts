import { Plugin } from 'obsidian';
import { getSchemeColors } from './tinty-utils';
import { MySettings, MySettingTab, DEFAULT_SETTINGS } from "./settings";
import { updateObsidianTheme, setThemeWatcher } from "./tinty-utils";

export default class ObsidianTintyPlugin extends Plugin {
	settings!: MySettings;
	currentThemeColors: string[] = [];

	async onload() {
		await this.loadSettings();

		// populate colors
		this.currentThemeColors = await getSchemeColors();
		await updateObsidianTheme();
		console.log('settings', this.settings);

		this.addSettingTab(new MySettingTab(this.app, this));

		// watcher for live theme updates
		this.register(setThemeWatcher(this));

	}


	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as MySettings);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	onunload() {
	}

}
