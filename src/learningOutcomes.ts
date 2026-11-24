export const learningAudience = 'Beginner STEM learners aged 10–14.'
export const learningOutcomeIntro = 'By the end of the game, beginner STEM learners aged 10–14 will be able to'

export const learningOutcomes = [
  { id: 'LO1', category: 'Factual Knowledge', title: 'Identify Aircraft Balance Information',
    behaviour: 'Identify cargo masses, the current centre of gravity and the permitted CG range.',
    condition: 'Using the cargo inventory and balance indicators.',
    degree: 'All three types of information correctly identified.' },
  { id: 'LO2', category: 'Conceptual Knowledge', title: 'Explain Cargo Effects on Balance',
    behaviour: 'Explain the effect of cargo movement on the centre of gravity.',
    condition: 'Through equal-distance comparisons at constant total loaded mass.',
    degree: 'Correct reasoning about the direction of movement and the greater effect of heavier cargo.' },
  { id: 'LO3', category: 'Procedural Knowledge', title: 'Arrange Cargo Safely',
    behaviour: 'Arrange all required cargo.',
    condition: 'Using the loading interface and real-time CG feedback.',
    degree: 'All applicable loading safety requirements satisfied.' },
  { id: 'LO4', category: 'Problem-Solving Knowledge', title: 'Select an Effective Delivery Strategy',
    behaviour: 'Select an appropriate cargo-loading and flight strategy.',
    condition: 'Given mission-specific constraints and flight feedback.',
    degree: 'All mission requirements satisfied and a successful delivery.' },
  { id: 'LO5', category: 'Creative Application', title: 'Design Your Own Cargo Mission',
    behaviour: 'Design an original cargo delivery mission.',
    condition: 'Using DIY Mission Studio.',
    degree: 'A valid reference solution, satisfaction of all selected constraints and a successful test flight.' },
].map((outcome) => {
  const lowerClause = (clause: string) => clause[0].toLowerCase() + clause.slice(1, -1)
  const parts = [
    { kind: 'A', name: 'Audience', text: learningOutcomeIntro },
    { kind: 'B', name: 'Behaviour', text: lowerClause(outcome.behaviour) },
    { kind: 'C', name: 'Condition', text: lowerClause(outcome.condition) + ',' },
    { kind: 'D', name: 'Degree', text: 'with ' + lowerClause(outcome.degree) + '.' },
  ] as const
  return { ...outcome, parts, statement: parts.map(part => part.text).join(' ') }
})
