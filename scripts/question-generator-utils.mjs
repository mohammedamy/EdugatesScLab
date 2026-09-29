// Edugates-ClipSAT Science Labs - Question Generator Utilities
// Helper functions for synthesizing non-redundant, pedagogically robust questions

/**
 * Shuffles options while tracking the correct index.
 * Guarantees that correctIndex is evenly and unpredictably distributed.
 */
export function shuffleOptions(options, correctIndex) {
  const items = options.map((opt, i) => ({ opt, isCorrect: i === correctIndex }));
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return {
    options: items.map(it => it.opt),
    correctIndex: items.findIndex(it => it.isCorrect)
  };
}

/**
 * Creates a validated Multiple-Choice Question (MCQ)
 */
export function createMCQ({
  id,
  subject,
  moduleId,
  lessonId,
  moduleTitle,
  lessonTitle,
  difficulty = "honors",
  angle,
  question,
  options,
  correctIndex = 0,
  explanation
}) {
  const shuffled = shuffleOptions(options, correctIndex);
  return {
    id,
    subject,
    moduleId,
    lessonId,
    moduleTitle,
    lessonTitle,
    type: "mcq",
    difficulty,
    angle,
    question,
    options: shuffled.options,
    correctIndex: shuffled.correctIndex,
    explanation,
    rubricCER: null
  };
}

/**
 * Creates a validated Numerical Calculation Question
 */
export function createNumerical({
  id,
  subject,
  moduleId,
  lessonId,
  moduleTitle,
  lessonTitle,
  difficulty = "honors",
  angle,
  question,
  correctAnswer,
  tolerance = 0.5,
  unit = "",
  options,
  correctIndex = 0,
  explanation
}) {
  const shuffled = shuffleOptions(options, correctIndex);
  return {
    id,
    subject,
    moduleId,
    lessonId,
    moduleTitle,
    lessonTitle,
    type: "numerical",
    difficulty,
    angle,
    question,
    correctAnswer: String(correctAnswer),
    tolerance,
    unit,
    options: shuffled.options,
    correctIndex: shuffled.correctIndex,
    explanation,
    rubricCER: null
  };
}

/**
 * Creates a validated Claim, Evidence, Reasoning (CER) Inquiry Question
 */
export function createCER({
  id,
  subject,
  moduleId,
  lessonId,
  moduleTitle,
  lessonTitle,
  difficulty = "ap_olympiad",
  angle,
  question,
  explanation,
  rubricCER
}) {
  return {
    id,
    subject,
    moduleId,
    lessonId,
    moduleTitle,
    lessonTitle,
    type: "cer",
    difficulty,
    angle,
    question,
    options: null,
    correctIndex: null,
    explanation,
    rubricCER: rubricCER || {
      claim: "Accurately articulates the core scientific claim and predicted response (2 pts)",
      evidence: "Cites qualitative or quantitative experimental data from the prompt (3 pts)",
      reasoning: "Links evidence to underlying physical/biological laws and mechanisms (3 pts)",
      scientificLanguage: "Applies precise terminology, units, and clear structure (2 pts)"
    }
  };
}
