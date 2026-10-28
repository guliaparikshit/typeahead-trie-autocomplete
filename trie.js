/*
 * Text Auto-Completion System — Trie algorithm
 * Subject: Algorithm Designs and Complexity
 * No packages or external services are required.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AutocompleteCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const DEFAULT_LIMIT = 8;

  class TrieNode {
    constructor(character = '') {
      this.character = character;
      this.children = new Map();
      this.isWord = false;
      this.wordsBelow = 0;
      this.top = [];
    }
  }

  function compareEntries(a, b) {
    return (b.frequency - a.frequency) || a.word.localeCompare(b.word);
  }

  class Trie {
    constructor(entries = [], limit = DEFAULT_LIMIT) {
      this.root = new TrieNode('ROOT');
      this.limit = limit;
      this.wordCount = 0;
      this.nodeCount = 1;
      entries.forEach(entry => this.insert(entry));
    }

    insert(entry) {
      const word = String(entry.word || '').toLowerCase();
      if (!/^[a-z]+(?:-[a-z]+)*$/.test(word)) return false;
      let node = this.root;
      const path = [node];
      for (const letter of word) {
        if (!node.children.has(letter)) {
          node.children.set(letter, new TrieNode(letter));
          this.nodeCount++;
        }
        node = node.children.get(letter);
        path.push(node);
      }
      if (node.isWord) return false; // Build from unique entries; no duplicate insertion.
      node.isWord = true;
      this.wordCount++;
      for (const visited of path) {
        visited.wordsBelow++;
        visited.top.push(entry);
        visited.top.sort(compareEntries);
        if (visited.top.length > this.limit) visited.top.length = this.limit;
      }
      return true;
    }

    findNode(prefix) {
      let node = this.root;
      for (const letter of String(prefix).toLowerCase()) {
        node = node.children.get(letter);
        if (!node) return null;
      }
      return node;
    }

    suggest(prefix, count = DEFAULT_LIMIT) {
      if (!prefix || !/^[a-z]+(?:-[a-z]+)*$/.test(prefix)) return [];
      const node = this.findNode(prefix);
      return node ? node.top.slice(0, Math.min(count, this.limit)) : [];
    }

    has(word) {
      const node = this.findNode(word);
      return Boolean(node && node.isWord);
    }

    trace(prefix) {
      const steps = [{ label: 'ROOT', node: this.root, found: true }];
      let node = this.root;
      for (const character of String(prefix).toLowerCase()) {
        node = node ? node.children.get(character) : null;
        steps.push({ label: character, node, found: Boolean(node) });
      }
      return steps;
    }
  }

  return { Trie, TrieNode, compareEntries, DEFAULT_LIMIT };
});
