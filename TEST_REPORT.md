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
