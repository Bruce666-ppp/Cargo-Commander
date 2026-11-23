# Cargo Commander — Game Design

## Project overview

Cargo Commander is a browser-based STEM game for beginner learners. A trainee loadmaster prepares safe flights across the fictional Windward Isles, where communities depend on cargo aircraft for supplies, equipment and emergency deliveries. Each delivery gives a reason to decide where the weight goes, check the result and fly the aircraft.

## Learning Outcomes and ABCD Model

**Centre of Gravity and Mass Distribution** is taught through Science — Physics. **Aircraft Stability and Flight Control** is taught through Engineering — Aerospace Engineering.

By the end of the game, beginner STEM learners aged 10–14 will be able to:

| Learning Outcome | Learning type | A · Audience | B · Behaviour | C · Condition | D · Degree |
| --- | --- | --- | --- | --- | --- |
| **LO1 · Identify Aircraft Balance Information.** Using the cargo inventory and aircraft balance indicators, correctly identify the cargo masses, current centre of gravity, and permitted CG range. | Factual Learning | Beginner STEM learners aged 10–14. | Identify cargo masses, current centre of gravity, and permitted CG range. | Using the cargo inventory and aircraft balance indicators. | Correctly identify all three types of information. |
| **LO2 · Understand How Cargo Affects Balance.** By comparing equal-distance movements of heavy and light cargo while keeping the total loaded mass unchanged, correctly explain the direction of CG movement and why heavier cargo produces a greater change. | Conceptual Learning | Beginner STEM learners aged 10–14. | Explain the direction and relative magnitude of centre-of-gravity changes. | Comparing equal-distance movements of heavy and light cargo while keeping the total loaded mass unchanged. | Correctly explain the direction of CG movement and why heavier cargo produces a greater change. |
| **LO3 · Load and Balance an Aircraft.** Using the cargo-loading interface and real-time CG feedback, arrange all required cargo within the specified CG range while satisfying all loading safety requirements. | Procedural Learning | Beginner STEM learners aged 10–14. | Arrange all required cargo. | Using the cargo-loading interface and real-time CG feedback. | Achieve the specified CG range and satisfy all loading safety requirements. |
| **LO4 · Complete a Cargo Delivery Challenge.** Given mission-specific cargo restrictions and flight-test feedback, develop and refine a cargo-loading and flight-control strategy that satisfies all mission requirements and achieves a successful delivery. | Problem-solving Learning | Beginner STEM learners aged 10–14. | Develop and refine a cargo-loading and flight-control strategy. | Given mission-specific cargo restrictions and flight-test feedback. | Satisfy all mission requirements and achieve a successful delivery. |
| **LO5 · Design Your Own Cargo Mission.** Design and validate an original cargo delivery mission using the DIY Mission Studio, producing a valid loading solution that satisfies all selected constraints and achieves a successful test flight. | Creative Application | Beginner STEM learners aged 10–14. | Design and validate an original cargo delivery mission. | Using the DIY Mission Studio and the existing educational cargo-loading and flight-simulation tools. | Produce a valid loading solution that satisfies all selected mission constraints and achieve a successful test flight. |

In the IDAT7220 ABCD framework the Condition describes the tools and circumstances. The Degree describes the standard. The controlled comparison in LO2 fixes distance and total loaded mass so that learners can explain the difference in CG movement. In LO3 and LO4, the existing mission requirements supply the performance standard. Cruise remains a valid mode for all six deliveries.

### Constructive Alignment

| Outcome | STEM topic | Mechanic and learning activity | Where | Feedback | Observable performance | Assessment limits |
| --- | --- | --- | --- | --- | --- | --- |
| LO1 · Factual Learning | Centre of Gravity and Mass Distribution | Locate individual masses on cargo cards, then read the CG marker and permitted range. | Training Centre and the loading screen in all missions | Labels, live marker, target band and checklist. | The three values are displayed for a learner to point out or read aloud. | The game does not record whether learners independently identify the three types of information. |
| LO2 · Conceptual Learning | Centre of Gravity and Mass Distribution | Move the 30 kg and 10 kg crates by one slot each with both crates aboard. Compare direction and magnitude, then try different placements. | Training Centre, missions 01–02, hints and worked solutions | Before-and-after CG readings, arrows and immediate feedback. | The app observes the moves and the resulting CG changes. At fixed total mass, the heavier crate moves the CG three times as far in this example. | Viewing the comparison or repeating the move does not demonstrate an independent explanation or transfer. |
| LO3 · Procedural Learning | Centre of Gravity and Mass Distribution | Select, place, move or unload cargo until all required items satisfy the slot, payload and CG constraints. | All six missions, especially 03–04 and 06 | The checklist reports individual checks and readiness. | The official departure gate verifies the cargo list, allowed slots, payload and inclusive CG range. | A valid load demonstrates task performance. The record does not distinguish independent planning from a worked solution. |
| LO4 · Problem-solving Learning | Both STEM topics | Test a load and controls, examine the flight report, adjust the setup or control inputs and retry the route. | Practice Flight, Flight Review and official deliveries, especially 05–06 | Altitude trace, corridor time, modes, duration and instructor guidance. | The game verifies official completion. Comparisons can show changed CG or performance, and an observer can notice revisions when the learner retries. | A successful delivery alone does not establish how the strategy was developed, why it changed or which variable caused a performance difference. |
| LO5 · Creative Application | Both STEM topics | Design a mission, choose its constraints, build a reference solution, review the scientific explanation, test and save. | DIY Mission Studio | Configuration feasibility, live balance, safety checks, worked steps and flight review tell learners what they can refine. | The saved design contains selected constraints and the learner's reference arrangement after successful loading and flight tests. | The automated explanation does not show that the learner can explain the science independently. Comparing peer solutions and asking the designer to justify a choice can provide further evidence. |

## Educational Frameworks

### ADDIE

| Stage | How it relates to this project |
| --- | --- |
| Analysis | The assignment, novice audience, abstract balance concept and browser delivery shaped the scope. The age group and expected beginner challenges are design assumptions. |
| Design | The six routes layer loading constraints and simulated flight demands. Training, hints and worked solutions support players who need more guidance. |
| Development | Iteration connected the cargo interface, mass-weighted CG, simulator and feedback. Automated tests and worked-solution checks provide internal verification of content and logic. |
| Implementation | GitHub Pages provides access without installation. Mission briefs, the new-player choice, and keyboard and on-screen controls explain how to begin. |
| Evaluation | Automated tests, browser playthroughs, responsive checks and classmate feedback informed revisions. These provide technical, usability and formative evidence. |

This is a retrospective mapping of the project to ADDIE. Learner needs studies, classroom implementation, independent subject matter expert validation and direct measurements of learning gains remain unverified.

### Bloom's Taxonomy and four types of learning knowledge

Factual information gives players something concrete to read. Conceptual knowledge helps them predict how balance will change. Procedural knowledge connects the checks to a sequence of actions. Problem-solving knowledge combines those capabilities when an unfamiliar mission adds constraints or a flight exposes a weakness. Bloom's levels describe cognitive activities available across those four types.

| Level | Opportunity during play |
| --- | --- |
| Remember | Recognise a cargo mass, find the CG marker and recall a loading rule. |
| Understand | Use the heavy and light crate comparison to explain a change in balance. |
| Apply | Arrange the manifest and satisfy the loading checklist. |
| Analyse | Compare before-and-after readings and examine where a flight left its altitude corridor. |
| Evaluate | Weigh alternative legal configurations against the mission constraints and compare flight attempts under similar modes and inputs. |
| Create | Design, validate and test an original mission with selected constraints. Save the design and optionally share it for peer review. |

Players can also follow a given solution. These activities provide opportunities for higher-order thinking. The game records neither a learner's justification of a particular decision nor whether the strategy was independently created.

LO5 extends procedural and problem-solving knowledge into creative application. The four knowledge categories remain factual, conceptual, procedural and problem-solving. The saved mission provides direct evidence of a completed creative task. Individual reasoning and transfer still require observation or assessment.

### 5E and Scenario-Based Learning

| Stage | Example from the Windward Isles |
| --- | --- |
| Engage | Pinehaven's supply brief gives the trainee loadmaster an immediate reason to prepare the aircraft. |
| Explore | Move crates, watch the CG indicator and test different loads in Practice Flight. |
| Explain | Compare the two crate movements and use the instructor's explanation or worked example to interpret the readings. |
| Elaborate | Apply the same balance principles around closed slots, powered cargo positions and stronger simulated gusts. |
| Evaluate | Check aircraft readiness, review the altitude trace and corridor time, then adjust and retry. |

Players can cycle among these activities during a mission. The game supplies explanations and evaluates task performance. Teacher observation can provide evidence about a learner's own explanation.

Scenario-based learning connects the scientific relationship to practical decisions within each fictional mission. Mercy Cay's clinic supplies require a powered position, which limits where players can place the medical case and changes the balance problem. In the final mission an optional battery, a restricted hold and gusts create competing demands within one delivery.

### Critical thinking, hands-on learning and project-based learning elements

Players handle cargo, receive immediate feedback, compare alternatives and revise decisions before trying another flight. Reflecting on why a strategy worked is an opportunity, particularly when a flight fails and the instructor suggests a specific change. The island network gives these experiments a sustained goal and a visible outcome across missions. This supports project-oriented elements such as iterative problem-solving and autonomy in choosing an arrangement. Independent research, learner-defined project plans and presentation of a project artefact are outside the campaign design.

## Optional Teacher Facilitation and Assessment

### LO1 · Factual Learning

> Can you point out the cargo weight, the aircraft's current centre of gravity, and its safe balance range?

During Cargo Loading, ask the learner to point to one named crate's mass on its card, read the CG currently displayed on the gauge, and identify both endpoints of that mission's target range. They should distinguish the current reading from the permitted interval and identify all three types of information accurately.

### LO2 · Conceptual Learning

> If you move a heavy crate and a light crate by the same distance while keeping the total loaded mass unchanged, which one will move the aircraft's balance point more? Why?

Ask for a prediction before the Training Centre moves, then ask for an explanation using the two readings. With the same distance and total loaded mass, the heavier crate shifts the CG farther because its move changes the aircraft's total moment more. The CG shifts in the direction of the moved crate. A learner can explain this in everyday language using the live indicator.

When used in a learning activity, these prompts give a teacher a way to observe individual understanding. They are optional discussion prompts and have yet to be administered to learners.

### LO5 · Creative Application

Ask the designer to show the saved mission, explain why they added one constraint and trace how the chosen reference arrangement satisfies it. Offer a peer an opportunity to try a different feasible arrangement. The mission data and flight result show task performance. The discussion can reveal reasoning that the automatic explanation cannot assess.

## DIY Mission Studio and peer challenges

After Mission 03, learners can apply the same balance principles to a problem they design. They choose cargo types and masses, blocked positions, a target CG range and one of three simulated wind conditions. The studio uses Mission 01's empty aircraft, six positions and 60 kg payload limit. Targets stay within 4.40–4.60 m, the envelope for this educational exercise. A medical case reuses the existing requirement to occupy powered slot 3 or 4.

**Create** verifies the configuration and uses the existing bounded loading search. At most six required crates are placed one per permitted slot. This check establishes that there is some valid load. **Solve** requires the designer to place the crates in Cargo Loading and submit their own valid arrangement. **Explain** builds a diagram, placement steps and optional moment calculation using that exact reference load, including the empty aircraft mass and original CG. The placement order is a worked example. **Test & Save** requires a successful manual flight with that same load. A change to cargo, slots, CG or wind requires a fresh reference and flight.

Mission Architect recognises a complete saved design with a blocked slot, narrower CG target or powered cargo constraint. The original six certifications and career progression remain tied to official deliveries. Reset Progress clears the official career record while retaining the creative archive, its badge and sound settings. Formal creation unlocks again after the third official delivery.

The share link stores only the small, versioned mission definition, reference slots and optional note. A receiver can replay the challenge with a different arrangement, request hints or open the creator's worked example. The receiver checks the schema and recalculates what can be reproduced locally. A portable link does not authenticate the author or certify that a flight was flown. My Missions stores designs on the current browser, and shared links provide an opportunity to compare designs with peers.

The Training Centre supports self-paced replay of the whole beginner sequence and separate loading, CG, inspection, flight, career and DIY modules. The temporary DIY exercise integrates a changed cargo mass, a blocked slot, a manual reference load and a short actual test flight. Training stays separate from the official career and the saved creative archive.

## Learning strategies

- **Guided practice.** The spotlight highlights the relevant control, guides actual cargo and flight actions and advances after the required action. Learners can skip, exit or revisit training.
- **Independent exploration.** Required crates and slot rules create a clear task. Live feedback, Undo and Reset let players investigate the effect of changing a decision.
- **Scaffolding.** Instructor notes introduce a new constraint before it matters. Players can request a hint, and timed hints move from a conceptual cue to a cargo-specific legal move. Worked solutions show a sequence and explain the change in balance.
- **Reflection and retry.** Flight measurement, instructor feedback and guided flight demonstrations connect the loading decision to the next test. A player can conduct a Practice Flight with a CG outside the delivery limits after satisfying cargo, payload and position checks.
- **Feedback through multiple senses.** Indicators, labels and traces carry the learning information. Cargo sounds, flight ambience, alerts and reward cues reflect important state changes. Controls for background music, effects, engine ambience, master volume and mute let players adjust the audio.

## Goal, rules, rewards and challenges

The **goal** is to deliver the correct cargo safely and establish a functioning transport network. The **rules** require the manifest, payload, permitted positions and CG to pass inspection. A delivery flight must reach the destination with sufficient time in the altitude corridor and a controlled arrival. The **rewards** show how the delivery changed the world and the player's career. The **challenges** increase through uneven masses, slot restrictions, tighter loading decisions and stronger simulated gusts.

The studio adds an optional goal of designing and validating an original mission. The designer chooses constraints within the loading rules, earns Mission Architect for a complete eligible design and can challenge peers to solve it.

## MDA framework

| Layer | How it appears in play |
| --- | --- |
| Mechanics | Cargo placement, weighted CG, payload and slot limits, pitch controls, flight modes, delivery milestones, mission configuration, submitted reference solutions, validation and share links. |
| Dynamics | Experiment with mass and distance, plan around restrictions, compare flights, revise an original design and challenge a peer to find another solution. |
| Aesthetics | Challenge from constraints and flight, discovery through cloud clearance, achievement through the campaign and ownership of a mission you built. |

## Six-mission campaign

| Mission | Narrative and learning opportunity |
| --- | --- |
| 01 · Island Supply Run | Pinehaven needs basic supplies. Three crate masses introduce balance and the safety checklist. |
| 02 · Coastal Resupply | Sundrift needs a replacement turbine. The 50 kg crate makes a large shift when it moves. |
| 03 · Inter-Island Relay | Maintenance closes two slots at Sundrift. Plan the relay load with the remaining positions. |
| 04 · Emergency Medical Delivery | Mercy Cay's clinic needs a delivery. Its medical case must use a powered position. |
| 05 · Flight Through the Gusts | Deliver instruments and shelter to Stormwatch. Anticipate stronger simulated gusts and wait for the response to each pitch input. |
| 06 · Operation Windward | Connect Northstar to the network. Combine special cargo, two closed slots, a tight payload and stronger gusts. Evaluate the optional battery against the manifest and payload. |

## ABE reward system

**A · Aviation career progression** advances the player from Trainee Loadmaster to Cargo Commander. **B · Aviation route network expansion** establishes routes and reveals new destinations through cloud clearing. **E · STEM skill certifications** associates one badge with each mission's demonstrated in-game competency. The Achievement Wall brings all three together. Replays can improve a saved flight without duplicating rewards. Practice, training and demonstrations support experimentation, while an official successful delivery earns the career rewards. Seeking help does not reduce reward eligibility.

## Learning support design

The first-run choice offers either beginner training or entry to the Mission Centre. Training shows one action at a time, including loading, comparing mass effects and practising pitch and flight-mode controls. It then introduces campaign progression and a short DIY exercise. The tutorial can pause the simulated flight while the learner reads, and the Training Centre offers each topic independently.

Automatic help uses active time in the loading screen. The first reminder arrives after 45–75 seconds across the six missions, with a bounded delay for productive moves. Subsequent cues offer a strategy, a specific legal move and an optional solution invitation. The worked solution explains each placement, shows the balance point before and after and lets the player return to the original hold or start with an empty one. Its optional calculation table introduces the formula without interrupting the cargo task. After a flight, the instructor connects recorded events to a next action and can demonstrate flying the route.

## Scientific model and limitations

The longitudinal CG is a mass-weighted mean, `(empty aircraft mass × empty CG + Σ(crate mass × slot position)) ÷ total loaded mass`. All positions share the same nose datum. The gauge uses the aircraft's illustrated reference coordinates. Safety comparisons use the unrounded CG, with both target endpoints inclusive. Display precision increases where a two-decimal reading would obscure a safety boundary.

The simulated aircraft uses a simplified pitch and altitude response. A forward CG reduces response to nose-up input in the model. An aft CG weakens the restoring response and damping. Baseline stability, the player's inputs and simulated wind together determine flight behaviour. Cruise, Express and Rush vary pace and simulated disturbance for gameplay. Flight reports show modes and elapsed durations to support fairer comparisons.

Cargo Commander uses simplified educational models to demonstrate centre of gravity and aircraft stability. It is not intended for real-world aircraft loading, engineering certification or aviation flight training.

## Accessibility and interaction

Cargo can be dragged or selected and placed with buttons, including tap-based play. Flight has keyboard and on-screen controls. Named controls, visible focus, textual balance and flight status, reduced-motion styling, adjustable audio and optional maths support different ways to interact. The narrow-screen header, larger slot height and responsive tutorial highlight were checked in browser emulation. See the [test report](TEST_REPORT.md) for verified environments and limits.
