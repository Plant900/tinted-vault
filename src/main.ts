import { Notice, Plugin } from 'obsidian';
import { TintedVaultSettings, TintedVaultSettingTab, DEFAULT_SETTINGS } from "./settings";
import { setThemeWatcher, getCurrentTintyScheme, loadSchemePalette } from "./tinty-utils";
import { PluginPaths, resolvePaths } from "./paths";
import { BASE16_KEYS, Palette, mergeOverrides } from "./base16";

// Class on <body> that switches on the color mapping in styles.css
const ACTIVE_CLASS = 'tinted-vault-active';

export default class TintedVaultPlugin extends Plugin {
	settings!: TintedVaultSettings;
	paths!: PluginPaths;
	settingTab!: TintedVaultSettingTab;
	palette: Palette | null = null;

	async onload() {
		await this.loadSettings();

		this.settingTab = new TintedVaultSettingTab(this.app, this);
		this.addSettingTab(this.settingTab);

		const paths = await resolvePaths(this);
		if (!paths) {
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
			this.palette = await loadSchemePalette(this, this.settings.currentScheme);
			this.applyColors();
			await this.saveSettings();
			// re-render the pickers in case the settings tab is open
			this.settingTab.update();
		} catch (e) {
			console.error(e);
			new Notice(`Couldn't load tinty scheme: ${e instanceof Error ? e.message : String(e)}`);
		}
	}

	// Sets the 16 --baseXX variables (scheme colors + overrides). The CSS in styles.css does the rest. */
	applyColors(): void {
		if (!this.palette) return;
		const colors = mergeOverrides(this.palette, this.settings.customizations[this.settings.currentScheme]);
		for (const key of BASE16_KEYS) {
			document.body.style.setProperty(`--${key}`, colors[key]);
		}
		document.body.addClass(ACTIVE_CLASS);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as TintedVaultSettings);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	onunload() {
		// restore Obsidian's own colors; Obsidian unloads styles.css itself
		document.body.removeClass(ACTIVE_CLASS);
		for (const key of BASE16_KEYS) {
			document.body.style.removeProperty(`--${key}`);
		}
	}

}
