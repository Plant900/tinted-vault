import { Plugin } from 'obsidian';
import { getSchemeColors } from './tinty-utils';
import { MySettings, MySettingTab, DEFAULT_SETTINGS } from "./settings";
import { updateObsidianTheme, setThemeWatcher } from "./tinty-utils";

export default class ObsidianTintyPlugin extends Plugin {
	settings!: MySettings;
	currentThemeColors: string[] = ['hamber',];

	async onload() {
		await this.loadSettings();
		this.currentThemeColors = await getSchemeColors();
		await updateObsidianTheme();
		this.addSettingTab(new MySettingTab(this.app, this));

		// update on startup
		this.app.workspace.onLayoutReady(async () => {
		});

		// update while running
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
