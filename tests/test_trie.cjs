/* Run: node tests/test_trie.cjs */
const assert = require('node:assert/strict');
const { Trie } = require('../trie.js');
const entries = [
  {word:'project',frequency:200},
  {word:'program',frequency:100},
  {word:'programming',frequency:300},
  {word:'algorithm',frequency:250},
  {word:'apple',frequency:80}
];
const trie = new Trie(entries, 8);
assert.equal(trie.wordCount,5);
assert.equal(trie.has('project'),true);
assert.equal(trie.has('pro'),false);
assert.equal(trie.has('nonexistent'),false);
assert.deepEqual(trie.suggest('pro').map(x=>x.word),['programming','project','program']);
assert.deepEqual(trie.suggest('alg').map(x=>x.word),['algorithm']);
assert.deepEqual(trie.suggest('zzz'),[]);
assert.deepEqual(trie.suggest(''),[]);
assert.equal(trie.findNode('pro').wordsBelow,3);
assert.equal(trie.trace('pro').length,4);
assert.equal(trie.trace('xyz')[1].found,false);
assert.equal(trie.insert({word:'project',frequency:999}),false);
assert.equal(trie.wordCount,5);
assert.equal(trie.insert({word:'invalid word',frequency:1}),false);
const tied = new Trie([{word:'cat',frequency:10},{word:'car',frequency:10}]);
assert.deepEqual(tied.suggest('ca').map(x=>x.word),['car','cat']);
const capped = new Trie(entries,2);
assert.deepEqual(capped.suggest('pro').map(x=>x.word),['programming','project']);
console.log('PASS: 14 Trie algorithm assertions completed.');
