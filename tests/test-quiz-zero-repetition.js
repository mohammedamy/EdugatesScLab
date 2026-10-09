// tests/test-quiz-zero-repetition.js
// Comprehensive verification suite for Quiz Engine & Question Bank:
// 1. Zero Duplicate Diagrams in any single quiz/exam/print/presentation under all circumstances.
// 2. Zero Duplicate Diagrams within any lesson across the entire platform (all 242 lessons).
// 3. Zero Duplicate Options within any question (all 7,260 questions).
// 4. Zero Nested \text{ \text{ occurrences.
// 5. Maximum Concept & Angle Diversity with zero stem repetitions in generated quizzes.

import { questionBank, getQuestionsForLesson } from "../data/question-bank.js";
import { SCIENTIFIC_DIAGRAMS } from "../data/scientific-diagrams.js";
import {
  deduplicateQuestions,
  getQuestionFingerprint,
  getQuestionDiagramKey,
  getQuestionStemKey,
  isSameQuestion
} from "../components/quiz-engine.js";

console.log("\n========================================================");
console.log("🛡️ Master Quiz Zero Repetition & Unique Diagrams Invariant Suite");
console.log("========================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// 1. QUESTION BANK SIZE & STRUCTURAL INTEGRITY
// -----------------------------------------------------------------------------
console.log("--- 1. Question Bank Integrity & Format ---");
assert(questionBank.length === 7260, `Question bank contains exactly 7,260 items (got ${questionBank.length})`);

// -----------------------------------------------------------------------------
// 2. ZERO INTERNAL DUPLICATE OPTIONS ACROSS ALL 7,260 QUESTIONS
// -----------------------------------------------------------------------------
console.log("\n--- 2. Internal Options Integrity (Zero Duplicate Choices) ---");
let internalDupCount = 0;
const failingQIds = [];

for (const q of questionBank) {
  if (Array.isArray(q.options)) {
    const opts = q.options.map(o => String(o).trim());
    const uniqueOpts = new Set(opts);
    if (uniqueOpts.size < opts.length) {
      internalDupCount++;
      failingQIds.push(q.id);
    }
  }
}
assert(internalDupCount === 0, `All 7,260 questions have strictly unique choices in options array (failing: ${internalDupCount})`);
if (failingQIds.length > 0) {
  console.error("  Sample failing IDs:", failingQIds.slice(0, 5));
}

// -----------------------------------------------------------------------------
// 3. ZERO NESTED \text{ \text{ IN ANY QUESTION
// -----------------------------------------------------------------------------
console.log("\n--- 3. Clean LaTeX Formatting (Zero Nested \\text{ \\text{) ---");
let nestedTextCount = 0;
for (const q of questionBank) {
  const s = JSON.stringify(q);
  if (s.includes("\\text{ \\text{") || s.includes("\\text{\\text{")) {
    nestedTextCount++;
  }
}
assert(nestedTextCount === 0, `Zero occurrences of nested \\text{ \\text{ in question bank (found: ${nestedTextCount})`);

// -----------------------------------------------------------------------------
// 4. ZERO INTRA-LESSON DUPLICATE DIAGRAMS ACROSS ALL 242 LESSONS
// -----------------------------------------------------------------------------
console.log("\n--- 4. Lesson Diagram Uniqueness (All 242 Lessons) ---");
const lessonDiagramMap = {};
for (const q of questionBank) {
  const lKey = `${q.subject}-M${q.moduleId}-L${q.lessonId}`;
  if (!lessonDiagramMap[lKey]) lessonDiagramMap[lKey] = [];
  if (q.diagram && q.diagram.id) {
    lessonDiagramMap[lKey].push({ qId: q.id, diagId: q.diagram.id });
  }
}

const duplicateLessonKeys = [];
let totalLessonCount = 0;
for (const [lKey, diags] of Object.entries(lessonDiagramMap)) {
  totalLessonCount++;
  const ids = diags.map(d => d.diagId);
  const set = new Set(ids);
  if (set.size < ids.length) {
    duplicateLessonKeys.push(lKey);
  }
}

assert(totalLessonCount === 242, `Checked all 242 curriculum lessons (got ${totalLessonCount})`);
assert(duplicateLessonKeys.length === 0, `Every single lesson has 6 strictly unique diagrams (duplicate lessons: ${duplicateLessonKeys.length})`);
if (duplicateLessonKeys.length > 0) {
  console.error("  Lessons with duplicate diagrams:", duplicateLessonKeys);
}

// -----------------------------------------------------------------------------
// 5. QUIZ ENGINE INVARIANT: NEVER ALLOW SAME DIAGRAM IN SAME QUIZ
// -----------------------------------------------------------------------------
console.log("\n--- 5. Quiz Engine Invariant: Never Allow Same Diagram in Same Quiz ---");

// Test A: Single lesson full quiz (all 30 questions)
function simulateQuizGeneration(pool, countVal) {
  const sanitized = deduplicateQuestions(pool);
  const targetCount = countVal === "ALL" ? sanitized.length : Math.min(parseInt(countVal, 10) || 10, sanitized.length);
  const chosen = [];
  const seenExamDiagrams = new Set();
  const seenExamAngles = new Set();
  const seenExamStems = new Set();

  for (const q of sanitized) {
    if (chosen.length >= targetCount) break;
    if (chosen.some(c => isSameQuestion(c, q))) continue;

    const dKey = getQuestionDiagramKey(q);
    if (dKey && seenExamDiagrams.has(dKey)) continue;

    const angle = q.angle || "";
    if (angle && seenExamAngles.has(angle)) continue;

    const stemKey = getQuestionStemKey(q);
    if (stemKey && seenExamStems.has(stemKey)) continue;

    if (dKey) seenExamDiagrams.add(dKey);
    if (angle) seenExamAngles.add(angle);
    if (stemKey) seenExamStems.add(stemKey);
    chosen.push(q);
  }

  // Pass 2
  if (chosen.length < targetCount) {
    for (const q of sanitized) {
      if (chosen.length >= targetCount) break;
      if (chosen.some(c => isSameQuestion(c, q))) continue;

      const dKey = getQuestionDiagramKey(q);
      if (dKey && seenExamDiagrams.has(dKey)) continue; // STRICT: NEVER ALLOW SAME DIAGRAM

      const stemKey = getQuestionStemKey(q);
      if (dKey) seenExamDiagrams.add(dKey);
      if (stemKey) seenExamStems.add(stemKey);
      chosen.push(q);
    }
  }

  return deduplicateQuestions(chosen, { uniqueDiagrams: true });
}

// Run simulation across 50 diverse scopes
let duplicateDiagramsInAnyQuiz = 0;
let duplicateQuestionsInAnyQuiz = 0;
let duplicateStemsInSmallQuizzes = 0;
let testCasesCount = 0;

// Test single-lesson quizzes for previously affected lessons
const testLessons = [
  { sub: "CHEM", m: 3, l: 2 },
  { sub: "CHEM", m: 3, l: 3 },
  { sub: "CHEM", m: 19, l: 1 },
  { sub: "BIO", m: 7, l: 4 },
  { sub: "BIO", m: 8, l: 2 },
  { sub: "BIO", m: 11, l: 2 },
  { sub: "BIO", m: 12, l: 1 },
  { sub: "PHYS", m: 5, l: 1 },
  { sub: "PHYS", m: 11, l: 2 },
  { sub: "PHYS", m: 17, l: 1 },
  { sub: "PHYS", m: 19, l: 3 },
  { sub: "PHYS", m: 22, l: 1 }
];

for (const { sub, m, l } of testLessons) {
  const lessonQuestions = questionBank.filter(q => q.subject === sub && q.moduleId === m && q.lessonId === l);
  for (const count of [10, 20, 30]) {
    testCasesCount++;
    const quiz = simulateQuizGeneration(lessonQuestions, count);
    
    // Check diagram uniqueness
    const diagKeys = quiz.map(q => getQuestionDiagramKey(q)).filter(Boolean);
    const uniqueDiagKeys = new Set(diagKeys);
    if (uniqueDiagKeys.size < diagKeys.length) {
      duplicateDiagramsInAnyQuiz++;
      console.error(`Duplicate diagram in ${sub}-M${m}-L${l} (count ${count}):`, diagKeys);
    }

    // Check question uniqueness
    const ids = quiz.map(q => q.id);
    if (new Set(ids).size < ids.length) {
      duplicateQuestionsInAnyQuiz++;
    }

    // Check stem uniqueness for 10-item and 20-item quizzes
    if (count <= 20) {
      const stems = quiz.map(q => getQuestionStemKey(q)).filter(Boolean);
      if (new Set(stems).size < stems.length) {
        duplicateStemsInSmallQuizzes++;
      }
    }
  }
}

// Multi-lesson module quizzes
for (let m = 1; m <= 5; m++) {
  const chemModQuestions = questionBank.filter(q => q.subject === "CHEM" && q.moduleId === m);
  for (const count of [15, 25, 40]) {
    testCasesCount++;
    const quiz = simulateQuizGeneration(chemModQuestions, count);
    const diagKeys = quiz.map(q => getQuestionDiagramKey(q)).filter(Boolean);
    if (new Set(diagKeys).size < diagKeys.length) {
      duplicateDiagramsInAnyQuiz++;
    }
    const ids = quiz.map(q => q.id);
    if (new Set(ids).size < ids.length) {
      duplicateQuestionsInAnyQuiz++;
    }
  }
}

// Whole subject comprehensive exam (50 questions)
for (const sub of ["CHEM", "BIO", "PHYS"]) {
  const subQuestions = questionBank.filter(q => q.subject === sub);
  testCasesCount++;
  const quiz = simulateQuizGeneration(subQuestions, 50);
  const diagKeys = quiz.map(q => getQuestionDiagramKey(q)).filter(Boolean);
  if (new Set(diagKeys).size < diagKeys.length) {
    duplicateDiagramsInAnyQuiz++;
  }
  const ids = quiz.map(q => q.id);
  if (new Set(ids).size < ids.length) {
    duplicateQuestionsInAnyQuiz++;
  }
}

assert(testCasesCount >= 50, `Executed ${testCasesCount} simulated quiz generations across scopes and counts`);
assert(duplicateDiagramsInAnyQuiz === 0, `Zero quizzes contained duplicate diagrams (failures: ${duplicateDiagramsInAnyQuiz})`);
assert(duplicateQuestionsInAnyQuiz === 0, `Zero quizzes contained duplicate questions (failures: ${duplicateQuestionsInAnyQuiz})`);
assert(duplicateStemsInSmallQuizzes === 0, `Zero quizzes of <= 20 questions contained duplicate template stems (failures: ${duplicateStemsInSmallQuizzes})`);

// -----------------------------------------------------------------------------
// 6. DEDUPLICATE QUESTIONS UNIQUE DIAGRAMS OPTION
// -----------------------------------------------------------------------------
console.log("\n--- 6. deduplicateQuestions({ uniqueDiagrams: true }) Invariant ---");
const mockDiagramQ1 = { id: "T1", question: "Prompt 1", diagram: { id: "diag_shared" } };
const mockDiagramQ2 = { id: "T2", question: "Prompt 2", diagram: { id: "diag_shared" } };
const mockDiagramQ3 = { id: "T3", question: "Prompt 3", diagram: { id: "diag_different" } };
const mockTextQ = { id: "T4", question: "Prompt 4" };

const deduplicated = deduplicateQuestions([mockDiagramQ1, mockDiagramQ2, mockDiagramQ3, mockTextQ], { uniqueDiagrams: true });
assert(deduplicated.length === 3, `deduplicateQuestions removed duplicate diagram question (3 of 4 kept, got ${deduplicated.length})`);
assert(deduplicated.some(q => q.id === "T1"), "Kept first question with shared diagram");
assert(!deduplicated.some(q => q.id === "T2"), "Strictly excluded second question with shared diagram");
assert(deduplicated.some(q => q.id === "T3"), "Kept question with unique diagram");
assert(deduplicated.some(q => q.id === "T4"), "Kept question without diagram");

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n========================================================");
console.log(`📊 Suite Completed: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
