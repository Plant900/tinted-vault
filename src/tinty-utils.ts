import { debounceFactory } from "./utils";
import { watch, readFile, readdir, writeFile } from "fs/promises";
import ObsidianTintyPlugin from "./main";

async function getCurrentTintyScheme(): Promise<string> {
	const path = "/home/tate/.local/share/tinted-theming/tinty/current_scheme";
	// TODO: proper error handling
	const data = await readFile(path);
	return data.toString();
}

async function getTintyThemePath(): Promise<string> {
	const path = "/home/tate/Documents/Obsidian Test Vault/.obsidian/plugins/obsidian-tinty/resources/themes/";
	// TODO: proper error handling
	const scheme = await getCurrentTintyScheme();
	const schemeFile = scheme + ".css";
	const allThemes = await readdir(path)
	return allThemes.includes(schemeFile) ? path + schemeFile : 'no file';
}

export async function updateObsidianTheme(): Promise<void> {
	const dir = "/home/tate/Documents/Obsidian Test Vault/.obsidian/themes"
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
	const ac = new AbortController();
	const { signal } = ac;
	// TODO: see if tinty CLI can programatically expose path
	const dirPath = "/home/tate/.local/share/tinted-theming/tinty/artifacts/";
	const debouncedUpdate = debounceFactory(updateObsidianTheme, 100);

	(async () => {
		try {
			const watcher = watch(dirPath, { signal });
			for await (const event of watcher) {
				debouncedUpdate();
				let content = await getSchemeColors();
				plugin.currentThemeColors = content;
			}
		} catch (err: unknown) {
			if (err.name === 'AbortError')
				return;
			throw err;
		}
	})();

	return () => ac.abort();
}

export async function getSchemeColors(): Promise<string[]> {
	console.log('getting scheme colors');
	const tintyThemePath = await getTintyThemePath();
	let content = await readFile(tintyThemePath, { encoding: 'utf8' });
	console.log(content.split('\n').splice(1, 16));

	return content.split('\n').splice(1, 16);
}
