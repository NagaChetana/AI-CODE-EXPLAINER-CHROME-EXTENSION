# AI-CODE-EXPLAINER-CHROME-EXTENSION

AI Code Explainer is a Chrome extension that helps developers understand code snippets quickly and effectively.  
Select any code on a webpage and get AI-powered explanations directly in your browser.

---

## Features
- Explain any code snippet using AI
- Different explanation modes (line-by-line, summary, improvements, pitfalls)
- Syntax highlighting with dark theme
- Customizable prompts to control the explanation style
- Lightweight and easy to use

---

## Installation
Since this extension is not published on the Chrome Web Store yet, it must be installed manually.

1.Clone this repository:
   
   bash
   git clone https://github.com/NagaChetana/AI-CODE-EXPLAINER-CHROME-EXTENSION.git
  
2.Open Chrome and navigate to:

  - chrome://extensions/
  - Enable Developer Mode in the top right corner.
  - Click Load unpacked and select the extension folder.
  - The extension will be added to your Chrome toolbar.

3.Usage

- Select any code snippet on a webpage.
- Click the AI Code Explainer extension icon.
- Enter your OpenAI API Key (first-time setup only).
- Provide a prompt describing how you want the explanation (e.g., summary, detailed, step-by-step).
- View the generated explanation with syntax highlighting.

4.Technologies Used

- HTML, CSS, JavaScript, JSON.
- highlight.js for syntax highlighting.
- GitHub Dark theme for styling.
- OpenAI API for explanations.

5.Project Structure

 AI-CODE-EXPLAINER-CHROME-EXTENSION/
- **manifest.json** – Main configuration file for the Chrome extension  
- **background.js** – Background script handling core logic  
- **create_icon.html** – HTML page for testing/creating icons  
- **icon.png** – Default extension icon  
- **popup.html** – Popup UI  
- **popup.js** – Logic for popup interactions  
- **popup.css** – Styles for popup UI  
- **option.html** – Options/settings page  
- **option.js** – Logic for options page  

- **/icons** – Folder for extension icons  
  - icon16.png  
  - icon48.png  
  - icon128.png  
  - sg.html (test/demo file)  

- **/libs** – External libraries  
  - highlight.min.js (syntax highlighting)  
  - github-dark.min.css (dark theme for syntax highlighting)  
