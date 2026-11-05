import { debounceFactory } from "./utils";
import { existsSync, watch as fsWatch } from "fs";
import { readFile } from "fs/promises";
import { join } from "path";
import { Palette, parsePalette } from "./base16";
import TintedVaultPlugin from "./main";

export async function getCurrentTintyScheme(plugin: TintedVaultPlugin): Promise<string> {
	const data = await readFile(plugin.paths.currentSchemeFile, { encoding: 'utf8' });
	return data.trim();
}

/**
 * Loads a scheme's colors from tinty's own scheme files.
 * A scheme id like "base16-everforest" maps to <system>/<slug>.yaml; user-made
 * schemes in custom-schemes/ take priority over the downloaded schemes repo.
 */
export async function loadSchemePalette(plugin: TintedVaultPlugin, scheme: string): Promise<Palette> {
	const dash = scheme.indexOf('-');
	if (dash === -1) throw new Error(`unrecognized scheme id "${scheme}"`);
	const system = scheme.slice(0, dash);
	const slug = scheme.slice(dash + 1);

	const dataDir = plugin.paths.tintyDataDir;
	const candidates = [
		join(dataDir, "custom-schemes", system, `${slug}.yaml`),
		join(dataDir, "repos", "schemes", system, `${slug}.yaml`),
	];
	const schemeFile = candidates.find((p) => existsSync(p));
	if (!schemeFile) throw new Error(`no scheme file found for "${scheme}"`);

	return parsePalette(await readFile(schemeFile, { encoding: 'utf8' }));
}

export function setThemeWatcher(plugin: TintedVaultPlugin): () => void {
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
