export const learningAudience = 'Beginner STEM learners aged 10–14.'
export const learningOutcomeIntro = 'By the end of the game, beginner STEM learners aged 10–14 will be able to:'

export const learningOutcomes = [
  {
    id: 'LO1',
    category: 'Factual Learning',
    title: 'Identify Aircraft Balance Information',
    summary: 'Identify aircraft balance information.',
    statement: 'Using the cargo inventory and aircraft balance indicators, correctly identify the cargo masses, current centre of gravity, and permitted CG range.',
    behaviour: 'Identify cargo masses, current centre of gravity, and permitted CG range.',
    condition: 'Using the cargo inventory and aircraft balance indicators.',
    degree: 'Correctly identify all three types of information.',
  },
  {
    id: 'LO2',
    category: 'Conceptual Learning',
    title: 'Understand How Cargo Affects Balance',
    summary: 'Understand how cargo affects balance.',
    statement: 'By comparing equal-distance movements of heavy and light cargo while keeping the total loaded mass unchanged, correctly explain the direction of CG movement and why heavier cargo produces a greater change.',
    behaviour: 'Explain the direction and relative magnitude of centre-of-gravity changes.',
    condition: 'Comparing equal-distance movements of heavy and light cargo while keeping the total loaded mass unchanged.',
    degree: 'Correctly explain the direction of CG movement and why heavier cargo produces a greater change.',
  },
  {
    id: 'LO3',
    category: 'Procedural Learning',
    title: 'Load and Balance an Aircraft',
    summary: 'Load and balance an aircraft.',
    statement: 'Using the cargo-loading interface and real-time CG feedback, arrange all required cargo within the specified CG range while satisfying all loading safety requirements.',
    behaviour: 'Arrange all required cargo.',
    condition: 'Using the cargo-loading interface and real-time CG feedback.',
    degree: 'Achieve the specified CG range and satisfy all loading safety requirements.',
  },
  {
    id: 'LO4',
    category: 'Problem-solving Learning',
    title: 'Complete a Cargo Delivery Challenge',
    summary: 'Solve cargo delivery challenges.',
    statement: 'Given mission-specific cargo restrictions and flight-test feedback, develop and refine a cargo-loading and flight-control strategy that satisfies all mission requirements and achieves a successful delivery.',
    behaviour: 'Develop and refine a cargo-loading and flight-control strategy.',
    condition: 'Given mission-specific cargo restrictions and flight-test feedback.',
    degree: 'Satisfy all mission requirements and achieve a successful delivery.',
  },
] as const
