import { App, PluginSettingTab, SettingDefinitionItem, ColorComponent } from "obsidian"; import { getSchemeColors } from "./tinty-utils"; import MyPlugin from "./main"; export interface MySettings {
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
		const base16Keys = [
			'base00', 'base01', 'base02', 'base03',
			'base04', 'base05', 'base06', 'base07',
			'base08', 'base09', 'base0A', 'base0B',
			'base0C', 'base0D', 'base0E', 'base0F'
		];

		const settingsMap: SettingDefinitionItem[] = base16Keys.map((key, index) => ({
			name: key,
			render: (setting) => {
				setting
					.addExtraButton((btn) => btn.setIcon('reset').setTooltip('Restore default').onClick(async () => {
						const scheme = this.plugin.settings.currentScheme;
						if (!scheme || !this.plugin.settings.customizations[scheme]) return;

						// Delete customization
						delete (this.plugin.settings.customizations[scheme] as unknown)[key];
						await this.plugin.saveSettings();

						// Restore picker to default val
						const defaults = await getSchemeColors();
						this.picker.setValue(defaults[index]);

						// Regenerate theme
						// await this.plugin.regenerateTheme();
					}))
					.addColorPicker((color) => {
						const schemeCust = this.plugin.settings.customizations[this.plugin.settings.currentScheme] || {};
						const effectiveColor = (schemeCust as unknown)[key] ?? this.currentThemeColors[index];

						color
							.setValue(effectiveColor)
							.onChange(async (value) => {
								const scheme = this.plugin.settings.currentScheme;
								if (!scheme) {
									console.log('no scheme');
									return;
								};

								// Initialize scheme customizations if needed
								if (!this.plugin.settings.customizations[scheme]) {
									this.plugin.settings.customizations[scheme] = {};
								}
								// Save the customization
								(this.plugin.settings.customizations[scheme] as unknown)[key] = value;
								await this.plugin.saveSettings();

								// Regenerate theme (you'll implement this later)
								// await this.plugin.regenerateTheme();

								console.log(value);
								await this.plugin.saveData(this.plugin.settings);
							})
					}
					);
			},
		}));

		return settingsMap;
	}
}

