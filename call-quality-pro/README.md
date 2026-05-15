# Call Quality Pro - Microsoft Edge / Chrome Extension

This repository contains the production-ready extension package for **Call Quality Pro**.

## ✅ Ready for Microsoft Edge Add-ons
To publish to Microsoft Edge Add-ons, build the extension and upload a ZIP file containing the contents of the `dist` folder.

### 1. Build the extension
From `call-quality-pro`:

```bash
npm install
npm run build
```

### 2. Verify the build output
After building, confirm this output exists:

- `dist/manifest.json`
- `dist/index.html`
- `dist/background.js`
- `dist/icons/icon-16.png`
- `dist/icons/icon-48.png`
- `dist/icons/icon-128.png`
- `dist/assets/...`

### 3. Package for upload
1. Open the `call-quality-pro/dist` folder.
2. Select all files and folders inside `dist`.
3. Create a ZIP archive from those selected files.
4. Do not zip the `dist` folder itself.

The ZIP file must contain `manifest.json` at the root.

### 4. Upload to Microsoft Edge Add-ons
Use the Edge Add-ons dashboard and upload the ZIP created in step 3.

> Note: Microsoft Edge Add-ons accepts Chrome-compatible extensions, so the same package works as long as the manifest and assets are valid.

## Local testing
To run the extension locally in the browser for development:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

For local Chrome/Edge extension debugging:
1. Go to `chrome://extensions/` or `edge://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `call-quality-pro/dist` folder

## Notes
- `manifest.json` is now configured with icon assets for store compatibility.
- The project is versioned as `1.0.0` in `package.json`.
- `public/` assets are copied into `dist/` by Vite during build.
