import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mdPath = path.resolve(__dirname, "../p_data/INTERVIEW_QUESTION_BANK.md");
const jsonPath = path.resolve(__dirname, "../data/interview_questions.json");

function parseMarkdown() {
  console.log("Reading markdown from:", mdPath);
  const content = fs.readFileSync(mdPath, "utf-8");
  const lines = content.split(/\r?\n/);

  const data = {
    title: "UX Designer Interview Question Bank",
    evidenceAnchors: [],
    categories: []
  };

  let currentCategory = null;
  let currentQuestion = null;
  let currentSection = null; // 'include' | 'avoid' | 'standardAnswer'

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // 1. Parse Reusable Evidence Anchors (only before the first Category Heading ##)
    if (currentCategory === null && trimmedLine.startsWith("- **")) {
      const match = trimmedLine.match(/^- \*\*(.*?)\*\*:\s*(.*)$/);
      if (match) {
        data.evidenceAnchors.push({
          title: match[1].trim(),
          description: match[2].trim()
        });
      }
      continue;
    }

    // 2. Parse Category Headings (e.g. ## 1. Recruiter Screen)
    const categoryMatch = trimmedLine.match(/^##\s+(\d+)\.\s+(.*)$/);
    if (categoryMatch) {
      const catNum = parseInt(categoryMatch[1]);
      const title = categoryMatch[2].trim();
      currentCategory = {
        id: `cat-${catNum}`,
        categoryNum: catNum,
        title: title,
        questions: []
      };
      data.categories.push(currentCategory);
      currentQuestion = null;
      currentSection = null;
      continue;
    }

    // 3. Parse Question Headings (e.g. ### 1. Can you walk me through your background?)
    const questionMatch = trimmedLine.match(/^###\s+(\d+)\.\s+(.*)$/);
    if (questionMatch) {
      if (!currentCategory) {
        console.warn(`Warning: Question found before any category at line ${i + 1}`);
        continue;
      }
      const qNum = parseInt(questionMatch[1]);
      const questionText = questionMatch[2].trim();
      currentQuestion = {
        id: `q-${currentCategory.categoryNum}-${qNum}`,
        questionNum: qNum,
        question: questionText,
        include: [],
        avoid: [],
        standardAnswer: ""
      };
      currentCategory.questions.push(currentQuestion);
      currentSection = null;
      continue;
    }

    // 4. Parse Section Toggles
    if (trimmedLine === "**Include**") {
      currentSection = "include";
      continue;
    } else if (trimmedLine === "**Avoid**") {
      currentSection = "avoid";
      continue;
    } else if (trimmedLine === "**Standard Answer**") {
      currentSection = "standardAnswer";
      continue;
    }

    // 5. Parse Section Content
    if (currentQuestion && currentSection) {
      if (currentSection === "include") {
        if (trimmedLine.startsWith("- ")) {
          currentQuestion.include.push(trimmedLine.slice(2).trim());
        }
      } else if (currentSection === "avoid") {
        if (trimmedLine.startsWith("- ")) {
          currentQuestion.avoid.push(trimmedLine.slice(2).trim());
        }
      } else if (currentSection === "standardAnswer") {
        // Accumulate standard answer lines.
        if (trimmedLine === "") {
          if (currentQuestion.standardAnswer !== "" && !currentQuestion.standardAnswer.endsWith("\n\n")) {
            currentQuestion.standardAnswer += "\n\n";
          }
        } else {
          currentQuestion.standardAnswer += (currentQuestion.standardAnswer.endsWith("\n\n") || currentQuestion.standardAnswer === "" ? "" : " ") + trimmedLine;
        }
      }
    }
  }

  // Post-process: Clean up trailing newlines in standardAnswer text
  for (const cat of data.categories) {
    for (const q of cat.questions) {
      q.standardAnswer = q.standardAnswer.trim();
    }
  }

  console.log(`Parsed ${data.categories.length} categories and ${data.categories.reduce((acc, c) => acc + c.questions.length, 0)} questions.`);
  console.log(`Parsed ${data.evidenceAnchors.length} evidence anchors.`);

  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf-8");
  console.log("Successfully wrote compiled questions to:", jsonPath);
}

parseMarkdown();
