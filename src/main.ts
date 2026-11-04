import { Notice, Plugin } from 'obsidian';
import { getSchemeColors } from './tinty-utils';
import { MySettings, MySettingTab, DEFAULT_SETTINGS } from "./settings";
import { updateObsidianTheme, setThemeWatcher, getCurrentTintyScheme } from "./tinty-utils";
import { PluginPaths, resolvePaths } from "./paths";

export default class ObsidianTintyPlugin extends Plugin {
	settings!: MySettings;
	paths!: PluginPaths;
	settingTab!: MySettingTab;
	currentThemeColors: string[] = [];

	async onload() {
		await this.loadSettings();

		this.settingTab = new MySettingTab(this.app, this);
		this.addSettingTab(this.settingTab);

		const paths = await resolvePaths(this);
		if (!paths) {
			// the settings tab is already added, so the user can fix the path there
			new Notice("Couldn't find tinty, set its path in the plugin settings.");
			return;
		}
		this.paths = paths;

		await this.syncWithTinty();

		// watcher for live theme updates
		this.register(setThemeWatcher(this));
	}

	// Reads tinty scheme and aligns all plugin state
	async syncWithTinty(): Promise<void> {
		try {
			this.settings.currentScheme = await getCurrentTintyScheme(this);
			this.currentThemeColors = await getSchemeColors(this);
			await updateObsidianTheme(this);
			await this.saveSettings();
			// re-render the pickers in case the settings tab is open
			this.settingTab.update();
		} catch (e) {
			console.error(e);
			new Notice(`Couldn't load tinty scheme: ${e instanceof Error ? e.message : String(e)}`);
		}
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
