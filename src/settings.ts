import { App, PluginSettingTab, SettingDefinitionItem } from "obsidian";
import { getSchemeColors } from "./tinty-utils";
import MyPlugin from "./main";

export interface MySettings {
	tintyPath: string;
	currentScheme: string;
	customizations: Record<string, SchemeCustomization>;
}

interface SchemeCustomization {
	base00?: string;
	base01?: string;
	base02?: string;
	base03?: string;
	base04?: string;
	base05?: string;
	base06?: string;
	base07?: string;
	base08?: string;
	base09?: string;
	base0A?: string;
	base0B?: string;
	base0C?: string;
	base0D?: string;
	base0E?: string;
	base0F?: string;
}

type BaseKey = keyof SchemeCustomization;

// Used if a scheme file has fewer than 16 colors; <input type="color"> needs a valid #rrggbb
const FALLBACK_COLOR = '#000000';

export const DEFAULT_SETTINGS: MySettings = {
	tintyPath: "tinty",
	currentScheme: "",
	customizations: {}
}

export class MySettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		const tintyPathSetting: SettingDefinitionItem = {
			name: 'Path to tinty',
			desc: 'Command name or full path to the tinty binary. Reload the plugin after changing.',
			render: (setting) => {
				setting.addText((text) =>
					text.setPlaceholder('tinty')
						.setValue(this.plugin.settings.tintyPath)
						.onChange(async (value) => {
							this.plugin.settings.tintyPath = value.trim() || 'tinty';
							await this.plugin.saveSettings();
						})
				);
			},
		};

		// Without resolved paths there are no theme colors to show
		if (!this.plugin.paths) {
			return [tintyPathSetting];
		}

		const base16Keys: BaseKey[] = [
			'base00', 'base01', 'base02', 'base03',
			'base04', 'base05', 'base06', 'base07',
			'base08', 'base09', 'base0A', 'base0B',
			'base0C', 'base0D', 'base0E', 'base0F'
		];

		const settingsMap: SettingDefinitionItem[] = base16Keys.map((key, index) => ({
			name: key,
			render: (setting) => {
				// Create the input first so both handlers can reference it
				const input = createEl('input', {type: 'color'});

				const getCust = (): SchemeCustomization | undefined =>
					this.plugin.settings.customizations[this.plugin.settings.currentScheme];

				// Initial value: customization if present, otherwise the theme default
				input.value = getCust()?.[key] ?? this.plugin.currentThemeColors[index] ?? FALLBACK_COLOR;

				input.addEventListener('change', async () => {
					const scheme = this.plugin.settings.currentScheme;
					if (!scheme) return;

					if (!this.plugin.settings.customizations[scheme]) {
						this.plugin.settings.customizations[scheme] = {};
					}
					this.plugin.settings.customizations[scheme][key] = input.value;
					await this.plugin.saveSettings();

					// await this.plugin.regenerateTheme();
				});

				setting.addExtraButton((btn) =>
					btn.setIcon('reset').setTooltip('Restore default').onClick(async () => {
						const scheme = this.plugin.settings.currentScheme;
						const cust = getCust();
						if (!scheme || !cust) return;

						delete cust[key];
						await this.plugin.saveSettings();

						const defaults = await getSchemeColors(this.plugin);
						input.value = defaults[index] ?? FALLBACK_COLOR; // updates the picker; fires no 'change' event

						// await this.plugin.regenerateTheme();
					})
				);

				setting.controlEl.appendChild(input);
			},
		}));

		return [tintyPathSetting, ...settingsMap];
	}
}

