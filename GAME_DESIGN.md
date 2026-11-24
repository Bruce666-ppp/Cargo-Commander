# Cargo Commander — Game Design

## Project overview

Cargo Commander is a browser-based STEM game for beginner learners. A trainee loadmaster prepares safe flights across the fictional Windward Isles, where communities depend on cargo aircraft for supplies, equipment and emergency deliveries. Each delivery gives a reason to decide where the weight goes, check the result and fly the aircraft.

## Learning Outcomes and ABCD Model

The visible ABCD labels and sentences follow the instructor’s IDAT7220 ABCD Model teaching material. Audience identifies the learner, Behaviour states one principal observable action, Condition describes the circumstances or tools and Degree specifies acceptable performance. Home and About Game share the same content definition.

| Learning Outcome | Learning category | A · Audience | B · Behaviour | C · Condition | D · Degree |
| --- | --- | --- | --- | --- | --- |
| **LO1 · Identify Aircraft Balance Information.** By the end of the game, beginner STEM learners aged 10–14 will be able to identify cargo masses, the current centre of gravity and the permitted CG range using the cargo inventory and balance indicators, with all three types of information correctly identified. | Factual Knowledge | Beginner STEM learners aged 10–14. | Identify cargo masses, the current centre of gravity and the permitted CG range. | Using the cargo inventory and balance indicators. | All three types of information correctly identified. |
| **LO2 · Explain Cargo Effects on Balance.** By the end of the game, beginner STEM learners aged 10–14 will be able to explain the effect of cargo movement on the centre of gravity through equal-distance comparisons at constant total loaded mass, with correct reasoning about the direction of movement and the greater effect of heavier cargo. | Conceptual Knowledge | Beginner STEM learners aged 10–14. | Explain the effect of cargo movement on the centre of gravity. | Through equal-distance comparisons at constant total loaded mass. | Correct reasoning about the direction of movement and the greater effect of heavier cargo. |
| **LO3 · Arrange Cargo Safely.** By the end of the game, beginner STEM learners aged 10–14 will be able to arrange all required cargo using the loading interface and real-time CG feedback, with all applicable loading safety requirements satisfied. | Procedural Knowledge | Beginner STEM learners aged 10–14. | Arrange all required cargo. | Using the loading interface and real-time CG feedback. | All applicable loading safety requirements satisfied. |
| **LO4 · Select an Effective Delivery Strategy.** By the end of the game, beginner STEM learners aged 10–14 will be able to select an appropriate cargo-loading and flight strategy given mission-specific constraints and flight feedback, with all mission requirements satisfied and a successful delivery. | Problem-Solving Knowledge | Beginner STEM learners aged 10–14. | Select an appropriate cargo-loading and flight strategy. | Given mission-specific constraints and flight feedback. | All mission requirements satisfied and a successful delivery. |
| **LO5 · Design Your Own Cargo Mission.** By the end of the game, beginner STEM learners aged 10–14 will be able to design an original cargo delivery mission using DIY Mission Studio, with a valid reference solution, satisfaction of all selected constraints and a successful test flight. | Creative Application | Beginner STEM learners aged 10–14. | Design an original cargo delivery mission. | Using DIY Mission Studio. | A valid reference solution, satisfaction of all selected constraints and a successful test flight. |

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
| Evaluation | Five points of formative peer feedback led to a shorter first run, visible ABCD outcomes, one observable action in each outcome, tangible island rewards and a simulator-led delivery option. Automated tests and browser playthroughs verify the implementation. |

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
| Explore | Move crates, watch the CG indicator and run two equal-distance trials from the same baseline. |
| Explain | Interpret the mass trials or explain the operational reason for the powered medical slot using the engineering requirement. |
| Elaborate | Find a second feasible layout, interpret a controlled gust comparison and transfer the design rules to a new DIY mission. |
| Evaluate | Check aircraft readiness, put the actual load through flight verification and use the report to inform a retry. |

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

From the first visit to Mission Centre, learners can apply the balance principles to a problem they design. They start with two crates and can edit types, masses and blocked slots. Advanced Details contains the narrower CG targets and three simulated wind options. The studio uses Mission 01's empty aircraft, six positions and 60 kg payload limit. Targets stay within 4.40–4.60 m, the envelope for this educational exercise. A medical case reuses the requirement to occupy powered slot 3 or 4.

**Create** verifies the configuration and uses the existing bounded loading search. At most six required crates are placed one per permitted slot. **Solve** requires a valid arrangement entered by the designer in Cargo Loading. **Explain** builds a diagram, placement steps and optional moment calculation using that reference load and the empty aircraft's mass and CG. **Test & Save** requires a successful flight with the reference load through Auto Delivery or Manual Delivery. A change to cargo, slots, CG or wind requires a fresh reference and flight.

Mission Architect and the one-time $2,000 creative reward recognise a saved design with a blocked slot, narrower CG target or powered cargo constraint. Reset Progress clears official campaign records, earnings and development. The creative archive, award, badge and sound settings remain available.

The share link stores only the small, versioned mission definition, reference slots and optional note. A receiver can replay the challenge with a different arrangement, request hints or open the creator's worked example. The receiver checks the schema and recalculates what can be reproduced locally. A portable link does not authenticate the author or certify that a flight was flown. My Missions stores designs on the current browser, and shared links provide an opportunity to compare designs with peers.

The Training Centre includes Quick Beginner Training, Complete Training and separate loading, CG, inspection, flight, career and DIY modules. Training uses an independent exercise state and sample rewards.

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
| Mechanics | Cargo placement, weighted CG, payload and slot checks, measured STEM comparisons, assisted or manual simulator control, persistent rewards and development, and validated mission sharing. |
| Dynamics | Predict and test, revise unsafe loads, evaluate alternatives, observe an engineering consequence and challenge a peer to find a different solution. |
| Aesthetics | Discovery through the archipelago, challenge through its constraints, accomplishment through a growing network, and ownership through an original mission. |

## Six-mission campaign

| Mission | Narrative and learning opportunity |
| --- | --- |
| 01 · Island Supply Run | Pinehaven needs basic supplies. Three crate masses introduce balance and the safety checklist. |
| 02 · Coastal Resupply | Sundrift needs a replacement turbine. The 50 kg crate makes a large shift when it moves. |
| 03 · Inter-Island Relay | Two cargo slots are closed after inspection at Pinehaven. Find a safe layout for communications equipment bound for Coral Point. |
| 04 · Emergency Medical Delivery | Mercy Cay's clinic needs a delivery. Its medical case must use a powered position. |
| 05 · Flight Through the Gusts | Deliver instruments and shelter to Stormwatch. Anticipate stronger simulated gusts and wait for the response to each pitch input. |
| 06 · Operation Windward | Connect Northstar to the network. Combine special cargo, two closed slots, a tight payload and stronger gusts. Evaluate the optional battery against the manifest and payload. |

## ABE reward system

**A · Aviation career progression** advances the player from Trainee Loadmaster to Cargo Commander. **B · Aviation route network expansion** establishes routes and reveals new destinations through cloud clearing. **E · STEM skill certifications** associates one badge with each mission's demonstrated in-game competency. The Achievement Wall brings all three together. Replays can improve a saved flight without duplicating rewards. Practice, training and demonstrations support experimentation, while an official successful delivery earns the career rewards. Seeking help does not reduce reward eligibility.

### Delivery income, STEM bonuses and development

| Mission | Route | Income | Bonus | District developed after the first delivery |
| --- | --- | ---: | ---: | --- |
| 01 | Harbor Base → Pinehaven | $400 | $100 | Essential Supply District · 11 buildings |
| 02 | Harbor Base → Sundrift | $600 | $200 | Logistics District · 13 buildings |
| 03 | Pinehaven → Coral Point | $900 | $300 | Aviation Relay District · 15 buildings |
| 04 | Sundrift → Mercy Cay | $1,500 | $500 | Medical Campus · 18 buildings |
| 05 | Mercy Cay → Stormwatch | $2,200 | $800 | Emergency and Weather Operations District · 20 buildings |
| 06 | Stormwatch → Northstar | $3,400 | $1,100 | Regional Development District · 24 buildings |

Income totals $9,000 and optional STEM bonuses total $3,000. A record of each successful delivery supports migration of base income and its district. STEM bonuses depend on separately observed in-game activities and may be earned later. The valid Mission Architect achievement supports the independent $2,000 creative reward. Earnings are derived from these records, which prevents a replay from paying them again. The milestone thresholds are $500, $2,000, $4,500, $7,500, $12,000 and $14,000.

Harbor Base begins with seven modest buildings and an operational runway. A new destination becomes visible when its mission is unlocked. It gains a green route and a district after first delivery. The six routes form a connected, branching network, with each one adding a new island. The map reflows into two columns on narrow screens. Completed mission IDs restore the new geography for existing saves, including Coral Point for a completed Mission 03.

The 4.55-second reward sequence presents the destination before development, then a site survey, foundations, three building waves, roads and vehicles, and a district opening. The same original SVG terrain and buildings appear on the campaign map. Building parcels sit above the runway and aircraft apron. In reduced-motion mode the completed state appears immediately. Rewards and progress are recorded before either presentation begins.

The primary success cue is a locally bundled recording with real audience cheers, claps and shouts. The opening burst precedes the construction impacts. A second burst plays when the district opens, followed by lighter coin and certification accents. The final mission uses longer bursts and a musical accent. The crowd is a filtered 4.9-second, 96 kb/s MP3 excerpt of Shane Vincent's GameSoundCon 2024 Walla recording, shared by ShangusBurger under CC0. [Original recording and licence](https://freesound.org/people/ShangusBurger/sounds/763932/)

## Learning support design

The first-run choice offers Quick Beginner Training or direct entry to the Mission Centre. The short training asks the learner to place one crate, move it until balanced and verify the load in the simulator. A temporary reward demonstration completes the loop. Complete Training preserves the earlier stages including pitch control, career progression and DIY. The Training Centre offers each topic independently.

Automatic help uses active time in the loading screen. The first reminder arrives after 45–75 seconds across the six missions, with a bounded delay for productive moves. Subsequent cues offer a strategy, a specific legal move and an optional solution invitation. The worked solution explains each placement, shows the balance point before and after and lets the player return to the original hold or start with an empty one. Its optional calculation table introduces the formula without interrupting the cargo task. After a flight, the instructor connects recorded events to a next action and can demonstrate flying the route.

## Scientific model and limitations

The longitudinal CG is a mass-weighted mean, `(empty aircraft mass × empty CG + Σ(crate mass × slot position)) ÷ total loaded mass`. All positions share the same nose datum. The gauge uses the aircraft's illustrated reference coordinates. Safety comparisons use the unrounded CG, with both target endpoints inclusive. Display precision increases where a two-decimal reading would obscure a safety boundary.

The simulated aircraft uses a simplified pitch and altitude response. A forward CG reduces response to nose-up input in the model. An aft CG weakens the restoring response and damping. Baseline stability, the player's inputs and simulated wind together determine flight behaviour. Cruise, Express and Rush vary pace and simulated disturbance for gameplay. Flight reports show modes and elapsed durations to support fairer comparisons.

Auto Delivery uses the submitted configuration, original simulator and delivery criteria with assisted pitch control. A successful result enters the completion screen automatically. Manual Delivery uses the same loading and delivery checks, with the player's pitch inputs and selected speed. Both advance the same record and rewards. In the controlled Mission 05 activity the two runs both use Cruise, the same gust profile and the same timed pitch input for 32 simulated seconds. The two valid CG values produce 87.7% and 61.1% corridor occupancy in that particular experiment. Freely chosen attempts can vary in loading, mode, controls and duration, which limits causal comparisons.

Cargo Commander uses simplified educational models to demonstrate centre of gravity and aircraft stability. It is not intended for real-world aircraft loading, engineering certification or aviation flight training.

## Accessibility and interaction

Cargo can be dragged or selected and placed with buttons, including tap-based play. Flight has keyboard and on-screen controls. Named controls, visible focus, textual balance and flight status, reduced-motion styling, adjustable audio and optional maths support different ways to interact. The narrow-screen header, larger slot height and responsive tutorial highlight were checked in browser emulation. See the [test report](TEST_REPORT.md) for verified environments and limits.
