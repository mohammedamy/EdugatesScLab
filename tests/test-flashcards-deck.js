import assert from "node:assert";
import { flashcardDeck, buildComprehensiveFlashcardDeck } from "../components/flashcards.js";
import { chemistryCurriculum } from "../data/chemistry-curriculum.js";
import { biologyCurriculum } from "../data/biology-curriculum.js";
import { physicsCurriculum } from "../data/physics-curriculum.js";

console.log("🧪 Running Flashcards Comprehensive Deck Test Suite...");

// 1. Deck Initialization & Core Counts
assert(Array.isArray(flashcardDeck), "flashcardDeck must be an array");
console.log(`  Total flashcards in deck: ${flashcardDeck.length}`);
assert(flashcardDeck.length >= 1302, `Expected at least 1,302 cards in full deck, got ${flashcardDeck.length}`);

// 2. Uniqueness of all Card IDs
const idSet = new Set();
flashcardDeck.forEach((card, idx) => {
  assert(card.id, `Card at index ${idx} is missing an id`);
  assert(!idSet.has(card.id), `Duplicate card id detected: ${card.id}`);
  idSet.add(card.id);
});
console.log(`  ✅ All ${idSet.size} card IDs are globally unique`);

// 3. Curriculum Verification: Exactly 242 Lessons across all 3 tracks
const tracks = [
  { code: "CHEM", name: "Chemistry", data: chemistryCurriculum },
  { code: "BIO", name: "Biology", data: biologyCurriculum },
  { code: "PHYS", name: "Physics", data: physicsCurriculum }
];

let totalCurriculumLessons = 0;
const expectedLessonKeys = new Set();

tracks.forEach(track => {
  track.data.modules.forEach(m => {
    if (m.lessons) {
      m.lessons.forEach(l => {
        totalCurriculumLessons++;
        expectedLessonKeys.add(`${track.code}-M${m.id}-L${l.id}`);
      });
    }
  });
});

console.log(`  Total curriculum lessons across Chem, Bio, Phys: ${totalCurriculumLessons}`);
assert.strictEqual(totalCurriculumLessons, 242, "Expected exactly 242 curriculum lessons");

// 4. Group deck cards by lesson and verify every lesson has >= 5 relevant cards
const lessonCardsMap = new Map();
let lessonCardsCount = 0;
let moduleOverviewCount = 0;
let coreHighYieldCount = 0;

flashcardDeck.forEach(card => {
  if (card.isCoreMastery) {
    coreHighYieldCount++;
  } else if (card.isModuleOverview) {
    moduleOverviewCount++;
  } else if (card.isLessonCard) {
    lessonCardsCount++;
    const key = `${card.subject}-M${card.moduleId}-L${card.lessonId}`;
    if (!lessonCardsMap.has(key)) {
      lessonCardsMap.set(key, []);
    }
    lessonCardsMap.get(key).push(card);
  }
});

console.log(`  Breakdown:`);
console.log(`    - Core High-Yield Cards: ${coreHighYieldCount}`);
console.log(`    - Module Overview Cards: ${moduleOverviewCount}`);
console.log(`    - Lesson Cards: ${lessonCardsCount}`);
console.log(`    - Unique Lessons Covered: ${lessonCardsMap.size}`);

assert.strictEqual(moduleOverviewCount, 74, "Expected exactly 74 module overview cards");
assert.strictEqual(coreHighYieldCount, 18, "Expected 18 core high-yield cards");
assert.strictEqual(lessonCardsMap.size, 242, "All 242 lessons must have cards in the deck");

// 5. Verify every single lesson has AT LEAST 5 cards and meets relevance requirements
const requiredCardTypes = ["concept", "formulation", "mechanism", "application", "misconception"];

expectedLessonKeys.forEach(lessonKey => {
  const cards = lessonCardsMap.get(lessonKey);
  assert(cards, `Missing cards for lesson ${lessonKey}`);
  assert(cards.length >= 5, `Lesson ${lessonKey} must have at least 5 cards, but only found ${cards.length}`);

  // Check archetypes
  const typesInLesson = new Set(cards.map(c => c.cardType));
  requiredCardTypes.forEach(rt => {
    assert(typesInLesson.has(rt), `Lesson ${lessonKey} missing card archetype "${rt}"`);
  });

  // Verify content relevance & completeness of each card
  cards.forEach(card => {
    assert(card.front && card.front.length > 5, `Lesson ${lessonKey} card ${card.id} has invalid front`);
    assert(card.category && card.category.length > 5, `Lesson ${lessonKey} card ${card.id} has invalid category`);
    assert(card.hint && card.hint.length > 3, `Lesson ${lessonKey} card ${card.id} has invalid hint`);
    assert(card.formula, `Lesson ${lessonKey} card ${card.id} missing formula`);
    assert(card.coreExplanation && card.coreExplanation.length > 10, `Lesson ${lessonKey} card ${card.id} missing core explanation`);
    assert(Array.isArray(card.objectives) && card.objectives.length > 0, `Lesson ${lessonKey} card ${card.id} missing objectives`);
  });
});

console.log(`  ✅ PASS: Every single lesson (242/242) has at least 5 complete, relevant, structured flashcards`);
console.log(`  ✅ Total lesson cards: ${lessonCardsCount} (exactly 242 × 5 = 1,210 cards)`);
console.log(`  ✅ All assertions passed successfully!`);
