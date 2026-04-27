import type { Problem, ProblemSummary, Language } from "./types";

export const MOCK_PROBLEMS: Problem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Map"],
    acceptance: 54,
    description: "Return indices of the two numbers such that they add up to a specific target.",
    statement:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input has exactly one solution, and you may not use the same element twice.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists."],
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const c = target - nums[i];\n    if (map.has(c)) return [map.get(c), i];\n    map.set(nums[i], i);\n  }\n}\n`,
      typescript: `function twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const c = target - nums[i];\n    if (map.has(c)) return [map.get(c)!, i];\n    map.set(nums[i], i);\n  }\n  return [];\n}\n`,
      python: `def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {\n  unordered_map<int,int> m;\n  for (int i = 0; i < nums.size(); i++) {\n    if (m.count(target - nums[i])) return {m[target - nums[i]], i};\n    m[nums[i]] = i;\n  }\n  return {};\n}\n`,
      java: `public int[] twoSum(int[] nums, int target) {\n  Map<Integer,Integer> m = new HashMap<>();\n  for (int i = 0; i < nums.length; i++) {\n    if (m.containsKey(target - nums[i])) return new int[]{m.get(target - nums[i]), i};\n    m.put(nums[i], i);\n  }\n  return new int[0];\n}\n`,
    },
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    acceptance: 47,
    description: "Determine if the input string of brackets is valid.",
    statement:
      "Given a string `s` containing just the characters `'(', ')', '{', '}', '[' and ']'`, determine if the input string is valid.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: ["1 <= s.length <= 10^4"],
    starterCode: defaultStarter("isValid(s)"),
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["Sliding Window", "String"],
    acceptance: 36,
    description: "Find the length of the longest substring without repeating characters.",
    statement: "Given a string `s`, find the length of the longest substring without repeating characters.",
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc".' },
      { input: 's = "bbbbb"', output: "1" },
    ],
    constraints: ["0 <= s.length <= 5 * 10^4"],
    starterCode: defaultStarter("lengthOfLongestSubstring(s)"),
  },
  {
    id: "median-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    tags: ["Binary Search", "Array"],
    acceptance: 38,
    description: "Find the median of the two sorted arrays in O(log(min(m, n))).",
    statement: "Given two sorted arrays `nums1` and `nums2`, return the median of the combined arrays.",
    examples: [{ input: "nums1 = [1,3], nums2 = [2]", output: "2.0" }],
    constraints: ["nums1.length == m", "nums2.length == n", "0 <= m, n <= 1000"],
    starterCode: defaultStarter("findMedianSortedArrays(nums1, nums2)"),
  },
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    tags: ["Sorting", "Array"],
    acceptance: 49,
    description: "Merge all overlapping intervals.",
    statement: "Given an array of `intervals`, merge all overlapping intervals and return them sorted by start.",
    examples: [{ input: "[[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]" }],
    constraints: ["1 <= intervals.length <= 10^4"],
    starterCode: defaultStarter("merge(intervals)"),
  },
  {
    id: "word-ladder",
    title: "Word Ladder",
    difficulty: "Hard",
    tags: ["BFS", "Graph"],
    acceptance: 39,
    description: "Find the length of the shortest transformation sequence.",
    statement: "Find the shortest transformation sequence from `beginWord` to `endWord` using `wordList`.",
    examples: [{ input: 'beginWord = "hit", endWord = "cog"', output: "5" }],
    constraints: ["1 <= beginWord.length <= 10"],
    starterCode: defaultStarter("ladderLength(beginWord, endWord, wordList)"),
  },
  {
    id: "lru-cache",
    title: "LRU Cache",
    difficulty: "Medium",
    tags: ["Design", "Hash Map", "Linked List"],
    acceptance: 42,
    description: "Design a data structure for an LRU cache.",
    statement: "Implement the `LRUCache` class with `get` and `put` operations in O(1) average time.",
    examples: [{ input: "capacity = 2", output: "[null, null, 1, null, -1]" }],
    constraints: ["1 <= capacity <= 3000"],
    starterCode: defaultStarter("LRUCache(capacity)"),
  },
  {
    id: "binary-tree-zigzag",
    title: "Binary Tree Zigzag Level Order Traversal",
    difficulty: "Medium",
    tags: ["BFS", "Tree"],
    acceptance: 56,
    description: "Return zigzag level order traversal of a binary tree.",
    statement: "Given the `root` of a binary tree, return the zigzag level order traversal of its node values.",
    examples: [{ input: "root = [3,9,20,null,null,15,7]", output: "[[3],[20,9],[15,7]]" }],
    constraints: ["The number of nodes in the tree is in the range [0, 2000]."],
    starterCode: defaultStarter("zigzagLevelOrder(root)"),
  },
];

function defaultStarter(sig: string): Record<Language, string> {
  return {
    javascript: `function ${sig} {\n  // your code here\n}\n`,
    typescript: `function ${sig}: any {\n  // your code here\n}\n`,
    python: `def solution${sig.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase())}:\n    # your code here\n    pass\n`,
    cpp: `// implement ${sig}\n`,
    java: `// implement ${sig}\n`,
  };
}

export function listProblemSummaries(): ProblemSummary[] {
  return MOCK_PROBLEMS.map(({ id, title, description, difficulty, tags, acceptance }) => ({
    id,
    title,
    description,
    difficulty,
    tags,
    acceptance,
  }));
}

export function getProblem(id: string): Problem | undefined {
  return MOCK_PROBLEMS.find((p) => p.id === id);
}
