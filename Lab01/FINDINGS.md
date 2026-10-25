# Lab 1 — Lifecycle Log findings

## Evidence status

This is a React Native adaptation of the visible MAUI lab requirements. On 2026-10-25, Home, rotation, and app switching were observed on the Android emulator. The swipe-away gesture could not be completed through injected input and remains blocked. A separately labelled Android task-removal/relaunch check verified runtime reset and saved-history restoration. These are **Expo Go host-runtime observations**, not standalone native-app or iOS evidence.

## Environment record

| Field | Android | iOS |
| --- | --- | --- |
| Device/model | Medium_Phone_API_36 / sdk_gphone64_x86_64 | Pending |
| Physical device or emulator | Local Android emulator | Pending |
| OS version / API level | Android 16 / API 36 (ADB) | Pending |
| Expo Go version or native build ID | Expo Go 57.0.9 (ADB) | Pending |
| Runtime | Expo Go host runtime, Metro on port 8081 | Pending |
| Expo / React Native | SDK 57 / RN 0.86.3 | SDK 57 / RN 0.86.3 |
| Fast Refresh disabled | Yes; [toggle evidence](evidence/02-fast-refresh-off.png) | Pending |
| Date and tester | 2026-10-25; Codex using authorized ADB control, user confirmed hands-off | Pending |

The emulator used software rendering (`swiftshader_indirect`). Preparation restarts and earlier user interactions are excluded from the recorded run. The baseline retained the existing counter value **10**, session **`mvocjnp0-klnxu6qb`**, and **37 saved entries**; no log clear was performed. Evidence was captured using ADB screenshots and fresh UIAutomator dumps, not Share Log. All timestamps below are UTC. Baseline: [screen](evidence/06-run-baseline.png), [UI text](evidence/06-run-baseline.xml).

## Experiment procedure

1. Open Lifecycle Log, disable Fast Refresh, wait for storage, and note the session ID.
2. Increment the counter to a known value. Export existing evidence before clearing the log.
3. Perform one action below. Record all observed events in sequence order, including timestamps and session IDs. The screen is newest-first; exported text is oldest-first.
4. Record the counter before/after and whether the session changed. Wait for `Storage: saved`, then Share Log. Sharing can itself create state/focus events; delimit the experiment before opening the share sheet.
5. Repeat separately on both platforms. Preserve unexpected results rather than editing them to match a hypothesis.

| Action | Hypothesis to investigate | Android actual sequence / counter / evidence | iOS actual sequence / counter / evidence |
| --- | --- | --- | --- |
| Home → return | Background then active; iOS may include inactive. Counter survives if runtime survives. | Observed #10–11: background → active; counter 10 → 10, same session, 39 saved entries. | Pending |
| Portrait → landscape → portrait | Window-size events, responsive content, counter retained in the same runtime. AppState may remain active. | Observed #12–13: two size changes; active throughout, counter 10 → 10, same session, 41 saved entries. | Pending |
| Switch apps → return | Compare with Home; Android focus events are separate from app state. | Observed #14–15: background → active; counter 10 → 10, same session, 43 saved entries. | Pending |
| Swipe away → relaunch | A new runtime has a new session and zero counter; completed log writes remain. No destruction callback is promised. | Blocked: injected swipes left the Recents card present. Reopening retained counter 10 and the session. Supplemental task removal below is not a passed swipe test. | Pending |

An OS action does not guarantee a particular callback sequence. A new session can also result from JavaScript reload, and is not proof of process death.

## Recorded Android sequences

The following events belong to session `mvocjnp0-klnxu6qb`, shown here chronologically (the UI displays newest first).

| Action | Sequence | Timestamp (UTC) | Actual log event |
| --- | --- | --- | --- |
| Home | 10 | 2026-10-25T21:38:44.332Z | active → background |
| Return from Recents | 11 | 2026-10-25T21:39:10.694Z | background → active (returned from background) |
| Landscape | 12 | 2026-10-25T21:39:37.227Z | Window size: 914.2857142857143 × 363.42857142857144 dp |
| Portrait | 13 | 2026-10-25T21:40:15.475Z | Window size: 411.42857142857144 × 866.2857142857143 dp |
| Open Android Settings | 14 | 2026-10-25T21:40:44.960Z | active → background |
| Return from Recents | 15 | 2026-10-25T21:42:17.171Z | background → active (returned from background) |

- **Home:** pressed Android Home, confirmed the launcher, then selected the lab in Recents. [Launcher](evidence/10-home.png), [counter/session after return](evidence/12-home-return.png), [saved event sequence](evidence/13-home-events.xml).
- **Rotation:** used Android system rotation overrides (`accelerometer_rotation=0`, `user_rotation=1`, then `0`), then restored the original auto-rotate setting (`1`). This tested orientation/layout changes, not physical sensor rotation. Content was accessible by scrolling in landscape. No AppState transition occurred between #11 and #13. [Landscape event](evidence/21-landscape-top.xml), [landscape counter](evidence/22-landscape-counter.png), [portrait event](evidence/23-portrait-return.xml), [portrait counter](evidence/24-portrait-counter.png).
- **App switch:** launched Android Settings and returned by selecting the lab's Recents card. [Settings foreground](evidence/30-settings.png), [returned counter and events](evidence/32-switch-return.xml), [returned screen](evidence/32-switch-return.png).

No Android focus/blur event appears between #10 and #15. This describes this run only; it does not imply that these callbacks are unavailable. Backgrounding preserved the in-memory counter in this runtime; that is not a guarantee against future OS reclamation.

### Swipe attempt and supplemental task removal

Injected upward swipes did not dismiss the lab's Recents card. [Before](evidence/40-before-swipe.png) and [after](evidence/41-after-swipe.png) captures document the first attempt. Reopening the project retained session `mvocjnp0-klnxu6qb` and counter 10, with #16 `active → background` at `2026-10-25T21:43:24.135Z` and #17 `background → active` at `2026-10-25T21:43:29.202Z`. [Reopen evidence](evidence/42-relaunch-attempt.xml). Further attempts also left the task present. **A manual swipe-away run remains required.**

For a distinct recovery check, `adb shell am stack list` identified task 26 as the project's `host.exp.exponent/.experience.ExperienceActivity`. `adb shell am stack remove 26` removed that task; this was task removal, not a swipe or force-stop. The [before](evidence/50-tasks-before.txt) and [after](evidence/51-tasks-after.txt) task inventories provide evidence. The project was then reopened using `exp://127.0.0.1:8081`.

Observed results:

- Last old-session record: #18 `active → background`, `2026-10-25T21:47:41.047Z`.
- New session: **`mvoczx5x-g7877ddz`**. At `2026-10-25T21:48:03.606Z`, #1 recorded `JavaScript session started`, #2 `Initial app state: active`, and #3 the portrait dimensions above. [Startup and old-session boundary](evidence/56-startup-events.xml).
- Counter reset **10 → 0**; storage reported **saved 49/500 entries**. [Result screen](evidence/53-task-relaunch-result.png), [result UI text](evidence/53-task-relaunch-result.xml).
- Earlier events were restored and explicitly labelled `Saved session: mvocjnp0-klnxu6qb`. [Restored history](evidence/54-restored-history.xml).
- Expo Go PID was **1602 both before and after**, as captured [before](evidence/40-process-before.txt) and [after](evidence/53-process-after-relaunch.txt). A new JavaScript session therefore did not demonstrate host-process death. No termination cause is inferred from the session ID.

No `Destroying` event was recorded. This run demonstrates restoration of completed writes, not guaranteed recovery of pending writes after abrupt termination. It does not validate low-memory process death or standalone app behavior.

## Interpretation

- **Created:** our startup event identifies a JavaScript session, not a native window or Activity creation.
- **Activated:** `active` reports foreground state.
- **Deactivated:** iOS `inactive` and Android `blur` have different meanings. Pulling down Android's notification shade can blur without backgrounding.
- **Stopped:** `background` is an observation, not confirmation that the process stopped executing.
- **Resumed:** the logger annotates active after background, including an intervening inactive state.
- **Destroying:** there is no reliable JavaScript termination callback. React cleanup is not OS destruction; pending writes can be lost.

Mobile execution is controlled by the OS and user. A server request normally has a bounded request/response flow; a mobile runtime can be interrupted without a final callback. Save small amounts of needed state while running, and avoid background polling. The intentionally volatile counter demonstrates what is lost without persistence.

## Additional acceptance checks

| Check | Android | iOS |
| --- | --- | --- |
| Offline after bundle has loaded: increment, observe, clear, restore | Pending | Pending |
| Large font/display scaling, portrait and landscape | Pending | Pending |
| Light/dark appearance and contrast | Pending | Pending |
| TalkBack / VoiceOver focus and named controls | Pending | Pending |
| System back, interruptions, lock/unlock | Pending | Pending |
| Reduced motion, safe areas, small screen | Pending | Pending |
| Separate forced process death / low-memory recovery | Pending | Pending |

No protected-resource permissions are requested by this feature, so permission-denial tests are not applicable to its own code. Host Expo Go permissions are not evidence of a standalone app's permissions.

## Automated verification

Tests cover ordering, resume interpretation, retention/restoration, counter reset, storage failures, corrupt saved data, clear/write races, subscription cleanup, accessible controls, and share failure recovery.

| Verification | Observed result |
| --- | --- |
| `npm test` | Passed: 12 tests, 3 suites |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed, no warnings |
| `npx expo install --check` | Passed after SDK 57 patch alignment |
| `npx expo-doctor` | Passed: 21/21 checks after deduplicating react-native-screens to 4.26.2 |
| `npx expo export --platform all --output-dir .expo/lab-export` | Passed: Android/iOS Hermes bundles and four static web routes; not native device validation |
| `npm audit --omit=dev` | 8 unresolved findings; see constraints.md |

## Observed preview checks and device limitations

- The web preview rendered both tabs in dark appearance. Incrementing to 1, switching to Lab Guide, and returning retained the counter and session. Reloading reset the counter to 0, created a new session, and restored earlier entries labelled Saved session. These are browser observations only.
- Visual inspection exposed a clipped heading in the web tab layout. The tab content now flexes into available space instead of consuming a full viewport plus the footer; a follow-up screenshot confirmed that the heading and navigation are visible. Preview evidence: `.expo/lifecycle-preview.png` (local generated artifact).
- Windows desktop capture repeatedly timed out. The user authorized ADB control/capture, which supplied the Android evidence above. The swipe gesture and additional acceptance checks remain pending; three lifecycle actions and a separate task-removal recovery check were observed.
- This Windows environment has no iOS simulator or connected iOS test session. iOS device checks remain pending.
- Development refresh was enabled for browser implementation checks, so these checks are not the formal four-experiment evidence run.
