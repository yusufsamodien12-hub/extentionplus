# Call Quality Pro - Chrome Extension

## 🚀 Publishing to the Chrome Web Store

Your package failed validation because you zipped the **entire project folder**. The Chrome Web Store requires the `manifest.json` to be at the **root** of your zip file.

### How to create the correct ZIP:
1.  **Build the project** (if you haven't already):
    ```bash
    npm run build
    ```
2.  **Open the `dist` folder**.
3.  **Select ALL files inside the `dist` folder** (`manifest.json`, `index.html`, `background.js`, `assets`, etc.).
4.  **Right-click and "Compress to ZIP file"** (or "Send to > Compressed (zipped) folder").
5.  **Rename the resulting zip** to something like `call-quality-pro.zip`.

**⚠️ IMPORTANT:** Do NOT zip the `dist` folder itself. Zip the **contents** of the `dist` folder.

### Why your previous upload failed:
- You zipped the `extention-main` folder.
- Inside your zip, the path was `extention-main/public/manifest.json`.
- Chrome expects the path to be just `manifest.json`.
- It also saw source code files (`src/`, `package.json`, etc.) which are not allowed in the final package.

---

## ⚠️ CRITICAL: How to Load the Extension Locally

You are seeing errors because you are trying to load the `src` or `public` folders. Chrome Extensions require a **built** version of the project.

### Step 1: Build the Project
If you are working locally, open your terminal in this folder and run:
```bash
npm run build
```
This will create a new folder called **`dist`**.

### Step 2: Load the Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top right).
3. Click **Load unpacked**.
4. **IMPORTANT**: Select the **`dist`** folder.

---

## Why the other folders fail:
- **`src`**: Does not contain a `manifest.json` file.
- **`public`**: Contains the manifest, but it's missing the compiled `background.js` script (which is only created inside `dist` after you build).

## Features
- **Popup**: Click the extension icon to open.
- **Side Panel**: Right-click the icon and select "Open side panel" to use it as a sidebar.
