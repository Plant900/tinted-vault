import { execFile } from "child_process";
import { promisify } from "util";
import { homedir } from "os";
import { join } from "path";
import { existsSync } from "fs";
import { normalizePath } from "obsidian";
import type ObsidianTintyPlugin from "./main";

const execFileAsync = promisify(execFile);

export interface PluginPaths {
	/** Absolute path, outside the vault. Read with Node's `fs`. */
	tintyDataDir: string;
	/** Absolute path to the file tinty updates on `tinty apply`. */
	currentSchemeFile: string;
	/** Vault-relative path. Access through `app.vault.adapter`. */
	themesSourceDir: string;
	/** Vault-relative path to the theme CSS file this plugin writes. */
	obsidianThemeFile: string;
}

/**
 * Finds tinty's data directory:
 *   1. ask tinty itself (respects any custom config the user has)
 *   2. fall back to tinty's default location ($XDG_DATA_HOME or ~/.local/share)
 *   3. return null if neither exists
 */
async function resolveTintyDataDir(tintyBin: string): Promise<string | null> {
	try {
		const { stdout } = await execFileAsync(tintyBin, ["config", "--data-dir-path"], { timeout: 3000 });
		const dir = stdout.trim();
		if (dir) return dir;
	} catch (e) {
		console.warn("could not run tinty, trying default data dir", e);
	}

	const dataHome = process.env.XDG_DATA_HOME || join(homedir(), ".local", "share");
	const fallback = join(dataHome, "tinted-theming", "tinty");
	return existsSync(fallback) ? fallback : null;
}

export async function resolvePaths(plugin: ObsidianTintyPlugin): Promise<PluginPaths | null> {
	const tintyDataDir = await resolveTintyDataDir(plugin.settings.tintyPath);
	if (!tintyDataDir) return null;

	const configDir = plugin.app.vault.configDir;
	// manifest.dir is typed as optional, so build the standard location if it's missing
	const pluginDir = plugin.manifest.dir ?? `${configDir}/plugins/${plugin.manifest.id}`;

	return {
		tintyDataDir,
		currentSchemeFile: join(tintyDataDir, "current_scheme"),
		themesSourceDir: normalizePath(`${pluginDir}/resources/themes`),
		obsidianThemeFile: normalizePath(`${configDir}/themes/obsidian-tinty.css`),
	};
}
