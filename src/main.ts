import { App, Editor, MarkdownView, Modal, Notice, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, MyPluginSettings, SampleSettingTab } from "./settings";
import { watch, readFile, readdir, writeFile } from "fs/promises";

export default class HelloWorldPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		await updateObsidianTheme();
		this.register(setThemeWatcher());

		this.addRibbonIcon('dice', 'Greet', (evt: MouseEvent) => {
			new Notice('Hello');
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status bar text');

		this.addCommand({
			id: 'open-modal-simple',
			name: 'Open modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();

			}
		});  

		this.addCommand({
			id: 'replace-selected',
			name: 'Replace selected content',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				editor.replaceSelection('Sample editor command');
			}
		});

		this.addCommand({
			id: 'open-modal-complex',
			name: 'Open modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}
					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
				return false;
			}
		});

		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			new Notice("Click");
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<MyPluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		let { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

async function getCurrentTintyScheme(): Promise<string> {
	const path = "/home/tate/.local/share/tinted-theming/tinty/current_scheme";

	try {
		const data = await readFile(path);
		return data.toString();
	} catch (err) {
		throw err;
	}
}

async function getTintyThemePath(): Promise<string> {
	const path = "/home/tate/Documents/Obsidian Test Vault/.obsidian/plugins/obsidian-tinty/resources/themes/";

	try {
		const scheme = await getCurrentTintyScheme();
		const schemeFile = scheme + ".css";
		const allThemes = await readdir(path)

		return allThemes.includes(schemeFile) ? path + schemeFile : 'no file';
	} catch (err) {
		throw err;
	}
}

async function updateObsidianTheme(): Promise<void> {
	const dir = "/home/tate/Documents/Obsidian Test Vault/.obsidian/themes"
	const obsidianThemePath = dir + "/obsidian-tinty.css";
	const tintyThemePath = await getTintyThemePath();
	const content = await readFile(tintyThemePath, { encoding: 'utf8' });

	try {
		const themes = await readdir(dir);
		console.log('writing to', obsidianThemePath, content);
		await writeFile(obsidianThemePath, content);
	} catch (err) {
		throw err;
	}
}

function setThemeWatcher(): () => void {
	const ac = new AbortController();
	const { signal } = ac;
	const dirPath = "/home/tate/.local/share/tinted-theming/tinty/";
	const debouncedUpdate = debounceFactory(updateObsidianTheme, 100);

	(async () => {
		try {
			const watcher = watch(dirPath, { signal });
			for await (const event of watcher) {
				debouncedUpdate();
			}
		} catch (err: any) {
			if (err.name === 'AbortError')
				return;
			throw err;
		}
	})();

	return () => ac.abort();
}

function debounceFactory(func: Function, amount: number) {
	let timeout: number | null = null;

	return ((...args: any[]) => {
		if (timeout) {
			window.clearTimeout(timeout);
		}
		timeout = window.setTimeout((() => {
			func(...args);
		}),amount)
	})
}
