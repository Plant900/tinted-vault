import { debounceFactory } from "./utils";
import { watch as fsWatch } from "fs";
import { readFile } from "fs/promises";
import { normalizePath } from "obsidian";
import ObsidianTintyPlugin from "./main";

export async function getCurrentTintyScheme(plugin: ObsidianTintyPlugin): Promise<string> {
	// TODO: proper error handling
	const data = await readFile(plugin.paths.currentSchemeFile, { encoding: 'utf8' });
	return data.trim();
}


async function getTintyThemePath(plugin: ObsidianTintyPlugin): Promise<string | null> {
	const dir = plugin.paths.themesSourceDir;
	const scheme = await getCurrentTintyScheme(plugin);
	const target = normalizePath(`${dir}/${scheme}.css`);
	// adapter.list returns full vault-relative paths, so compare against the full path
	const { files } = await plugin.app.vault.adapter.list(dir);
	return files.includes(target) ? target : null;
}


export async function updateObsidianTheme(plugin: ObsidianTintyPlugin): Promise<void> {
	const obsidianThemePath = plugin.paths.obsidianThemeFile;
	const content = await readTintyTheme(plugin);

	console.log('writing theme to', obsidianThemePath);
	await plugin.app.vault.adapter.write(obsidianThemePath, content);
}


async function readTintyTheme(plugin: ObsidianTintyPlugin): Promise<string> {
	const tintyThemePath = await getTintyThemePath(plugin);
	if (!tintyThemePath) {
		const scheme = await getCurrentTintyScheme(plugin);
		throw new Error(`obsidian-tinty: no theme CSS found for scheme "${scheme}"`);
	}
	return plugin.app.vault.adapter.read(tintyThemePath);
}


export function setThemeWatcher(plugin: ObsidianTintyPlugin): () => void {
	const debouncedUpdate = debounceFactory(async () => {
		await plugin.syncWithTinty();
	}, 300);

	const watcher = fsWatch(plugin.paths.tintyDataDir, (eventType, filename) => {
		if (!filename || filename !== "current_scheme") return;
		debouncedUpdate();
	});

	watcher.on("error", (err) => {
		console.error("tinty watcher error:", err)
	});

	return () => watcher.close();
}


export async function getSchemeColors(plugin: ObsidianTintyPlugin): Promise<string[]> {
	console.log('running getSchemeColors');
	const content = await readTintyTheme(plugin);

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
