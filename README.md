# Tinted Vault

Keep Obsidian's colors in sync with your system theme. Tinted Vault follows the
active [tinty](https://github.com/tinted-theming/tinty) base16 scheme, so a single
`tinty apply` recolors your terminal, editor and vault together.

<!-- TODO: add a GIF of `tinty apply` changing the vault live -->

## Features

- **Follows tinty live.** Run `tinty apply <scheme>` and the vault updates within a moment, with no reload.
- **Per-scheme color overrides.** Adjust any of the 16 base16 colors from the settings tab, with a
  live preview while you drag. Overrides are saved per scheme, and each color can be reset to the scheme's own value.
- **No theme files.** Colors are applied as CSS variables, so disabling the plugin restores your
  vault's normal appearance.

## Requirements

- Obsidian 1.13 or newer, desktop only
- [tinty](https://github.com/tinted-theming/tinty) installed, with a base16 scheme applied at least once
  (`tinty apply base16-<name>`)

## Installation

The plugin isn't in the community plugin directory yet. Install it with either method:

**With BRAT (recommended)**
1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) from the community plugins.
2. In BRAT's settings, choose *Add beta plugin* and enter `Plant900/tinted-vault`.
3. Enable **Tinted Vault** under Settings → Community plugins.

**Manually**
1. Download `main.js`, `manifest.json` and `styles.css` from the
   [latest release](https://github.com/Plant900/tinted-vault/releases/latest).
2. Put them in `<your vault>/.obsidian/plugins/tinted-vault/`.
3. Reload Obsidian and enable **Tinted Vault** under Settings → Community plugins.

For best results, use Obsidian's default theme (Settings → Appearance → Themes).

## Usage

- Change schemes as usual with `tinty apply <scheme>`. Obsidian follows automatically.
- Settings → Tinted Vault:
  - **Path to tinty:** set this if Obsidian can't find `tinty`. Apps started from a desktop
    launcher often don't inherit your shell's `PATH`, for example when tinty lives in `~/.cargo/bin`.
  - **base00 – base0F:** a color picker for each base16 color. Changes preview live and are saved
    for the current scheme only. The reset button restores the scheme's color.

## How it works

1. On load, the plugin asks tinty for its data directory (`tinty config --data-dir-path`), falling back to
   `$XDG_DATA_HOME/tinted-theming/tinty` or `~/.local/share/tinted-theming/tinty`.
2. It reads the current scheme name from `current_scheme`, then loads that scheme's palette from tinty's scheme
   YAML. User-made schemes in `custom-schemes/` take priority.
3. Any overrides saved for that scheme are merged on top, and the 16 results are set as CSS variables
   (`--base00` … `--base0F`) on `<body>`.
4. The plugin's `styles.css` maps Obsidian's own variables (`--background-primary`, `--text-accent`, …)
   onto those 16 colors.
5. A file watcher on `current_scheme` repeats steps 2–3 whenever tinty switches schemes.

## Limitations

- Only the 16 base16 colors are used (base24 schemes work, using their first 16 colors).
- Colors apply to the main window, not to popout windows (yet).
- Desktop only, because it needs to read tinty's files and run the tinty CLI.

## Development

```bash
npm install
npm run dev     # rebuild main.js on every change
npm run build   # type-check and build for production
npm run lint
```

For development, clone the repo into a test vault's `.obsidian/plugins/tinted-vault/` folder.
Releases are built by GitHub Actions when a version tag (e.g. `0.1.0`) is pushed.

## License

[0BSD](LICENSE)
