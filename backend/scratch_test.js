import fs from "fs";

async function run() {
  // 1. Get problems
  const res = await fetch("http://localhost:5000/problems");
  const problems = await res.json();
  const problem = problems[0];
  console.log("Found problem:", problem.title, problem._id);

  // 2. Submit C++ code that passes
  const code = `
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;
int main() {
    string s;
    cin >> s;
    reverse(s.begin(), s.end());
    cout << s;
    return 0;
}
  `;

  console.log("Submitting code...");
  const submitRes = await fetch("http://localhost:5000/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "user123",
      problemId: problem._id,
      code,
      language: "cpp"
    })
  });
  
  const submitData = await submitRes.json();
  console.log("Submission response:", submitData);

  const subId = submitData.submissionId;

  // 3. Poll for result
  for(let i=0; i<10; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const statusRes = await fetch(`http://localhost:5000/submission/${subId}`);
    const statusData = await statusRes.json();
    console.log("Status:", statusData.status, statusData.result);
    if (statusData.status === "completed") break;
  }
}
run();
