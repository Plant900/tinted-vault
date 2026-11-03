import { App, PluginSettingTab, SettingDefinitionItem, } from "obsidian"; import { getSchemeColors } from "./tinty-utils"; import MyPlugin from "./main"; export interface MySettings {
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

export const DEFAULT_SETTINGS: Partial<MySettings> = {
	currentScheme: "",
	customizations: {}
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
				input.value = normalizeHex(getCust()?.[key] ?? this.currentThemeColors[index]);

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

						const defaults = await getSchemeColors();
						input.value = normalizeHex(defaults[index]); // updates the picker; fires no 'change' event

						// await this.plugin.regenerateTheme();
					})
				);

				// Appended after the reset button, matching your original order
				setting.controlEl.appendChild(input);
			},
		}));

		return settingsMap;
	}
}

// possibly remove
// <input type="color"> only accepts "#rrggbb" (lowercase, 6 digits).
// Base16 schemes often store colors without the "#", so normalize.
function normalizeHex(color: string): string {
	const c = color.trim().replace(/^#/, '').toLowerCase();
	return `#${c.slice(0, 6)}`;
}
