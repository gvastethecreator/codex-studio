const QUESTIONS = [
  { id: "name", ask: "What is the project name?" },
  { id: "goal", ask: "What should a visitor do first?" },
  { id: "kind", ask: "Which page shape matches the project?" },
  { id: "evidence", ask: "Which screenshots or commands can be shown?" },
];

/** Ask at most three missing decisions. automatic asks nothing. A known name is not repeated. */
export function nextQuestions({ known = {}, construction = "ai-assisted" } = {}) {
  if (construction === "automatic") return [];
  return QUESTIONS.filter((item) => !known[item.id]).slice(0, 3);
}
