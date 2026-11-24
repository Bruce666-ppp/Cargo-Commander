# Cargo Commander — Test Report

## Environment

Testing on 22–23 November 2026 used the local version 0.1.0 on Windows, a Chromium-based in-app browser, Node.js 24.22.3 and pnpm 11.25.0. Separate test profiles were used for saved progression, first-time onboarding and Reset Progress. Desktop checks covered 1366×768, 1440×900 and 1920×1080 plus the browser's regular viewport. Tablet and phone checks used browser viewport emulation. No physical mobile device or independent Safari run was available.

## Automated tests

The local commands were `pnpm --config.store-dir=.pnpm-store test` and `pnpm --config.store-dir=.pnpm-store build`. The workflow runs the equivalent `pnpm test` and `pnpm build` after a frozen-lockfile install.

**38 tests passed, 0 failed.** Coverage includes the weighted CG formula, inclusive safety boundaries, boundary-sensitive display precision, cargo manipulation and constraints, all six worked solutions, flight response and acceleration, switched modes, campaign rewards and saved progress, confirmation-reset storage behaviour, timed hints, audio and spotlight geometry. The production build completed successfully.

## Six-mission solvability

The pre-fix browser campaign was flown from a fresh profile using normal game controls and Cruise mode. Every mission also has an automated solvability test on the release candidate. The complete arrangements below count legal placements of all required crates that satisfied the delivery checks. The table does not disclose their positions.

| Mission | Valid complete arrangements | Constraints satisfied | Browser Cruise delivery | Active time |
| --- | ---: | --- | --- | ---: |
| 01 · Island Supply Run | 20 | Yes | Passed | 30 s |
| 02 · Coastal Resupply | 15 | Yes | Passed | 30 s |
| 03 · Inter-Island Relay | 6 | Yes | Passed | 30 s |
| 04 · Emergency Medical Delivery | 10 | Yes | Passed | 30 s |
| 05 · Flight Through the Gusts | 18 | Yes | Passed | 32 s |
| 06 · Operation Windward | 2 | Yes | Passed | 34 s |

The six browser completions each recorded 100% corridor time. The post-fix browser regression repeated a Mission 01 delivery with 100% corridor time in 30 seconds.

## Gameplay regression

- **Mission centre and loading.** Verified mission briefing, Back and Resume, placing, dragging, swapping, unloading, Undo and Reset. Observed rejection of closed and incorrect slots and the over-limit optional battery.
- **Safety and scientific display.** In Mission 03, placing just the Radio Instruments in slot 3 produced 4.417 m against a 4.42–4.65 m range. The reading, accessible label and checklist agreed that the CG was too far forward. The calibration and safety thresholds retain full precision.
- **Flight and reports.** Tested pitch controls, Pause and Resume, mode switching and unsuccessful and successful attempts. A post-fix comparison showed the previous Cruise flight at 30.0 s and the current Rush flight at 15.0 s, with the same displayed CG and differing corridor time. The report names pitch inputs and flight mode as factors.
- **Delivery and persistence.** Verified promotions, badges, island discovery and established routes through all six missions. Completed progress survived reload, and a replay did not duplicate the reward. In the post-fix build, cancelling Reset Progress kept one completed mission. Confirming returned to first-time onboarding and the Trainee rank, with sound muted and the changed music volume still saved after reload.

## Educational support

Tested both first-run paths, highlight placement, interaction restrictions, automatic scroll, correct-action progression, exit and return from training. The 320-pixel recheck advanced from the highlighted crate to the corresponding enlarged cargo slot and then to the CG explanation. Training, Practice and demonstrations did not award career progression. A successful official delivery after using learning support still granted the corresponding rewards.

Observed the first autonomous hint at approximately 45 seconds of active loading time in Mission 01. Tested paused timing under overlays, legal contextual suggestions and the separate invitation to view a solution. Automated tests cover each mission's exact schedule. Opened the worked solutions for all six missions and verified stepping, replay, return to the original load, optional maths and trying with an empty hold. Verified practice failure, instructor feedback, demonstration and retry.

## Audio

Verified background music playback after a trusted input, engine ambience during flight, pause or transition cleanup, separate volume settings, mute and persistence. Automated tests also exercise synthesized sound cues for cargo, warnings, success, failure, first awards and replays. Tests measured Web Audio behaviour and cue sequencing. Subjective listening quality and physical device audio were outside this test session.

## Responsive compatibility

| Method | Viewports or test scope | Observed result |
| --- | --- | --- |
| Desktop browser | 1366×768, 1440×900, 1920×1080 | Loading, flight, progression and dialogs were usable. |
| Tablet-sized browser viewport | 768×1024, 1024×768 | Mission Centre, overlays and career panel fit the view. |
| Mobile-sized browser viewport | 320×568, 360×800, 390×844, 414×896, 844×390 | Rechecked title wrapping, page width and header separation. At 390 pixels all four header controls opened their intended views. Cargo placement and the flight controls were exercised with browser inputs at mobile sizes. |
| Header transition and desktop regression | 650×800, 1280×712 | The narrow-screen grid fitted its controls. The desktop title remained on one line. |

The narrow loading buttons were 44 CSS pixels high in the tested phone layouts, with distinct horizontal hit areas. At 390 CSS pixels the tests used mouse and keyboard actions in an emulated viewport. Physical touch hardware, additional browser families and fully validated screen-reader usage remain unverified.

## Production deployment verification

The Vite build emits JavaScript and CSS URLs under `/IDAT7220FinalGame/assets/` and writes the static site to `dist/`. Local production preview verified the home screen, new-player flow, in-game About, a live CG update and refresh.

On 23 November 2026, the [GitHub Actions build and deploy jobs](https://github.com/Bruce666-ppp/IDAT7220FinalGame/actions/runs/45089725305) succeeded for commit `5f25bab`, including dependency installation, automated tests and the build. The public [Cargo Commander site](https://bruce666-ppp.github.io/IDAT7220FinalGame/) returned HTTP 200 without authentication. Its bundled JavaScript and CSS both returned HTTP 200 under the repository subpath with their expected media types.

- The README's PLAY CARGO COMMANDER link opened the correct public URL. Direct refresh reopened the game. A fresh visit displayed both onboarding paths.
- In an isolated Chromium view of the published game, About Game showed the four learning objectives. Mission 01 cleared inspection and completed in Cruise with 100% corridor time over 30.0 s. The delivery awarded Junior Loadmaster, Balance Basics and the Harbor Base–Pinehaven route.
- At 390×844, the public build displayed the full wrapped title, opened About Game and accepted cargo into an aircraft slot. At 320×568, the header controls remained separate and all six slot hit areas were 44 CSS pixels high. Both emulated widths showed no horizontal page overflow.
- No critical game console errors were observed in those checks. Physical phones were outside the test scope.

## Known limitations

Progress is specific to the browser and origin. The longitudinal model, flight response, gusts and acceleration modes are educational simplifications. User testing was technical and functional. It did not measure learner engagement, conceptual mastery or learning gains.

## Phase 7.1–7.2 educational alignment regression

The 23 November 2026 candidate passed **39 automated tests** and the Vite production build. The new test checks that the four titles, categories and complete statements match across the game, README and design document. It also checks the exact ABCD elements in the design document against the game. The existing campaign, loading, flight, audio, saved-progress and teaching-support tests passed again.

| Check | Observed result |
| --- | --- |
| Home and About Game | Home displayed four short summaries. About Game displayed all four complete outcomes and their categories directly after the STEM topics and branches. All four ABCD breakdowns and Pedagogical Frameworks opened and closed. The complete statements remained visible when the panels were closed. |
| Keyboard and responsive layout | The Chromium desktop check used 1280×720. The responsive checks used frame viewports of 320×568, 390×844, 768×1024 and 844×390. The modal and document had no horizontal overflow. Keyboard input toggled the ABCD details, and the pedagogy panel remained usable at narrow widths. |
| Access during gameplay | Opened the updated About Game from both Mission Centre and active Cargo Loading. The game returned to the current screen on close, with the cargo layout retained. |
| Existing gameplay and persistence | Advanced the spotlight to the balance explanation, opened a hint and stepped through a worked solution. Completed Mission 01 in Cruise with 100% corridor time in 30.0 s, receiving Junior Loadmaster, Balance Basics and the Harbor Base–Pinehaven route. Reload preserved the award, unlock and changed music volume. Automated tests covered all six missions. |
| Screenshot evidence | Captures came from the running application. See [Home](docs/screenshots/home.jpg), [Learning Outcomes](docs/screenshots/learning-outcomes.jpg), [ABCD breakdown](docs/screenshots/abcd-breakdown.jpg) and [Pedagogical Frameworks](docs/screenshots/pedagogical-frameworks.jpg). |

### Public deployment verification for Phase 7.1–7.2

On 23 November 2026, the [GitHub Actions build and deploy jobs](https://github.com/Bruce666-ppp/IDAT7220FinalGame/actions/runs/45126697092) succeeded for commit [`e8c5e94`](https://github.com/Bruce666-ppp/IDAT7220FinalGame/commit/e8c5e942c92a0329624ba7f3b560fa7fd6560740). The [game URL](https://bruce666-ppp.github.io/IDAT7220FinalGame/), its JavaScript and CSS returned HTTP 200 without authentication. The asset paths matched the local production build.

- Opened the game using the URL in the published README and verified a direct refresh. The Home card listed all four summaries. About Game displayed all four complete statements with the detailed ABCD and Pedagogical Frameworks sections closed by default. Each ABCD disclosure toggled successfully. The three frameworks and the five 5E stages appeared on expansion. No game console errors were observed in those checks.
- The same public URL had no horizontal overflow in the game page or About dialog at 320×568 and 390×844. At 390×844, opening About during Coastal Resupply and closing it returned to Cargo Loading with the 12 kg Air Filters still in slot 3.
- The published README rendered its ten inline gameplay screenshots and linked to the expanded Pedagogical Frameworks screenshot. The published design document displayed the constructive alignment table and both optional teacher questions.

These checks verify functionality and content consistency. They do not measure learner understanding or learning gains. The optional teacher questions are documented assessment opportunities and have not been administered. Independent subject-matter review, physical mobile devices, Safari and full screen-reader testing remain open.

## Phase 7.3 creative workflow and campaign regression

The local release candidate passed **49 automated tests** and the Vite production build. Ten new tests cover configuration bounds, loading feasibility, reference calculations, invalidation after edits, the manual flight result gate, transfer encoding, malformed and tampered payloads, Mission Architect criteria, and versioned local storage. Existing tests continue to cover all six official missions, loading and flight mechanics, teaching support and audio. The reset regression verifies the approved campaign-only reset.

| Browser check | Observed result |
| --- | --- |
| Creation and scientific explanation | In a test profile prepared with Mission 03 progress, the editor rejected an out-of-range mass. A custom 20 kg challenge used blocked slot 6 and a 4.45–4.55 m target. The learner loaded two 10 kg crates either side of the empty-aircraft CG. The saved diagram and optional maths traced a 4.50 m balance using the 100 kg empty aircraft. |
| Flight, saving and reward | The creator's manual Cruise test completed in 30.0 s with 100% corridor time. Saving the validated design earned Mission Architect. A draft could be continued but could not be shared. Cancelling deletion retained the draft, and confirming removed only that draft. The isolated campaign reset restored Trainee Loadmaster, retained the validated design and badge, and locked the Create Mission action while leaving the saved mission actions available. |
| Local peer challenge | A generated share link opened in a separate test session at Trainee Loadmaster. The receiver saved it, opened the creator's worked example from Cargo Loading, and finished the challenge with the two crates in the opposite order. The official rank was unchanged. |
| Training | The full beginner replay progressed from initial loading and the heavy/light comparison through safety checks, pitch controls, flight modes and pause. It then showed campaign progression and finished the temporary DIY flight as step 8 of 8. All six individual modules opened and exited directly. The independent DIY module also completed a short flight without creating a saved mission, granting the badge or unlocking creation. |
| About Game | The Home card listed five summaries. The About panel displayed five complete statements, and keyboard input toggled each of the five ABCD breakdowns. |
| Responsive | Chromium desktop and emulated viewports of 320×568, 390×844, 768×1024 and 844×390 were checked. The editor displayed six separate slot controls, each at least 44 CSS pixels high. With the final editor layout, the 768×1024 and 844×390 geometry checks also confirmed that slot controls did not overlap. The blocked state was operated from the aircraft diagram. See the [mobile capture](docs/screenshots/mobile-diy.jpg). |

### Public deployment and cross-session challenge

On 23 November 2026, GitHub Actions successfully ran the tests, production build and deployment for [`56ba3ba`](https://github.com/Bruce666-ppp/IDAT7220FinalGame/commit/56ba3baa52d492374e0d9782c66c3a1c6e2c126d). The [public game](https://bruce666-ppp.github.io/IDAT7220FinalGame/) and its versioned JavaScript and CSS returned HTTP 200 without authentication. The published repository matched the reviewed release and the README displayed all 12 inline screenshots. [View the Actions run.](https://github.com/Bruce666-ppp/IDAT7220FinalGame/actions/runs/45134039148)

An isolated browser session with three completed official deliveries created and balanced Harbour Peer Delivery. The creator's manual Cruise test finished in 30.0 s with 100% corridor time. Saving earned Mission Architect and copying produced a 241-character public link.

A second browser session used a separate storage partition and opened that link at a 390×844 viewport. It began at Trainee Loadmaster, saved the design under Received Missions and opened the creator's reference example and note. Its own solution swapped the two crates and finished in Cruise with 100% corridor time over 30.0 s. The receiver's Achievement Wall still showed zero official completions and a locked Mission Architect badge. A malformed link displayed the error screen with an option to return to Mission Centre. The public About panel displayed all five outcomes, and LO5 expanded to show all four ABCD elements.

The receiver can verify structure and recompute loading and CG from the link. The link does not authenticate its author or independently prove flight completion. Custom missions and audio settings are local to the browser. Link payloads, names, notes and the saved mission library have bounded sizes. The flight and loading models are educational simplifications. No independent subject-matter expert review, physical-device testing, cross-browser compatibility study or student learning assessment was conducted for this revision.

## Phase 7.4 STEM gameplay, rewards and island development

The candidate passed **60 automated tests**, TypeScript checking and the Vite production build. Eleven additional tests cover the simulation-backed quick path, controlled experiments, reward records and migration, district identities, DIY validation, ABCD content and Web Audio cue scheduling. All 71 complete legal arrangements across the six official payloads reached a successful delivery under Quick Flight Verification, distributed 20, 15, 6, 10, 18 and 2 by mission. Original official scenarios and simulator parameters were retained.

| Browser check | Observed result |
| --- | --- |
| Tutorial and course content | A guided Chromium pass measured **29.1 seconds** from Begin Training to Finish Training in one successful run. The run included browser interaction and capture time. Training finished with no campaign income or development. Complete Training and all six individual modules remained accessible. Home and About Game each displayed five ABCD outcomes and visible clauses. |
| Scientific decision and flight | Completed all six STEM activities and deliveries through the running UI. The two 1 m trials at 70 kg cargo produced CG shifts of 0.294 m and 0.071 m. Mission 03 accepted two distinct safe layouts. The 32-second controlled Mission 05 trials returned 87.7% and 61.1% corridor occupancy at displayed CGs of 4.53 m and 4.65 m. Started Manual Flight, paused, resumed and returned to Cargo Loading with the manifest retained. |
| Rewards and map | Reached **$12,000** official earnings, a $4,500 final reward and six districts in the map SVG. A reload kept all six. Campaign reset in an isolated test profile restored official earnings and districts to zero. Mercy Cay captures show the before view, building phase and developed campus. |
| DIY and peer exchange | At zero campaign completions, blocked slot 6, changed cargo mass and saved a valid 20 kg two-crate mission after testing its reference layout. Mission Architect paid $2,000 once. An independent receiver saved and completed the shared challenge. Reset in the creator's test profile kept the saved mission and $2,000. |
| Responsive | Checked the Home page at iframe widths 320, 390, 768 and 844 CSS pixels in Chromium. The document had no horizontal overflow at those sizes. Desktop and narrow captures were taken in the running application. |
| Audio and accessibility | A Web Audio mock checked timed victory, construction, coin and badge cues, mute and stopping the reward group. Visual status, mode labels and numerical results remain readable alongside the audio. Playback loudness and listening quality on physical devices were not measured. |

See the [gameplay gallery](README.md#gameplay-gallery) for the captured interfaces. The interval measures one browser walkthrough, and the science checks verify the in-game model and task performance. The revision has not been evaluated with a learner cohort, physical mobile devices, Safari or a full screen-reader audit.

### Phase 7.4 public deployment verification

On 24 November 2026, the [GitHub Actions build and deploy jobs](https://github.com/Bruce666-ppp/IDAT7220FinalGame/actions/runs/45330800586) succeeded for release commit [`b409639`](https://github.com/Bruce666-ppp/IDAT7220FinalGame/commit/b409639ea1d93d6e7ca4ecc3f8d83377c4610011). The [public game](https://bruce666-ppp.github.io/IDAT7220FinalGame/), JavaScript and CSS each returned HTTP 200 without authentication. Both asset names matched the local production artefact.

- The public Home page and in-game About Game displayed all five outcomes. An isolated browser profile with zero official earnings completed the public beginner training and skipped its reward animation. The final sample reward remained visible and the campaign earned $0.
- The same profile read the 4.56 m CG, earned the optional bonus and completed the first delivery through Quick Flight Verification. The reward showed $400 income and $100 STEM Bonus. After a reload, the Mission Centre still showed $500 and one developed district.
- The public audio switch toggled to off and stayed off after a reload. It was then switched back on for the remainder of the test. The automated Web Audio checks covered the sequencing of effects.
- The public player created a two-crate challenge after one official delivery. It earned Mission Architect and the one-time creative reward. A second browser storage partition opened the generated public link, saved the mission and completed it with the two crates in the opposite order at a 390-pixel viewport. The six slot controls were each 44 CSS pixels high, with no overlap or horizontal overflow.
- The second profile held three official deliveries and Mission Architect from Phase 7.3. Migration showed $3,900 and three districts, comprising $1,900 in base income and the $2,000 creative reward. The fourth delivery added its $1,500 income and $500 STEM Bonus. The [Mercy Cay screenshot](docs/screenshots/phase74-mercy-cay.jpg) shows the final $2,000 and the completed campus on the public site.

## Phase 7.5 map, delivery and celebration regression

**63 automated tests passed** along with the TypeScript and Vite production build. Tests verify that every route starts at an already connected island and establishes one new destination, that building plots clear the runway in both layouts, that a Phase 7.4 Mission 03 record restores Coral Point without another payout, and that both delivery paths use the same safety and reward rules. The 71 complete legal loads still pass Auto Delivery. The audio checks cover the two recorded bursts, construction impacts, the longer finale, skipping or muting and cancellation while audio is decoding.

| Browser check | Observed result |
| --- | --- |
| Local campaign | Started with seven map sites, no developed destinations and seven operational Harbor Base buildings. Completed all six missions through Auto Delivery. The final map contained seven connected islands and six established routes. The building counts were 7, 11, 13, 15, 18, 20 and 24. Reload retained the routes and districts. Completing the last outstanding optional activity on replay reached $12,000 without paying the completed delivery again. |
| Manual Delivery | Both options were disabled with an empty hold. In an independent profile the same legal 60 kg manifest passed Manual Delivery in Cruise with 85.6% corridor occupancy in 30.0 s. Manual and Auto Delivery each granted $400 base income and completed Mission 01 without a second flight. |
| Construction and audio | Captured survey foundations, building waves and completed campus states in the running game. The ordinary recording played two bursts of 1.02 and 1.23 seconds in a running Web Audio context, with 1.24 and 1.94 seconds for Northstar. Skipping visibly completed the district and stopped both scheduled sample sources. With the reduced-motion preference simulated, the finished view appeared immediately and used a single 2.22-second burst. |
| Layout and controls | Reviewed the complete desktop map and the 390 CSS-pixel two-column map. On the narrow layout the two delivery buttons measured 44 CSS pixels high. The on-screen pitch, pause and resume controls were operated on the running manual flight. |
| Learning and creation | Replayed the short beginner flow, which introduced Auto Delivery on the loading check. About Game displayed all five ABCD outcomes. A fresh profile created and tested an original two-crate challenge. An independent profile imported, saved and completed the same challenge with the two crates exchanged. |

The [screenshot gallery](README.md#gameplay-gallery) shows real game states. The 59.6 kB crowd asset measured a sample peak of −6.9 dBFS before in-game mixing. Audio testing covers decoded playback and event timing. Perceived loudness, comparative frame rate, Safari and physical mobile-device playback were not measured.

### Phase 7.5 public deployment verification

On 24 November 2026, the [GitHub Actions build and deployment](https://github.com/Bruce666-ppp/IDAT7220FinalGame/actions/runs/45343859183) succeeded for [`b897e9e`](https://github.com/Bruce666-ppp/IDAT7220FinalGame/commit/b897e9e505d878281124fa90a90edb1fe6a617b7). The [public game](https://bruce666-ppp.github.io/IDAT7220FinalGame/), versioned JavaScript, CSS and 59,604-byte MP3 all returned HTTP 200 without authentication. The canonical game URL opened with the new JavaScript and the five ABCD outcomes. No error-level console messages were captured in that check.

- A clean, isolated Chromium session started at $0 with seven sites and seven Harbor Base buildings. It completed the actual Mission 01 load through Auto Delivery and reached the reward screen without a manual flight. After a reload the Mission Centre still showed $500 and one developed destination. The sound switch stayed off after a reload and could be enabled again.
- A separate 390-pixel public session reopened a Phase 7.4 save with four deliveries and Mission Architect. It displayed the new Coral Point development, four established routes and the original $5,900 total without replaying Mission 03.

## Phase 7.5.3 sequential campaign and architecture regression

The 63 automated tests and the TypeScript/Vite production build passed. The tests cover the exact sequential campaign, migration of saved mission and reward records, runway clearance, official loading and flight requirements, both delivery modes, audio cues, and DIY validation.

| Browser check | Observed result |
| --- | --- |
| Fresh campaign | Harbor Base was built, Pinehaven was available and later destinations were clouded. All six official missions completed through Auto Delivery. Reloading retained six developed destinations and six established routes. |
| Island construction | Captured the Mercy Cay foundations, roads and services, and finished campus during first delivery. The complete map and the enlarged Harbor Base and Northstar views used the actual in-game SVG components. |
| Narrow layout | The complete map showed all seven islands in its two-column layout at a 375 CSS-pixel content width without horizontal overflow. |

See the [updated gallery](README.md#gameplay-gallery) for browser captures from the revised game.
