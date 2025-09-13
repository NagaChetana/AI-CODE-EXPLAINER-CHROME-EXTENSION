// background.js (service worker)
// Creates context menu item and stores selected text to chrome.storage.local
chrome.runtime.onInstalled.addListener(() => {
  // Clean previous menus and create our menu
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "explain-code-ai",
      title: "Explain Code with AI",
      contexts: ["selection"]
    });
  });
});

// When the menu is clicked, extract selection with preserved newlines/indentation
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "explain-code-ai") return;

  let selectedText = info.selectionText || "";

  // Try to get richer selection text from the page (keeps line breaks better on many sites)
  try {
    if (tab && typeof tab.id === "number") {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const sel = window.getSelection();
          if (!sel || sel.rangeCount === 0) return "";
          const basic = sel.toString();
          // If selection is inside a code-like element, prefer the container's innerText
          const node = sel.anchorNode || sel.focusNode;
          const el = node && node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
          const container = el && el.nodeType === Node.ELEMENT_NODE && el.closest
            ? el.closest("pre, code, textarea")
            : null;
          let text = container
            ? (container.tagName.toLowerCase() === "textarea" ? container.value : container.innerText)
            : basic;
          // Normalize Windows newlines to \n
          text = String(text).replace(/\r\n/g, "\n");
          // Trim trailing spaces on each line but keep indentation
          text = text.split("\n").map(l => l.replace(/\s+$/g, "")).join("\n");
          return text;
        }
      });
      selectedText = results?.[0]?.result || selectedText;
    }
  } catch (e) {
    // fall back silently
    console.warn("Selection extraction fallback:", e);
  }

  // Log with explicit newline so it renders vertically in the console
  if (selectedText) {
    console.log("Selected code:\n" + selectedText);
  } else {
    console.log("Selected code:\n<empty>");
  }

  // save selection (with metadata) and open popup
  await chrome.storage.local.set({
    selectedCodeText: selectedText,
    selectedCodeMeta: {
      ts: Date.now(),
      tabId: tab?.id ?? null,
      url: info.pageUrl || tab?.url || "",
      source: "contextMenu"
    }
  });
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup",
    // Wider default width to avoid extremely narrow windows
    width: 900,
    height: 780
  });
});
