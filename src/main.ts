import { Plugin } from 'obsidian';
import { getSchemeColors } from './tinty-utils';
import { MySettings, MySettingTab, DEFAULT_SETTINGS } from "./settings";
import { updateObsidianTheme, setThemeWatcher } from "./tinty-utils";

export default class ObsidianTintyPlugin extends Plugin {
	settings!: MySettings;
	currentThemeColors: string[] = [];

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new MySettingTab(this.app, this));

		// update on startup
		this.app.workspace.onLayoutReady(async () => {
			await updateObsidianTheme(this.app);
		});

		// update while running
		this.register(setThemeWatcher());

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
