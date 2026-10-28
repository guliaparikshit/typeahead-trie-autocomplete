'use strict';
/*
  TYPEAHEAD — Trie-based text autocomplete portfolio project
  The actual prefix lookup is implemented in trie.js.
  All recommendations are deterministic vocabulary lookups, NOT AI predictions.
*/
(() => {
  const { Trie, compareEntries, DEFAULT_LIMIT } = window.AutocompleteCore;
  const STORAGE_KEY = 'typeahead-trie-demo-v1';
  const CATEGORIES = ['all', 'technology', 'everyday', 'academic'];
  const $ = id => document.getElementById(id);
  const editor = $('editor');
  const suggestionBox = $('suggestions');
  const state = {
    category: 'all',
    entries: [],
    tries: {},
    suggestions: [],
    prefix: '',
    prefixStart: 0,
    activeIndex: 0,
    suppressed: false,
    vizPrefix: 'pro',
    vizStep: 0,
    storageAvailable: true
  };

  function loadEntries() {
    const entries = window.SEED_DICTIONARY.map(entry => ({ ...entry }));
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
    catch (_) { state.storageAvailable = false; }
    if (saved && typeof saved === 'object') {
      const boosts = saved.boosts || {};
      entries.forEach(entry => {
        const boost = boosts[entry.word];
        if (Number.isFinite(boost)) entry.frequency += Math.max(0, Math.min(100000, boost));
      });
      if (Array.isArray(saved.custom)) {
        const unique = new Set(entries.map(entry => entry.word));
        for (const raw of saved.custom.slice(0, 100)) {
          if (!raw || typeof raw.word !== 'string') continue;
          const word = raw.word.toLowerCase();
          if (!/^[a-z]+(?:-[a-z]+)*$/.test(word) || word.length > 30 || unique.has(word)) continue;
          unique.add(word);
          const category = CATEGORIES.includes(raw.category) && raw.category !== 'all' ? raw.category : 'everyday';
          entries.push({ word, category, frequency: Number.isFinite(raw.frequency) ? Math.max(1, Math.min(100000, raw.frequency)) : 500, custom: true });
        }
      }
    }
    return entries;
  }

  function saveEntries() {
    const originalFrequencies = new Map(window.SEED_DICTIONARY.map(entry => [entry.word, entry.frequency]));
    const boosts = {};
    const custom = [];
    state.entries.forEach(entry => {
      if (entry.custom) custom.push(entry);
      else if (entry.frequency !== originalFrequencies.get(entry.word)) boosts[entry.word] = entry.frequency - originalFrequencies.get(entry.word);
    });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ boosts, custom })); state.storageAvailable = true; }
    catch (_) { state.storageAvailable = false; }
  }

  function rebuildTries() {
    state.tries = { all: new Trie(state.entries, DEFAULT_LIMIT) };
    for (const category of CATEGORIES.slice(1)) {
      state.tries[category] = new Trie(state.entries.filter(entry => entry.category === category), DEFAULT_LIMIT);
    }
    $('statWords').textContent = state.entries.length.toLocaleString('en-IN');
    $('statNodes').textContent = state.tries.all.nodeCount.toLocaleString('en-IN');
  }

  function getPrefixInfo() {
    const caret = editor.selectionStart;
    const beforeCaret = editor.value.slice(0, caret);
    const match = beforeCaret.match(/([A-Za-z]+(?:-[A-Za-z]+)*)$/);
    return { prefix: match ? match[1].toLowerCase() : '', start: match ? caret - match[1].length : caret };
  }

  function updateWordCounter() {
    const text = editor.value.trim();
    $('wordCounter').textContent = text ? text.split(/\s+/).length : '0';
    $('emptyHint').style.display = text ? 'none' : 'flex';
  }

  function setInsights(prefix, matches, ms) {
    $('currentPrefix').textContent = prefix || '—';
    $('currentPrefix').title = prefix || '';
    $('matchesCount').textContent = String(matches);
    const foundTrace = prefix ? state.tries[state.category].trace(prefix) : [];
    $('traversedCount').textContent = String(foundTrace.slice(1).filter(step => step.found).length);
    $('lookupTime').textContent = prefix ? `${ms.toFixed(3)} ms` : '—';
  }

  function renderSuggestions() {
    suggestionBox.replaceChildren();
    if (state.suppressed || !state.prefix || !state.suggestions.length) {
      suggestionBox.hidden = true;
      editor.setAttribute('aria-expanded', 'false');
      return;
    }
    state.suggestions.forEach((entry, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `suggestion-item${index === state.activeIndex ? ' active' : ''}`;
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', index === state.activeIndex ? 'true' : 'false');
      button.id = `suggestion-option-${index}`;
      const idx = document.createElement('span');
      idx.className = 'suggestion-idx';
      idx.textContent = String(index + 1).padStart(2, '0');
      const wordSpan = document.createElement('span');
      wordSpan.className = 'suggestion-text';
      const highlight = document.createElement('mark');
      highlight.textContent = entry.word.slice(0, state.prefix.length);
      wordSpan.append(highlight, document.createTextNode(entry.word.slice(state.prefix.length)));
      const frequency = document.createElement('span');
      frequency.className = 'suggestion-meta';
      frequency.textContent = `★ ${entry.frequency}`;
      button.append(idx, wordSpan, frequency);
      button.addEventListener('mousedown', event => event.preventDefault());
      button.addEventListener('click', () => acceptSuggestion(index));
      suggestionBox.appendChild(button);
    });
    suggestionBox.hidden = false;
    editor.setAttribute('aria-expanded', 'true');
    editor.setAttribute('aria-activedescendant', `suggestion-option-${state.activeIndex}`);
  }

  function updateAutocomplete() {
    updateWordCounter();
    const { prefix, start } = getPrefixInfo();
    state.prefix = prefix;
    state.prefixStart = start;
    const timeStart = performance.now();
    state.suggestions = prefix ? state.tries[state.category].suggest(prefix) : [];
    const elapsed = performance.now() - timeStart;
    state.activeIndex = 0;
    state.suppressed = false;
    setInsights(prefix, state.suggestions.length, elapsed);
    renderSuggestions();
  }

  function acceptSuggestion(index) {
    const selected = state.suggestions[index];
    if (!selected) return;
    const cursor = editor.selectionStart;
    const before = editor.value.slice(0, state.prefixStart);
    const after = editor.value.slice(cursor);
    const appendSpace = !after || !/^\s/.test(after);
    const replacement = selected.word + (appendSpace ? ' ' : '');
    editor.value = before + replacement + after;
    const newCaret = before.length + replacement.length;
    editor.focus();
    editor.setSelectionRange(newCaret, newCaret);
    // Frequency-based ranking: selecting a suggestion makes it more popular.
    const stored = state.entries.find(entry => entry.word === selected.word);
    if (stored) stored.frequency += 80;
    rebuildTries();
    saveEntries();
    state.suppressed = true;
    state.suggestions = [];
    state.prefix = '';
    setInsights('', 0, 0);
    renderSuggestions();
    updateWordCounter();
  }

  editor.addEventListener('input', updateAutocomplete);
  editor.addEventListener('click', updateAutocomplete);
  editor.addEventListener('keyup', event => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) updateAutocomplete();
  });
  editor.addEventListener('keydown', event => {
    if (suggestionBox.hidden || !state.suggestions.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      state.activeIndex = (state.activeIndex + 1) % state.suggestions.length;
      renderSuggestions();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      state.activeIndex = (state.activeIndex - 1 + state.suggestions.length) % state.suggestions.length;
      renderSuggestions();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      acceptSuggestion(state.activeIndex);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      state.suppressed = true;
      renderSuggestions();
    }
  });

  $('clearText').addEventListener('click', () => {
    editor.value = '';
    editor.focus();
    updateAutocomplete();
  });
  document.querySelectorAll('[data-demo]').forEach(button => {
    button.addEventListener('click', () => {
      editor.value = `I am working on a ${button.dataset.demo}`;
      editor.focus();
      editor.setSelectionRange(editor.value.length, editor.value.length);
      updateAutocomplete();
    });
  });
  document.querySelectorAll('.filter').forEach(button => {
    button.addEventListener('click', () => {
      state.category = button.dataset.category;
      document.querySelectorAll('.filter').forEach(other => {
        const active = other === button;
        other.classList.toggle('active', active);
        other.setAttribute('aria-pressed', String(active));
      });
      updateAutocomplete();
    });
  });

  function showFormMessage(message, isError = false) {
    const element = $('addWordMessage');
    element.textContent = message;
    element.classList.add('visible');
    element.classList.toggle('error', isError);
  }
  $('addWordForm').addEventListener('submit', event => {
    event.preventDefault();
    const input = $('newWord');
    const word = input.value.trim().toLowerCase();
    if (!/^[a-z]+(?:-[a-z]+)*$/.test(word) || word.length > 30) {
      showFormMessage('Please enter one English word (letters only, optional internal hyphen; maximum 30 characters).', true);
      return;
    }
    if (state.entries.some(entry => entry.word === word)) {
      showFormMessage(`“${word}” is already in the dictionary.`, true);
      return;
    }
    if (state.entries.filter(entry => entry.custom).length >= 100) {
      showFormMessage('The demo supports up to 100 additional words. Use reset to start over.', true);
      return;
    }
    const category = state.category === 'all' ? 'everyday' : state.category;
    state.entries.push({ word, category, frequency: 550, custom: true });
    rebuildTries();
    saveEntries();
    input.value = '';
    showFormMessage(`✓ “${word}” added to ${category}. Try typing its first letters above!${state.storageAvailable ? '' : ' (Storage is blocked in this browser.)'}`);
    updateAutocomplete();
  });
  $('resetData').addEventListener('click', () => {
    const answer = window.confirm('Reset added words and learned rankings on this browser?');
    if (!answer) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* disabled browser storage */ }
    state.entries = window.SEED_DICTIONARY.map(entry => ({ ...entry }));
    rebuildTries();
    updateAutocomplete();
    showFormMessage('✓ Dictionary and popularity rankings reset to original values.');
  });

  // Actual interactive Trie traversal (not a decorative, hard-coded diagram).
  function drawTrace() {
    const prefix = state.vizPrefix;
    const path = $('triePath');
    const branch = $('branchArea');
    path.replaceChildren();
    branch.replaceChildren();
    const steps = state.tries.all.trace(prefix);
    for (let i = 0; i < steps.length; i++) {
      if (i > 0) {
        const connector = document.createElement('span');
        connector.className = `tree-connector${i <= state.vizStep && steps[i].found ? ' visited' : ''}`;
        path.appendChild(connector);
      }
      const node = document.createElement('span');
      const visited = i <= state.vizStep;
      node.className = 'tree-node' + (i === 0 ? ' root-node' : '') + (visited && steps[i].found ? ' visited' : '') + (visited && !steps[i].found ? ' missing' : '') + (!visited ? ' pending' : '');
      node.textContent = i === 0 ? 'ROOT' : steps[i].label;
      node.title = steps[i].found ? `${steps[i].node.wordsBelow} words share this prefix` : 'Letter not found';
      path.appendChild(node);
    }
    $('stepLabel').textContent = `STEP ${state.vizStep} / ${prefix.length}`;
    const lastStep = steps[state.vizStep];
    if (state.vizStep === 0) {
      $('stepExplanation').textContent = 'We start at the ROOT node. Click “Next step” to follow the first letter.';
    } else if (!lastStep.found) {
      $('stepExplanation').textContent = `No path for the letter “${steps[state.vizStep].label}” — this prefix has no matching words.`;
    } else if (state.vizStep < prefix.length) {
      $('stepExplanation').textContent = `Found “${steps[state.vizStep].label}”! We have followed “${prefix.slice(0, state.vizStep)}”. Move to the next character.`;
    } else {
      $('stepExplanation').textContent = `Prefix “${prefix}” found! This node holds ${lastStep.node.wordsBelow} matching word(s) and caches the highest-ranked suggestions.`;
    }
    if (state.vizStep === prefix.length) {
      if (lastStep.found) {
        const caption = document.createElement('span');
        caption.className = 'branch-caption';
        caption.textContent = 'NEXT LETTERS →';
        branch.appendChild(caption);
        const children = [...lastStep.node.children.entries()].sort((a,b) => b[1].wordsBelow - a[1].wordsBelow).slice(0,8);
        if (children.length === 0) {
          const pill = document.createElement('span');
          pill.className = 'branch-pill'; pill.textContent = '✓ complete word';
          branch.appendChild(pill);
        }
        children.forEach(([letter, node]) => {
          const pill = document.createElement('span');
          pill.className = 'branch-pill';
          pill.textContent = letter;
          const number = document.createElement('em');
          number.textContent = `${node.wordsBelow} word${node.wordsBelow === 1 ? '' : 's'}`;
          pill.appendChild(number);
          branch.appendChild(pill);
        });
      }
      const matched = state.tries.all.suggest(prefix);
      $('vizResult').textContent = matched.length ? `Top matches: ${matched.slice(0, 3).map(item => item.word).join(', ')}` : 'No matching words';
    } else {
      $('vizResult').textContent = `Follow the letters of “${prefix}”`;
    }
    $('prevStep').disabled = state.vizStep === 0;
    $('nextStep').disabled = state.vizStep === prefix.length;
  }

  function beginTrace() {
    const prefix = $('vizPrefix').value.trim().toLowerCase();
    if (!/^[a-z]{1,16}$/.test(prefix)) {
      $('stepExplanation').textContent = 'Please enter 1–16 English letters to visualize.';
      return;
    }
    state.vizPrefix = prefix;
    state.vizStep = 0;
    drawTrace();
  }
  $('traceButton').addEventListener('click', beginTrace);
  $('vizPrefix').addEventListener('keydown', event => {
    if (event.key === 'Enter') beginTrace();
  });
  document.querySelectorAll('[data-prefix]').forEach(button => {
    button.addEventListener('click', () => {
      $('vizPrefix').value = button.dataset.prefix;
      beginTrace();
    });
  });
  $('nextStep').addEventListener('click', () => { state.vizStep = Math.min(state.vizPrefix.length, state.vizStep + 1); drawTrace(); });
  $('prevStep').addEventListener('click', () => { state.vizStep = Math.max(0, state.vizStep - 1); drawTrace(); });
  $('showAllSteps').addEventListener('click', () => { state.vizStep = state.vizPrefix.length; drawTrace(); });

  // Empirical benchmark using performance.now(): all times measured on visitor's device.
  $('runBenchmark').addEventListener('click', () => {
    const button = $('runBenchmark');
    button.disabled = true;
    button.textContent = 'Measuring...';
    requestAnimationFrame(() => setTimeout(() => {
      try {
        const dataset = state.entries;
        const trie = state.tries.all;
        const prefixes = ['pro', 'alg', 'dat', 'comp', 'app', 'st', 're', 'learn', 'xyz'];
        const repetitions = 1500;
        let checksum = 0;
        function linearLookup(prefix) {
          return dataset.filter(entry => entry.word.startsWith(prefix)).sort(compareEntries).slice(0,8);
        }
        // Warm-up is identical for both implementations.
        prefixes.forEach(prefix => { linearLookup(prefix); trie.suggest(prefix); });
        let start = performance.now();
        for (let i = 0; i < repetitions; i++) {
          for (const prefix of prefixes) checksum += linearLookup(prefix).length;
        }
        const linearTime = performance.now() - start;
        start = performance.now();
        for (let i = 0; i < repetitions; i++) {
          for (const prefix of prefixes) checksum += trie.suggest(prefix).length;
        }
        const trieTime = performance.now() - start;
        const max = Math.max(linearTime, trieTime, 0.00001);
        const container = $('benchResults');
        container.replaceChildren();
        function appendRow(name, value, kind) {
          const row = document.createElement('div'); row.className = 'bench-row';
          const label = document.createElement('strong'); label.textContent = name;
          const track = document.createElement('div'); track.className = 'bench-bar-track';
          const bar = document.createElement('div'); bar.className = `bench-bar ${kind}`;
          bar.style.width = `${Math.max(0.8, 100*value/max)}%`;
          track.appendChild(bar);
          const time = document.createElement('span'); time.className = 'bench-value'; time.textContent = `${value.toFixed(2)} ms`;
          row.append(label,track,time); container.appendChild(row);
        }
        appendRow('Linear search', linearTime, 'linear');
        appendRow('Trie lookup', trieTime, 'trie');
        const note = document.createElement('p'); note.className = 'bench-note';
        note.textContent = `${(prefixes.length * repetitions).toLocaleString('en-IN')} lookups per method; ${dataset.length} dictionary words. ${trieTime < linearTime ? `Trie was ${(linearTime / Math.max(trieTime,0.00001)).toFixed(1)}× faster in this run.` : 'Linear scan was faster in this run.'} Timings vary by device, browser and workload. This comparison includes sorting for linear search, while Trie suggestions are pre-ranked during dictionary building. Checksum: ${checksum}.`;
        container.appendChild(note);
      } catch (error) {
        $('benchResults').textContent = 'Benchmark could not run: ' + error.message;
      } finally {
        button.disabled = false; button.textContent = 'Run benchmark again ⚡';
      }
    }, 20));
  });

  $('menuToggle').addEventListener('click', () => {
    const nav = document.querySelector('.main-nav');
    const open = nav.classList.toggle('open');
    $('menuToggle').setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelector('.main-nav').classList.remove('open');
      $('menuToggle').setAttribute('aria-expanded', 'false');
    });
  });

  // Initialize the actual project.
  state.entries = loadEntries();
  rebuildTries();
  updateWordCounter();
  setInsights('', 0, 0);
  drawTrace();
  editor.setAttribute('aria-autocomplete', 'list');
  editor.setAttribute('aria-expanded', 'false');
})();
