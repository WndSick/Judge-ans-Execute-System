import mongoose from "mongoose";
import Problem from "./models/Problem";
import Contest from "./models/Contest";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/judge_db";

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  await Problem.deleteMany({});
  await Contest.deleteMany({});

  const p1 = await Problem.create({
    title: "Two Sum",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    testcases: [
      { input: "2 7 11 15\n9", expectedOutput: "0 1" },
      { input: "3 2 4\n6", expectedOutput: "1 2" }
    ],
    starterCode: {
      python: "def solve(nums, target):\n    # Write your code here\n    pass",
      cpp: "#include <iostream>\n#include <vector>\n\nint main() {\n    // Write your code here\n    return 0;\n}"
    },
    isPublic: true,
    timeLimit: 1000,
    memoryLimit: 512,
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9"
    ],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ]
  });

  const p2 = await Problem.create({
    title: "Add Two Numbers",
    description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
    difficulty: "Medium",
    tags: ["Linked List", "Math"],
    testcases: [
      { input: "2 4 3\n5 6 4", expectedOutput: "7 0 8" }
    ],
    starterCode: {
      python: "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef addTwoNumbers(l1, l2):\n    pass"
    },
    isPublic: true,
    timeLimit: 1000,
    memoryLimit: 512,
    constraints: [
      "The number of nodes in each linked list is in the range [1, 100].",
      "0 <= Node.val <= 9"
    ],
    examples: [
      {
        input: "l1 = [2,4,3], l2 = [5,6,4]",
        output: "[7,0,8]",
        explanation: "342 + 465 = 807."
      }
    ]
  });

  const now = new Date();
  const start = new Date(now.getTime() - 1000 * 60 * 60); 
  const end = new Date(now.getTime() + 1000 * 60 * 60 * 2);

  await Contest.create({
    title: "Biweekly Contest 128",
    description: "Compete against the best in this biweekly challenge.",
    problemIds: [p1._id, p2._id],
    startTime: start,
    endTime: end
  });

  console.log("Seeding complete with enhanced problem definitions");
  process.exit(0);
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
