# Cargo Commander — Game Design

## Project overview

Cargo Commander is a browser-based STEM game for beginner learners. A trainee loadmaster prepares safe flights across the fictional Windward Isles, where communities depend on cargo aircraft for supplies, equipment and emergency deliveries. Each delivery gives a reason to decide where the weight goes, check the result and fly the aircraft.

## STEM curriculum and learning objectives

**Centre of Gravity and Mass Distribution** is taught through Science — Physics. **Aircraft Stability and Flight Control** is taught through Engineering — Aerospace Engineering.

| Approved objective | Mechanic and learning activity | Where | Feedback and observable evidence |
| --- | --- | --- | --- |
| Explain how cargo mass and position influence an aircraft's centre of gravity. | Move a heavy and a light crate by the same distance with the same total loaded mass. Inspect the CG shift. | Training Centre, missions 01–02 | The marker and before-and-after readings respond to the move. The two observed shifts provide evidence a learner can use in an explanation. |
| Arrange cargo to achieve a specified centre-of-gravity range. | Plan a manifest across six positions while checking payload and slot restrictions. | All six missions, especially 03–04 and 06 | The checklist and CG gauge show whether the player produced a valid load. Official departure requires all loading checks. |
| Analyse how different centre-of-gravity configurations affect aircraft stability and controllability. | Fly front- and rear-biased loads in Practice and compare similar inputs in the same mode. | Practice Flight and Flight Review | The altitude trace, corridor time, flight mode and duration let players compare observations. Interpretation also depends on their pitch inputs. |
| Apply flight-test feedback to solve cargo-loading problems under given constraints. | Review an attempted flight, revise the manifest and retry the route. | All missions, with combined constraints in 06 | Specific advice, updated loading checks and the next flight give learners evidence about the effect of a revision. |

The observed actions and recorded results show how players applied the mechanics. Verifying each learner's explanation or long-term understanding would require separate assessment.

## Learning strategies

- **Guided practice.** The spotlight highlights the relevant control, guides actual cargo and flight actions and advances after the required action. Learners can skip, exit or revisit training.
- **Independent exploration.** Required crates and slot rules create a clear task. Live feedback, Undo and Reset let players investigate the effect of changing a decision.
- **Scaffolding.** Instructor notes introduce a new constraint before it matters. Players can request a hint, and timed hints move from a conceptual cue to a cargo-specific legal move. Worked solutions show a sequence and explain the change in balance.
- **Reflection and retry.** Flight measurement, instructor feedback and guided flight demonstrations connect the loading decision to the next test. A player can conduct a Practice Flight with a CG outside the delivery limits after satisfying cargo, payload and position checks.
- **Feedback through multiple senses.** Indicators, labels and traces carry the learning information. Cargo sounds, flight ambience, alerts and reward cues reflect important state changes. Controls for background music, effects, engine ambience, master volume and mute let players adjust the audio.

## Goal, rules, rewards and challenges

The **goal** is to deliver the correct cargo safely and establish a functioning transport network. The **rules** require the manifest, payload, permitted positions and CG to pass inspection. A delivery flight must reach the destination with sufficient time in the altitude corridor and a controlled arrival. The **rewards** show how the delivery changed the world and the player's career. The **challenges** increase through uneven masses, slot restrictions, tighter loading decisions and stronger simulated gusts.

## MDA framework

| Layer | How it appears in play |
| --- | --- |
| Mechanics | One crate per slot, a weighted balance calculation, mission-specific payload limits, pitch controls, flight modes, safety gates and delivery milestones. |
| Dynamics | Experiment with mass and distance, plan around restricted slots, make and release short pitch inputs, compare traces, rethink the load and try again. |
| Aesthetics | Challenge comes from the constraints and flight. Discovery comes from the clouds clearing over new destinations. Achievement comes from visible routes, badges and progression towards Cargo Commander. |

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

The first-run choice offers either beginner training or entry to the Mission Centre. Training shows one action at a time, including loading, comparing mass effects and practising pitch and flight-mode controls. The tutorial can pause the simulated flight while the learner reads.

Automatic help uses active time in the loading screen. The first reminder arrives after 45–75 seconds across the six missions, with a bounded delay for productive moves. Subsequent cues offer a strategy, a specific legal move and an optional solution invitation. The worked solution explains each placement, shows the balance point before and after and lets the player return to the original hold or start with an empty one. Its optional calculation table introduces the formula without interrupting the cargo task. After a flight, the instructor connects recorded events to a next action and can demonstrate flying the route.

## Scientific model and limitations

The longitudinal CG is a mass-weighted mean, `(empty aircraft mass × empty CG + Σ(crate mass × slot position)) ÷ total loaded mass`. All positions share the same nose datum. The gauge uses the aircraft's illustrated reference coordinates. Safety comparisons use the unrounded CG, with both target endpoints inclusive. Display precision increases where a two-decimal reading would obscure a safety boundary.

The simulated aircraft uses a simplified pitch and altitude response. A forward CG reduces response to nose-up input in the model. An aft CG weakens the restoring response and damping. Baseline stability, the player's inputs and simulated wind together determine flight behaviour. Cruise, Express and Rush vary pace and simulated disturbance for gameplay. Flight reports show modes and elapsed durations to support fairer comparisons.

Cargo Commander uses simplified educational models to demonstrate centre of gravity and aircraft stability. It is not intended for real-world aircraft loading, engineering certification or aviation flight training.

## Accessibility and interaction

Cargo can be dragged or selected and placed with buttons, including tap-based play. Flight has keyboard and on-screen controls. Named controls, visible focus, textual balance and flight status, reduced-motion styling, adjustable audio and optional maths support different ways to interact. The narrow-screen header, larger slot height and responsive tutorial highlight were checked in browser emulation. See the [test report](TEST_REPORT.md) for verified environments and limits.
