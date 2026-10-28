# TypeAhead — Text Auto-Completion System

**Project type:** Minor Project · Algorithms & Data Structures  
**Topic:** Text Auto-Completion System  
**Academic area:** Algorithm Designs and Complexity  
**Developer:** Parikshit Gulia  
**Program:** B.Tech — Computer Science & Engineering  
**University:** SGT University, Gurugram, India

## What is this project?

TypeAhead is a real, working text editor that recommends complete English words while you type. When the user types `pro`, it can display `programming`, `project`, or `program`, ranked by popularity. Select a suggestion to insert it into the text. The system also contains a visual, step-by-step explanation of how it works.

**This is an algorithmic autocomplete system, not a large language model or generative AI.** It suggests words that start with a typed prefix, not whole-sentence predictions.

## How to run the project (easiest)

1. Extract the ZIP to a folder.
2. Open `index.html` in Google Chrome, Edge, Firefox or Safari.
3. Scroll to **The Playground**.
4. Type `pro`, `alg`, `dat`, or part of any word and select a suggestion.
5. Scroll to **Trie Visualizer** and click **Next step** to observe the search path.

There is **no need to install Python, Node.js, npm packages, databases, or run a server** for the website.

An optional local server, if Python is already installed:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## How to deploy as a LIVE public website (free, simple)

### Option A — Netlify Drop (recommended for today's presentation)

1. Extract `TypeAhead_Parikshit_Gulia.zip`.
2. Visit **https://app.netlify.com/drop** in a browser.
3. Drag the **extracted `TypeAhead_Parikshit_Gulia` folder** (the folder containing `index.html`) onto the deployment area.
4. Netlify provides a public `*.netlify.app` URL. Open it on your phone or share it with the faculty.
5. If the service asks you to log in or create a free account, complete that step.

Do **not** drag the ZIP itself if the upload area specifically asks for a folder.

### Option B — GitHub Pages

1. Make a new public GitHub repository.
2. Upload `index.html`, `styles.css`, `app.js`, `trie.js`, and `dictionary.js` to the repository root.
3. Go to **Settings → Pages → Build and deployment** and choose **Deploy from a branch → main → / (root)**. Save.
4. Once GitHub publishes it, the project's public GitHub Pages URL will be shown in Settings → Pages.

### Option C — Render Static Site

1. Push the project files to a GitHub repository.
2. At https://dashboard.render.com/ choose **New → Static Site** and connect that repository.
3. Set **Build Command** to `echo "No build required"` and **Publish Directory** to `.`.
4. Deploy. Render will assign a public Render URL.

**Important:** A public website link cannot be issued merely by making a ZIP. You must upload/deploy it on one of the above services. No hosting account access or credentials are included.

## Algorithm: Trie (Prefix Tree)

A Trie is a tree in which each path from its root corresponds to the letters in a word. Words with common beginnings share the same initial nodes. For example:

```
ROOT
  ├── p ─ r ─ o ─ j ─ e ─ c ─ t    (project)
  │          └── g ─ r ─ a ─ m    (program)
  │                     └── m ─ i ─ n ─ g   (programming)
  └── a ─ l ─ g ─ o ─ r ─ i ─ t ─ h ─ m   (algorithm)
```

The real application stores **up to 8 pre-ranked suggestions** in each node to make suggestions extremely quick once a prefix node has been found.

Search procedure:

1. Read the current word fragment before the text editor cursor, e.g. `pro`.
2. Starting from the Trie root, follow branches for `p`, then `r`, then `o`.
3. If any branch is missing, return no suggestions.
4. If the prefix exists, read the node's cached highest-ranked matches.
5. Show suggestions; user chooses one; its frequency is increased to improve future ranking.

### Complexity

Let:
- `N` = number of dictionary words
- `P` = typed prefix length
- `K` = maximum number of suggestions (8)
- `L` = length of inserted word

| Operation | Simple array | Our Trie |
| --- | --- | --- |
| Find a prefix | O(N × P) | O(P) |
| Return top suggestions | Requires ranking among matches | O(K), after prefix lookup |
| Insert a word | O(1) append only | O(L × K log K) to maintain per-node top-K lists |
| Space | Dictionary strings | Trie nodes plus top-K caches, generally more memory |

**Fast complete suggestion lookup is O(P + K)** when the Trie and per-node top-K lists are already built. `K=8` is fixed for this demo. **Building and updating** the Trie requires additional preprocessing; in this implementation, the application rebuilds Trie indexes after adding a word or changing a word's popularity. The benchmark compares querying a prebuilt Trie with scanning/ranking an array; it does not measure preprocessing.

## Technologies used

- HTML5 — interface and content
- CSS3 — responsive dark visual design and animations
- Vanilla JavaScript (ES6) — editor behavior, Trie structure, frequency ranking, Trie visualization, and benchmarks
- Browser `localStorage` — save user-added words and usage frequency on that device (where available)

No external JavaScript libraries, backend, or paid API calls. The design uses optional Google Fonts, but system font fallbacks work offline.

## What works in the live project?

- Real-time prefix-based autocomplete
- Keyboard arrows, Enter, and Escape
- Frequency-ranked top eight suggestions
- Technology, Everyday, Academic vocabulary filters
- Add up to 100 custom words
- Save learned ranking and custom words to local browser storage where available
- Reset dictionary
- Word counter, number of matches, prefix traversal count, measured query duration
- Step-by-step live Trie visualization, including unknown prefixes
- Browser-measured comparison of linear search vs cached Trie lookup
- Fully responsive layout for laptops and phones
- Explanations, interactive demonstrations, and developer profile included within the website

## Folder structure

```
Text_AutoCompletion_System/
├── index.html           Website content and all sections
├── styles.css           User interface and responsive layout
├── dictionary.js        Sample English vocabulary and starter ranking
├── trie.js              Actual reusable Trie data structure
├── app.js               Editor, ranking, visualization, benchmark, data storage
├── README.md            Run, deploy, algorithm and complexity instructions
├── PRESENTATION_GUIDE.md Simple presentation/viva notes
├── TEST_RESULTS.md      Automated and browser checks
└── tests/
    └── test_trie.cjs    Optional Node.js unit tests for the Trie
```

## How to verify the algorithm independently

If Node.js is installed, run:

```bash
node tests/test_trie.cjs
```

It tests matching, ranking, unknown prefixes, exact-word checks, duplicates, and limits. The website itself doesn't need Node.js.

## GitHub / CV portfolio

**Suggested GitHub repository name:** `typeahead-trie-autocomplete`  
**Suggested one-line description:** Interactive text autocomplete using a Trie (Prefix Tree), cached top-K prefix suggestions, and frequency-based ranking, built with vanilla JavaScript.

**Suggested CV entry (Minor Projects):**

**TypeAhead — Trie-Based Text Auto-Completion System** | HTML, CSS, JavaScript  
Designed a browser-based autocomplete tool using Trie prefix search and popularity-ranked top-8 suggestions; implemented a step-by-step Trie visualizer, editable vocabulary, and a simple performance comparison with linear search.

For GitHub, open the extracted folder in VS Code, commit the project files to a new repository, and enable GitHub Pages as described above. No build command is required.

## Academic note

This project illustrates a genuine data structure and ranking algorithm. The initial vocabulary and frequency values are demo data, not trained from a real-world corpus. Browser timings depend on the device. The measured speed-up should not be claimed to apply to all programs or datasets. Credit for the submitted project should reflect who actually worked on it.
