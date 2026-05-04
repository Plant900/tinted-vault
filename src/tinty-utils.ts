import { debounceFactory } from "./utils";
import { watch, readFile, readdir, writeFile } from "fs/promises";
import { App } from 'obsidian';

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

export async function updateObsidianTheme(app: App): Promise<void> {
	const dir = "/home/tate/Documents/Obsidian Test Vault/.obsidian/themes"
	const obsidianThemePath = dir + "/obsidian-tinty.css";
	const content = await readTintyTheme();

	try {
		console.log('writing to', obsidianThemePath, content);
		await writeFile(obsidianThemePath, content);
		// const cssManager = (app as any).customCss;
		// cssManager.requestReadThemes();
	} catch (err) {
		throw err;
	}
}

async function readTintyTheme(): Promise<string> {
	const tintyThemePath = await getTintyThemePath();
	const content = await readFile(tintyThemePath, { encoding: 'utf8' });

	return content;
}

export function setThemeWatcher(): () => void {
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

export async function getSchemeColors(): Promise<string[]> {
	const tintyThemePath = await getTintyThemePath();
	let content = await readFile(tintyThemePath, { encoding: 'utf8' });

	return content.split('\n').splice(1, 16);
}
