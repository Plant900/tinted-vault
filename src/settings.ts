import { App, PluginSettingTab, SettingDefinitionItem, ColorComponent } from "obsidian";
import MyPlugin from "./main";

export interface MySettings {
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
				let picker: ColorComponent;
				setting
					.addExtraButton((btn) => btn.setIcon('reset').setTooltip('Restore default').onClick(async() => {
						// const def = this.defaultThemeColors[index];
						// picker.setValue(def)
						// this.currentThemeColors[index] = def;
						// saveData
					}))
					.addColorPicker((color) =>
					color
						.setValue(this.currentThemeColors[index]!)
						.onChange(async (value) => {
							console.log(value);
							await this.plugin.saveData(this.plugin.settings);
						})
				);
			},
		}));

		return settingsMap;
	}
}

