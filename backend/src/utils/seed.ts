import mongoose from "mongoose";
import "dotenv/config";
import Problem from "../models/Problem.js";

const seedDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error("MONGODB_URI is not defined");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing problems
    await Problem.deleteMany({});

    const sampleProblems = [
      {
        title: "Two Sum",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        difficulty: "Easy",
        tags: ["Array", "Hash Table"],
        timeLimit: 1000,
        memoryLimit: 512,
        isPublic: true,
        testcases: [
          { input: "4\n2 7 11 15\n9\n", expectedOutput: "0 1" },
          { input: "3\n3 2 4\n6\n", expectedOutput: "1 2" },
          { input: "2\n3 3\n6\n", expectedOutput: "0 1" }
        ],
        examples: [
          { 
            input: "nums = [2,7,11,15], target = 9", 
            output: "[0,1]", 
            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." 
          },
          { 
            input: "nums = [3,2,4], target = 6", 
            output: "[1,2]" 
          }
        ],
        constraints: [
          "2 <= nums.length <= 10^4",
          "-10^9 <= nums[i] <= 10^9",
          "-10^9 <= target <= 10^9",
          "Only one valid answer exists."
        ],
        starterCode: {
          python: `import sys

class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Implement your solution here
        pass

if __name__ == "__main__":
    try:
        # Read N
        n_line = sys.stdin.readline()
        if not n_line: exit(0)
        n = int(n_line.strip())
        
        # Read array
        nums = list(map(int, sys.stdin.readline().split()))
        
        # Read target
        target = int(sys.stdin.readline().strip())
        
        sol = Solution()
        result = sol.twoSum(nums, target)
        
        if result:
            print(*(sorted(result)))
    except Exception as e:
        pass`,
          cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Implement your solution here
        return {};
    }
};

int main() {
    int n;
    if (!(cin >> n)) return 0;
    
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    
    int target;
    cin >> target;
    
    Solution sol;
    vector<int> result = sol.twoSum(nums, target);
    
    if (!result.empty()) {
        sort(result.begin(), result.end());
        cout << result[0] << " " << result[1] << endl;
    }
    
    return 0;
}`
        }
      },
      {
        title: "Reverse String",
        description: "Write a function that reverses a string. The input string is given as a single line of text.",
        difficulty: "Easy",
        tags: ["String", "Two Pointers"],
        timeLimit: 1000,
        memoryLimit: 512,
        isPublic: true,
        testcases: [
          { input: "hello\n", expectedOutput: "olleh" },
          { input: "Hannah\n", expectedOutput: "hannaH" }
        ],
        examples: [
          { 
            input: "s = 'hello'", 
            output: "'olleh'" 
          },
          { 
            input: "s = 'Hannah'", 
            output: "'hannaH'" 
          }
        ],
        constraints: [
          "1 <= s.length <= 10^5",
          "s consists of printable ASCII characters."
        ],
        starterCode: {
          python: `import sys

def reverseString(s: str) -> str:
    # Implement your solution here
    return s[::-1]

if __name__ == "__main__":
    line = sys.stdin.readline().strip()
    if line:
        print(reverseString(line))`,
          cpp: `#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

string reverseString(string s) {
    // Implement your solution here
    reverse(s.begin(), s.end());
    return s;
}

int main() {
    string s;
    if (!(cin >> s)) return 0;
    cout << reverseString(s) << endl;
    return 0;
}`
        }
      }
    ];

    await Problem.insertMany(sampleProblems);
    console.log("Database seeded successfully with rich problem data and driver logic!");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    console.error("Error seeding database:", error.message);
    process.exit(1);
  }
};

seedDatabase();
