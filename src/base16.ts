import { parseYaml } from "obsidian";

export const BASE16_KEYS = [
	'base00', 'base01', 'base02', 'base03',
	'base04', 'base05', 'base06', 'base07',
	'base08', 'base09', 'base0A', 'base0B',
	'base0C', 'base0D', 'base0E', 'base0F',
] as const;

export type BaseKey = typeof BASE16_KEYS[number];
export type Palette = Record<BaseKey, string>;
// User overrides for one scheme, can modify any subset of the 16 keys.
export type SchemeCustomization = Partial<Palette>;

export function normalizeHex(color: string): string {
	const c = color.trim().replace(/^#/, '').toLowerCase();
	return `#${c.slice(0, 6)}`;
}

/**
 * Parses a tinted-theming scheme YAML file into a palette.
 * Current schemes nest colors under `palette:`; older ones put base00.. at the top level.
 */
export function parsePalette(yamlText: string): Palette {
	const doc = parseYaml(yamlText) as Record<string, unknown> | null;
	const source = (doc?.palette ?? doc) as Record<string, unknown> | null;

	const palette = {} as Palette;
	for (const key of BASE16_KEYS) {
		const value = source?.[key];
		if (typeof value !== 'string') {
			throw new Error(`scheme is missing color ${key}`);
		}
		palette[key] = normalizeHex(value);
	}
	return palette;
}

/** Scheme colors with the user's overrides applied on top. */
export function mergeOverrides(palette: Palette, overrides?: SchemeCustomization): Palette {
	return { ...palette, ...overrides };
}
