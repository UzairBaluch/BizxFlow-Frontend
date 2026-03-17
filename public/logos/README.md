# BizxFlow logos (theme-aware)

The app uses **light** and **dark** logo assets by theme.

## Expected files

- **`bizxflow-logo-light.png`** – For **light theme**: logo in dark color (e.g. black) on **transparent** or light background. No extra border or padding; export at 1x with tight bounds.
- **`bizxflow-logo-dark.png`** – For **dark theme**: logo in light color (e.g. white) on **transparent** or dark background. No extra border or padding; export at 1x with tight bounds.

## Sizes

- Prefer **height ~80–120px** at 1x (or 2x for retina); the UI scales with `height` (e.g. 20–36px). No need for multiple files.
- **No canvas border** – crop to the logo bounds so the component can size it cleanly.

## Using images again

In `BizxFlowLogo`, set `textOnly={false}` (or remove `textOnly`) to show the PNGs again once these files are replaced with clean exports.
