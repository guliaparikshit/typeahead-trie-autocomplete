# Presentation / Viva Guide — Very Easy Language

**Project:** Text Auto-Completion System  
**Subject:** Algorithm Designs and Complexity  
**Program:** B.Tech Computer Science & Engineering  
**Developer:** Parikshit Gulia  
**University:** SGT University, Gurugram

## 1. Opening — 20 seconds

“Good morning, ma'am/sir. Today I am presenting my project **Text Auto-Completion System** for the subject **Algorithm Designs and Complexity**. Our website gives suggestions to complete a word when I start typing. It works using an important data structure called a **Trie**, also known as a **Prefix Tree**.”

## 2. The problem — 20 seconds

“Typing every word fully takes time. Many applications, like search boxes, phone keyboards, and dictionaries, suggest words as we type. I wanted to understand how such a feature can work efficiently with algorithms.”

## 3. Actual demo — 60 seconds

1. Open the site and go to **Live demo**.
2. Type **pro** in the editor. Show word suggestions.
3. Use **Arrow Down** and **Enter** to select `project` or another suggestion.
4. Type **alg** and select `algorithm`.
5. Switch **Tech / Everyday / Academic** category and explain that suggestions can be filtered.
6. Add a word such as `innovator` using **Add word**. Type `innov` and show that the new word is found.

**Say:** “The user types some letters, and the program suggests words starting with exactly those letters. It is an autocomplete feature, not a chatbot.”

## 4. Trie algorithm — 40 seconds

“Trie is like a family tree of letters. Words that start with the same letters share the same branches. For example `program`, `programming`, and `project` all share the letters `p`, `r`, `o`. When I type `pro`, we follow the path ROOT → p → r → o. The algorithm does not have to check every word from beginning to end.”

Open **Trie Visualizer**, enter **pro**, and press **Next step** repeatedly. The nodes turn green. Then select **Show all** to show the remaining branches.

## 5. Complexity — 35 seconds

“Let N be the total dictionary words, P the number of typed letters, and K the number of suggestions we show. A basic list search checks every word: O(N × P). The Trie reaches the right prefix in O(P). Because the system stores the top K suggestions at each node, returning suggestions takes O(K), so our lookup is O(P + K). The interface shows at most eight suggestions. The extra speed uses additional memory and preprocessing.”

**Say clearly:** “Updating the dictionary is not free. The app rebuilds the Trie when the popularity or words change. The complexity O(P + K) is for a lookup using the already-built Trie.”

## 6. Technologies — 15 seconds

“I used HTML for the page structure, CSS for the website design, and JavaScript for the Trie algorithm and interactive features. There is no backend or paid API. The website opens even without internet after downloading it.”

## 7. Conclusion — 15 seconds

“This project shows how selecting the right data structure can help a website respond efficiently. The same idea of searching a prefix is useful in search boxes, dictionaries, contact search, and IDE code suggestions. Thank you.”

---

## Common viva questions — short and accurate answers

**Q1. What is auto-completion?**  
It predicts or suggests possible complete words from the letters already typed.

**Q2. Which algorithm did you use?**  
I used a Trie/Prefix Tree for prefix search, with top-K suggestion caching and frequency-based ranking.

**Q3. What is a Trie?**  
A tree data structure that stores words character by character. Common prefixes share nodes.

**Q4. What does O(P + K) mean?**  
P steps to follow the typed letters and up to K results to read from the node's cached list.

**Q5. Why not use a simple array?**  
A simple search may need to inspect all N words. A Trie follows only the prefix path, once its index has been built.

**Q6. Does your project use AI or machine learning?**  
No. It uses a classic data structure and word popularity ranking. This is the focus of our algorithm subject.

**Q7. What happens if there is no matching word?**  
The Trie cannot find the next letter branch and returns no suggestions.

**Q8. What happens when a word is selected?**  
Its popularity increases, and the Trie is rebuilt to rank it higher in future suggestions.

**Q9. Can you add a new word?**  
Yes. The **Add word** feature inserts it into the stored dictionary and rebuilds the search index.

**Q10. What are the limitations?**  
The project uses a fixed sample dictionary and English-letter words. Suggestions use prefixes, not context-aware sentences. Trie nodes and cached lists also use extra memory.

**Q11. What is the difference between searching and sorting?**  
Searching finds matches; sorting or ranking decides their order. Here Trie finds the prefix and stored popularity values decide the suggestion order.

**Q12. What is the time complexity of inserting a word?**  
The algorithm walks L letters and update top-K lists along the way: O(L × K log K) with a simple sort at each node. K is fixed at 8, so it behaves like O(L) for a fixed-size cache.

**Q13. What if a user closes the page?**  
Original words remain available. Custom words and learned rankings are saved using the browser's local storage where supported. Different browsers/devices do not automatically share these custom changes.

**Q14. Why a website?**  
A website makes it easy to demonstrate the algorithm in real time. The implementation uses JavaScript for both the Trie and the editor.

**Q15. How many suggestions are shown?**  
Up to 8, ranked by popularity score.

---

## Project details for a portfolio demo

- **Developer:** Parikshit Gulia
- **Degree:** B.Tech, Computer Science & Engineering
- **Institution:** SGT University, Gurugram
- **Classification:** Minor Project · Algorithms & Data Structures

For a portfolio interview, demonstrate `pro` in the editor, then show the Trie traversal and explain the O(P + K) cached lookup. Describe the fixed sample vocabulary and the fact that this is not a machine-learning model.
