import { debounceFactory } from "./utils";
import { watch as fsWatch } from "fs";
import { readFile, readdir, writeFile } from "fs/promises";
import ObsidianTintyPlugin from "./main";

export async function getCurrentTintyScheme(): Promise<string> {
	const path = "/home/tate/.local/share/tinted-theming/tinty/current_scheme";
	// TODO: proper error handling
	const data = await readFile(path);
	return data.toString();
}

async function getTintyThemePath(): Promise<string> {
	const path = "/home/tate/Documents/Obsidian Things/Test Vault/.obsidian/plugins/obsidian-tinty/resources/themes/";
	const scheme = await getCurrentTintyScheme();
	const schemeFile = scheme + ".css";
	const allThemes = await readdir(path)
	return allThemes.includes(schemeFile) ? path + schemeFile : 'no file';
}

export async function updateObsidianTheme(): Promise<void> {
	const dir = "/home/tate/Documents/Obsidian Things/Test Vault/.obsidian/themes";
	const obsidianThemePath = dir + "/obsidian-tinty.css";
	const content = await readTintyTheme();

	console.log('writing theme to', obsidianThemePath);
	await writeFile(obsidianThemePath, content);
}

async function readTintyTheme(): Promise<string> {
	const tintyThemePath = await getTintyThemePath();
	const content = await readFile(tintyThemePath, { encoding: 'utf8' });

	return content;
}

export function setThemeWatcher(plugin: ObsidianTintyPlugin): () => void {
	const dirPath = "/home/tate/.local/share/tinted-theming/tinty/";
	const debouncedUpdate = debounceFactory(async () => {
		await updateObsidianTheme();
		plugin.currentThemeColors = await getSchemeColors();
	}, 300);

	const watcher = fsWatch(dirPath, (eventType, filename) => {
		if (!filename || filename !== "current_scheme") return;
		debouncedUpdate();
	});

	watcher.on("error", (err) => {
		console.error("tinty watcher error:", err)
	});

	return () => watcher.close();
}

export async function getSchemeColors(): Promise<string[]> {
	console.log('running getSchemeColors');
	const tintyThemePath = await getTintyThemePath();
	let content = await readFile(tintyThemePath, { encoding: 'utf8' });

	return content.split('\n').splice(1, 16);
}

export function makeCustomThemeCopy(name: string): string {
	// find corresponding theme in the folder based on the name, make a copy for customization
	return 'success';
}

export function changeThemeBase16Val(oldColor: string, newColor: string): string {
	// find and replace the corresponding CSS color variable in the theme file
	return 'success';
}

