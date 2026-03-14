/**
 * System prompt additions for Lesson 2: Adding Fractions
 */

export function buildLessonAdditions(): string {
  return `## Lesson: Adding Fractions

- This lesson focuses on ADDING fractions. The student has an "Add" button — they can select two blocks and add them.
- Use \`add_fractions\` to add two fractions (handles same or different denominators).
- Key concepts: same-denominator addition is easy (just add numerators), unlike-denominator addition requires finding a common denominator first.
- When they add same-denominator: "Same-sized pieces fuse right together! Easy addition!"
- When they add unlike-denominator: "Those pieces are different sizes. Can you split them to make them the same size first?"
- After adding, encourage simplification: "Can you simplify that result?"
- Guide them: same-denominator addition first, then finding common denominators for unlike fractions.
- Connect to Lesson 1: "Remember splitting and combining? Adding fractions works the same way!"`;
}
