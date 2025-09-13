# AI Code Explainer (Chrome/Edge Extension)

Select any code on a web page, right‑click, and choose "Explain Code with AI". The popup shows the selected code with syntax highlighting and sends it (plus your prompt) to the OpenAI API for an explanation split into Summary, Line‑by‑line, and Improvements.

This build detects the language locally using highlight.js (no API call) and only displays a selection when it was just captured via the context menu. If you open the popup without selecting code first, the Selected code area stays empty.

## Features
- Context menu action: explain selected code on any page
- Local language detection via highlight.js
- Clean, dark UI with scrollable code and results
- Your OpenAI API key is stored locally via `chrome.storage.local`
- Recent change: selection is shown once then marked as "consumed"; the next popup opens empty until you select again

## Folder structure
```
extension/
├─ manifest.json
├─ background.js          # Context menu, captures selection, opens popup
├─ popup.html             # UI
├─ popup.css              # Styling (responsive layout)
├─ popup.js               # Logic, OpenAI call, highlighting, empty-state handling
├─ option.html, option.js # Optional settings page (not wired as action popup)
├─ libs/                  # highlight.js and theme
├─ icons/                 # Extension icons
└─ .gitattributes         # Line-ending/binary settings
```

## Requirements
- Chromium-based browser (Chrome, Edge, Brave, etc.)
- OpenAI API key

## Install (Developer Mode)
1. Download or clone this folder.
2. In your browser, open `chrome://extensions` (or `edge://extensions`).
3. Enable "Developer mode".
4. Click "Load unpacked" and select the `extension` folder.

## Usage
1. On any page, select a block of code (10–60 lines works best).
2. Right‑click → "Explain Code with AI".
3. The popup window opens. Paste your OpenAI API key the first time; it’s stored locally only.
4. Optionally type a custom prompt, then press Explain.

Notes
- If you open the popup from the toolbar without selecting code via the context menu first, the Selected code area remains empty by design.
- The detected language is shown next to the "Selected code" heading.

## Configuration
- Models: choose from the dropdown in the popup.
- Window size: adjust in `background.js` (the `chrome.windows.create` width/height).
- Styling: tweak `popup.css`.

## Permissions (from manifest.json)
- `contextMenus`, `storage`, `scripting`, `activeTab`, `clipboardWrite`

## How it works (high level)
- `background.js` creates a context menu. When clicked, it grabs the current selection (prefers text from `pre/code/textarea`), normalizes newlines, saves it to `chrome.storage.local` with metadata `{ source: "contextMenu", ts }`, and opens `popup.html`.
- `popup.js` loads the last selection only if `source === "contextMenu"`; it highlights and shows it once, then marks the metadata as `source: "consumed"` so the next popup starts empty.
- When you click Explain, it calls the OpenAI Chat Completions API with your code and prompt, then renders the three sections.

## Troubleshooting
- Popup shows old selection repeatedly: reload the extension from `chrome://extensions`. The current build consumes the selection after first display; if needed, clear site data for the extension or remove `selectedCodeText` and `selectedCodeMeta` via the extension’s background page console.
- Very narrow popup: we set fluid widths in `popup.css`. If you use the toolbar bubble instead of the separate window, the browser may constrain width; you can open from the context menu which uses a separate popup window sized in `background.js`.
- Network/API errors: ensure your key is valid and you have access to the selected model.

## Security & privacy
- Your API key is stored locally (browser `chrome.storage.local`) and only used to call OpenAI.
- No analytics or remote logging are included.

## License
This repository has no explicit license yet. Add one (e.g., MIT) if you plan to share publicly.
