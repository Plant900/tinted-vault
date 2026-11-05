import { App, PluginSettingTab, SettingDefinitionItem } from "obsidian";
import { BASE16_KEYS, SchemeCustomization } from "./base16";
import TintedVaultPlugin from "./main";

export interface TintedVaultSettings {
	tintyPath: string;
	currentScheme: string;
	customizations: Record<string, SchemeCustomization>;
}

export const DEFAULT_SETTINGS: TintedVaultSettings = {
	tintyPath: "tinty",
	currentScheme: "",
	customizations: {}
}

export class TintedVaultSettingTab extends PluginSettingTab {
	plugin: TintedVaultPlugin;

	constructor(app: App, plugin: TintedVaultPlugin) {
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

		// Without a loaded scheme there are no colors to show
		if (!this.plugin.palette) {
			return [tintyPathSetting];
		}

		const settingsMap: SettingDefinitionItem[] = BASE16_KEYS.map((key) => ({
			name: key,
			render: (setting) => {
				// Create the input first so both handlers can reference it
				const input = createEl('input', {type: 'color'});

				const getCust = (): SchemeCustomization | undefined =>
					this.plugin.settings.customizations[this.plugin.settings.currentScheme];

				// Scheme color for this key; read at call time so it's never stale
				const schemeColor = (): string => this.plugin.palette?.[key] ?? '#000000';

				// Initial value: customization if present, otherwise the scheme's color
				input.value = getCust()?.[key] ?? schemeColor();

				// 'input' fires continuously while dragging: update the override and preview it live
				input.addEventListener('input', () => {
					const scheme = this.plugin.settings.currentScheme;
					if (!scheme) return;

					this.plugin.settings.customizations[scheme] ??= {};
					this.plugin.settings.customizations[scheme][key] = input.value;
					this.plugin.applyColors();
				});

				// 'change' fires once when the picker closes: save to disk then
				input.addEventListener('change', () => {
					void this.plugin.saveSettings();
				});

				setting.addExtraButton((btn) =>
					btn.setIcon('reset').setTooltip('Restore default').onClick(async () => {
						const cust = getCust();
						if (!cust) return;

						delete cust[key];
						this.plugin.applyColors();
						input.value = schemeColor(); // updates the picker; fires no events
						await this.plugin.saveSettings();
					})
				);

				setting.controlEl.appendChild(input);
			},
		}));

		return [tintyPathSetting, ...settingsMap];
	}
}
