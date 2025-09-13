// // popup.js - popup UI & OpenAI call
// document.addEventListener('DOMContentLoaded', () => {
//   const selectedTextEl = document.getElementById('selectedText');
//   const apiKeyInput = document.getElementById('apiKey');
//   const explainBtn = document.getElementById('explainBtn');
//   const demoBtn = document.getElementById('demoBtn');
//   const resultSection = document.getElementById('result-section');
//   const summaryDiv = document.getElementById('summary');
//   const lineByLineDiv = document.getElementById('lineByLine');
//   const improvementsDiv = document.getElementById('improvements');
//   const modelSelect = document.getElementById('model');

//   // Load stored key and selected text
//   chrome.storage.local.get(['apiKey', 'selectedCodeText'], (data) => {
//     if (data.apiKey) apiKeyInput.value = data.apiKey;
//     if (data.selectedCodeText) selectedTextEl.textContent = data.selectedCodeText;
//   });

//   // Save API key (debounced)
//   let saveTimer;
//   apiKeyInput.addEventListener('input', () => {
//     clearTimeout(saveTimer);
//     saveTimer = setTimeout(() => {
//       chrome.storage.local.set({ apiKey: apiKeyInput.value });
//     }, 600);
//   });

//   // Open demo page
//   demoBtn.addEventListener('click', () => {
//     chrome.tabs.create({ url: chrome.runtime.getURL('demo.html') });
//   });

//   explainBtn.addEventListener('click', async () => {
//     const key = apiKeyInput.value.trim();
//     const model = modelSelect.value;
//     const selection = selectedTextEl.textContent.trim();

//     if (!selection) return alert('No selected code found. Select a code block on a page and use the context menu "Explain Code with AI".');
//     if (!key) return alert('Please enter your OpenAI API key (sk-...).');

//     explainBtn.disabled = true;
//     summaryDiv.textContent = 'Thinking...';
//     lineByLineDiv.textContent = '';
//     improvementsDiv.textContent = '';
//     resultSection.classList.remove('hidden');

//     // Compose prompt
//     const systemPrompt = `You are a skilled programming tutor. When given a code snippet, return three clearly labeled sections: SUMMARY, LINE_BY_LINE, and IMPROVEMENTS. Keep SUMMARY to 3-6 short bullet points. In LINE_BY_LINE, provide concise explanations for each significant line or block (1-2 sentences). In IMPROVEMENTS, list 3 possible optimizations/pitfalls. Use plain language and keep it short.`;
//     const userPrompt = `Here is the code:\n\n${selection}\n\nReturn only the sections SUMMARY, LINE_BY_LINE, and IMPROVEMENTS in clear readable form.`;

//     try {
//       const payload = {
//         model: model,
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: userPrompt }
//         ],
//         temperature: 0.1,
//         max_tokens: 800
//       };

//       const resp = await fetch('https://api.openai.com/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${key}`
//         },
//         body: JSON.stringify(payload)
//       });

//       if (!resp.ok) {
//         const text = await resp.text();
//         throw new Error(`API error ${resp.status}: ${text}`);
//       }

//       const data = await resp.json();
//       const aiText = data.choices?.[0]?.message?.content || JSON.stringify(data, null, 2);

//       // Simple extraction by labels
//       const summary = extractSection(aiText, 'SUMMARY') || extractSection(aiText, 'Summary') || aiText;
//       const lineByLine = extractSection(aiText, 'LINE_BY_LINE') || extractSection(aiText, 'Line_by_line') || extractSection(aiText, 'Line-by-line') || '';
//       const improvements = extractSection(aiText, 'IMPROVEMENTS') || extractSection(aiText, 'Improvements') || '';

//       summaryDiv.textContent = summary.trim();
//       lineByLineDiv.textContent = lineByLine.trim();
//       improvementsDiv.textContent = improvements.trim();

//     } catch (err) {
//       summaryDiv.textContent = `Error: ${err.message}`;
//       lineByLineDiv.textContent = '';
//       improvementsDiv.textContent = '';
//     } finally {
//       explainBtn.disabled = false;
//     }
//   });

//   function extractSection(text, label) {
//     const idx = text.indexOf(label);
//     if (idx === -1) return null;
//     let after = text.slice(idx + label.length);
//     // remove leading punctuation/newlines
//     after = after.replace(/^[:\-\s]+/, '');
//     // split at next all-caps heading or end
//     const split = after.split(/\n[A-Z_\-]{3,}\b|$/
//     );
//     return split[0].trim();
//   }
// });


// // popup.js - popup UI & OpenAI call
// document.addEventListener('DOMContentLoaded', () => {
//   const selectedTextEl = document.getElementById('selectedText'); // this is the <code> inside <pre>
//   const apiKeyInput = document.getElementById('apiKey');
//   const explainBtn = document.getElementById('explainBtn');
//   const resultSection = document.getElementById('result-section');
//   const summaryDiv = document.getElementById('summary');
//   const lineByLineDiv = document.getElementById('lineByLine');
//   const improvementsDiv = document.getElementById('improvements');
//   const modelSelect = document.getElementById('model');
//   const customPromptInput = document.getElementById('customPrompt');

//   // Load stored key and selected text
//   chrome.storage.local.get(['apiKey', 'selectedCodeText'], (data) => {
//     if (data.apiKey) apiKeyInput.value = data.apiKey;
//     if (data.selectedCodeText) {
//       // IMPORTANT: preserve indentation by converting leading spaces/tabs to &nbsp;
//       selectedTextEl.innerHTML = preserveIndentationHtml(data.selectedCodeText);
//       // ensure highlight.js styles apply
//       selectedTextEl.classList.add('hljs');
//       try {
//         hljs.highlightElement(selectedTextEl);
//       } catch (e) {
//         // fallback
//         hljs.highlightAll();
//       }
//     }
//   });

//   // Save API key (debounced)
//   let saveTimer;
//   apiKeyInput.addEventListener('input', () => {
//     clearTimeout(saveTimer);
//     saveTimer = setTimeout(() => {
//       chrome.storage.local.set({ apiKey: apiKeyInput.value });
//     }, 600);
//   });

//   // Main explain function
//   explainBtn.addEventListener('click', async () => {
//     const key = apiKeyInput.value.trim();
//     const model = modelSelect.value;
//     const selection = (selectedTextEl.innerText || '').trim();
//     const customPrompt = customPromptInput.value.trim();

//     if (!selection) return alert('No selected code found. Select a code block on a page and use the context menu "Explain Code with AI".');
//     if (!key) return alert('Please enter your OpenAI API key (sk-...).');

//     explainBtn.disabled = true;
//     summaryDiv.textContent = 'Thinking...';
//     lineByLineDiv.textContent = '';
//     improvementsDiv.textContent = '';
//     resultSection.classList.remove('hidden');

//     const systemPrompt = `You are a skilled programming tutor. When given a code snippet, return three clearly labeled sections: SUMMARY, LINE_BY_LINE, and IMPROVEMENTS. Keep SUMMARY to 3-6 short bullet points. In LINE_BY_LINE, provide concise explanations for each significant line or block (1-2 sentences). In IMPROVEMENTS, list 3 possible optimizations/pitfalls. Use plain language and keep it short.`;
//     let userPrompt = `Here is the code:\n\n${selection}\n\nReturn only the sections SUMMARY, LINE_BY_LINE, and IMPROVEMENTS in clear readable form.`;
//     if (customPrompt) userPrompt += `\n\nUser request: ${customPrompt}`;

//     try {
//       const payload = {
//         model: model,
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: userPrompt }
//         ],
//         temperature: 0.2,
//         max_tokens: 1000
//       };

//       const resp = await fetch('https://api.openai.com/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${key}`
//         },
//         body: JSON.stringify(payload)
//       });

//       if (!resp.ok) {
//         const text = await resp.text();
//         throw new Error(`API error ${resp.status}: ${text}`);
//       }

//       const data = await resp.json();
//       const aiText = data.choices?.[0]?.message?.content || JSON.stringify(data, null, 2);

//       const summary = extractSection(aiText, 'SUMMARY') || extractSection(aiText, 'Summary') || aiText;
//       const lineByLine = extractSection(aiText, 'LINE_BY_LINE') || extractSection(aiText, 'Line-by-line') || '';
//       const improvements = extractSection(aiText, 'IMPROVEMENTS') || extractSection(aiText, 'Improvements') || '';

//       // Use formatWithCode which preserves indentation inside fenced code blocks
//       summaryDiv.innerHTML = formatWithCode(summary.trim());
//       lineByLineDiv.innerHTML = formatWithCode(lineByLine.trim());
//       improvementsDiv.innerHTML = formatWithCode(improvements.trim());

//       // highlight any newly-inserted code blocks
//       try {
//         document.querySelectorAll('pre code.hljs').forEach(block => hljs.highlightElement(block));
//       } catch {
//         hljs.highlightAll();
//       }

//     } catch (err) {
//       summaryDiv.textContent = `Error: ${err.message}`;
//       lineByLineDiv.textContent = '';
//       improvementsDiv.textContent = '';
//     } finally {
//       explainBtn.disabled = false;
//     }
//   });

//   // escape HTML entities
//   function escapeHtml(str) {
//     return str
//       .replace(/&/g, "&amp;")
//       .replace(/</g, "&lt;")
//       .replace(/>/g, "&gt;")
//       .replace(/"/g, "&quot;")
//       .replace(/'/g, "&#39;");
//   }

//   // convert code text into HTML that preserves indentation visually
//   function preserveIndentationHtml(text) {
//     // Normalize newlines
//     const lines = String(text).replace(/\r\n/g, '\n').split('\n');
//     const converted = lines.map(line => {
//       // Convert tabs to 4 spaces (you can change to 2 if you prefer)
//       const withSpaces = line.replace(/\t/g, '    ');
//       // Escape HTML
//       const escaped = escapeHtml(withSpaces);
//       // Replace only the leading spaces with &nbsp; so indentation is visible
//       const replacedLeading = escaped.replace(/^ +/, (m) => m.replace(/ /g, '&nbsp;'));
//       // If the line is empty, keep a visible empty line (use &nbsp; so the line renders inside <pre>)
//       return replacedLeading === '' ? '&nbsp;' : replacedLeading;
//     });
//     // join with real newline characters; inside <pre> they are preserved
//     return converted.join('\n');
//   }

//   // Format text that may contain fenced code blocks. Escapes normal text and
//   // inserts preserved-indentation code blocks for content inside ``` ```
//   function formatWithCode(text) {
//     if (!text) return '';
//     const regex = /```(\w+)?\n([\s\S]*?)```/g;
//     let lastIndex = 0;
//     let out = '';
//     let match;
//     while ((match = regex.exec(text)) !== null) {
//       const before = text.slice(lastIndex, match.index);
//       out += escapeHtml(before).replace(/\n/g, '<br>'); // escape & keep newlines as <br> for plain text
//       const lang = match[1] ? match[1].toLowerCase() : 'plaintext';
//       const code = match[2];
//       const preserved = preserveIndentationHtml(code);
//       out += `<pre><code class="hljs language-${lang}">${preserved}</code></pre>`;
//       lastIndex = regex.lastIndex;
//     }
//     const rest = text.slice(lastIndex);
//     out += escapeHtml(rest).replace(/\n/g, '<br>');
//     return out;
//   }

//   // Extract section by label (SUMMARY, LINE_BY_LINE, IMPROVEMENTS)
//   function extractSection(text, label) {
//     const idx = text.indexOf(label);
//     if (idx === -1) return null;
//     let after = text.slice(idx + label.length);
//     after = after.replace(/^[:\-\s]+/, '');
//     const split = after.split(/\n[A-Z_\-]{3,}\b|$/);
//     return split[0].trim();
//   }

//   // Copy to clipboard handler
//   document.body.addEventListener('click', (e) => {
//     if (e.target.classList.contains('copyBtn')) {
//       const targetId = e.target.dataset.target;
//       const el = document.getElementById(targetId);
//       if (el) {
//         navigator.clipboard.writeText(el.innerText).then(() => {
//           e.target.textContent = '✅ Copied';
//           setTimeout(() => { e.target.textContent = '📋 Copy'; }, 1500);
//         });
//       }
//     }
//   });
// });

// popup.js - popup UI & OpenAI call
document.addEventListener('DOMContentLoaded', () => {
  const selectedTextEl = document.getElementById('selectedText');
  const apiKeyInput = document.getElementById('apiKey');
  const explainBtn = document.getElementById('explainBtn');
  const resultSection = document.getElementById('result-section');
  const summaryDiv = document.getElementById('summary');
  const lineByLineDiv = document.getElementById('lineByLine');
  const improvementsDiv = document.getElementById('improvements');
  const modelSelect = document.getElementById('model');
  const customPromptInput = document.getElementById('customPrompt');

  // Load stored key and selected text (only if the last source was the context menu)
  chrome.storage.local.get(['apiKey', 'selectedCodeText', 'selectedCodeMeta'], (data) => {
    if (data.apiKey) apiKeyInput.value = data.apiKey;
    const langBadge = document.getElementById('detectedLang');

    const meta = data.selectedCodeMeta || {};
    const isFreshContextMenu = meta.source === 'contextMenu' && typeof data.selectedCodeText === 'string' && data.selectedCodeText.trim().length > 0;

    if (isFreshContextMenu) {
      const codeText = data.selectedCodeText;
      // Detect language locally with highlight.js (no API call)
      const candidates = [
        'javascript','typescript','python','c','cpp','csharp','java','go','rust','php','ruby','swift','kotlin',
        'scala','sql','bash','powershell','json','yaml','xml','html','css','scss','less','markdown'
      ];
      let detected;
      try {
        detected = hljs.highlightAuto(codeText, candidates);
      } catch {}
      const lang = detected?.language || 'plaintext';
      if (langBadge) langBadge.textContent = `(${lang})`;

      selectedTextEl.textContent = codeText;
      selectedTextEl.className = '';
      selectedTextEl.classList.add('hljs', `language-${lang}`);
      try {
        hljs.highlightElement(selectedTextEl);
      } catch {
        hljs.highlightAll();
      }
      const hint = document.getElementById('noSelectionHint');
      if (hint) hint.style.display = 'none';

      // Mark the stored selection as consumed so future popups start empty
      try {
        const newMeta = Object.assign({}, meta, { source: 'consumed' });
        chrome.storage.local.set({ selectedCodeMeta: newMeta });
      } catch {}
    } else {
      // No fresh selection → keep empty UI and clear badge
      selectedTextEl.textContent = '';
      selectedTextEl.className = '';
      if (langBadge) langBadge.textContent = '';
      const hint = document.getElementById('noSelectionHint');
      if (hint) hint.style.display = 'inline';
    }
  });

  // Save API key (debounced)
  let saveTimer;
  apiKeyInput.addEventListener('input', () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      chrome.storage.local.set({ apiKey: apiKeyInput.value });
    }, 600);
  });


  // Main explain function
  explainBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    const model = modelSelect.value;
    const selection = (selectedTextEl.innerText || '').trim();
    const customPrompt = customPromptInput.value.trim();

    // Guard: do not allow explaining if no fresh selection was provided
    if (!selection) {
      alert('No selected code found. Select a code block on a page and use the context menu "Explain Code with AI".');
      return;
    }

    if (!selection) return alert('No selected code found.');
    if (!key) return alert('Please enter your OpenAI API key (sk-...).');

    explainBtn.disabled = true;
    summaryDiv.textContent = 'Thinking...';
    lineByLineDiv.textContent = '';
    improvementsDiv.textContent = '';
    resultSection.classList.remove('hidden');

    const systemPrompt = `You are a skilled programming tutor. Provide SUMMARY, LINE_BY_LINE, and IMPROVEMENTS.`;
    let userPrompt = `Here is the code:\n\n${selection}\n\nReturn SUMMARY, LINE_BY_LINE, and IMPROVEMENTS.`;
    if (customPrompt) userPrompt += `\n\nUser request: ${customPrompt}`;

    try {
      const payload = {
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1000
      };

      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`API error ${resp.status}: ${text}`);
      }

      const data = await resp.json();
      const aiText = data.choices?.[0]?.message?.content || JSON.stringify(data, null, 2);

      const summary = extractSection(aiText, 'SUMMARY') || aiText;
      const lineByLine = extractSection(aiText, 'LINE_BY_LINE') || '';
      const improvements = extractSection(aiText, 'IMPROVEMENTS') || '';

      summaryDiv.textContent = summary.trim();
      lineByLineDiv.textContent = lineByLine.trim();
      improvementsDiv.textContent = improvements.trim();

    } catch (err) {
      summaryDiv.textContent = `Error: ${err.message}`;
    } finally {
      explainBtn.disabled = false;
    }
  });

  // Extract section by label
  function extractSection(text, label) {
    const idx = text.indexOf(label);
    if (idx === -1) return null;
    let after = text.slice(idx + label.length);
    after = after.replace(/^[:\-\s]+/, '');
    const split = after.split(/\n[A-Z_\-]{3,}\b|$/);
    return split[0].trim();
  }

  // Copy to clipboard handler
  document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('copyBtn')) {
      const targetId = e.target.dataset.target;
      const el = document.getElementById(targetId);
      if (el) {
        navigator.clipboard.writeText(el.innerText).then(() => {
          e.target.textContent = '✅ Copied';
          setTimeout(() => { e.target.textContent = '📋 Copy'; }, 1500);
        });
      }
    }
  });
});
