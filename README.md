# React Native Lifecycle Lab

An Expo SDK 57 / React Native 0.86 adaptation of Lab 1: observe the mobile lifecycle, compare it with MAUI concepts, and explain what survives interruption.

## Run locally

From `C:\Freelance\mobile` (this folder is a standalone package):

```powershell
npm ci
npm start
```

Use an SDK 57-compatible Expo Go client. Scan the QR code on a physical device, or press `a` in the Expo terminal to open an already-running Android emulator. Windows cannot run the iOS simulator; use a physical iOS device with Expo Go, or macOS/Xcode for simulator testing. A development build is not required for this lab.

Android toolchain checks:

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA/Android/Sdk"
& "$env:ANDROID_HOME/platform-tools/adb.exe" devices -l
& "$env:ANDROID_HOME/emulator/emulator.exe" -list-avds
```

The device must be listed as `device`, not `offline` or `unauthorized`. Start a configured emulator through Android Studio and unlock it before pressing `a`. If using a physical device, accept its USB debugging prompt. `npm run web` is a layout preview, not mobile lifecycle evidence.

## Use the lab

- **Lifecycle Log:** current AppState, window size, session ID, in-memory counter, and newest-first event history. Increment the counter before each experiment.
- **Lab Guide:** instructions and the differences between MAUI lifecycle concepts and actual React Native observations.
- **Clear Log:** clears retained entries across sessions, while keeping the current counter and session. New observations are still recorded.
- **Share Log:** opens the system share sheet with an oldest-first snapshot. The sheet itself can cause later lifecycle events. If browser sharing is unsupported, the screen shows an error and retains the log.
- **Storage:** wait for `saved` before closing. On errors, retry; invalid saved data requires Clear Log. Abrupt termination can still lose pending writes.

Disable Fast Refresh from the development menu before recording evidence. Perform Home → return, portrait → landscape → portrait, switch apps → return, and swipe away → relaunch. Enable system auto-rotate. In Expo Go, swipe away the host and reopen the project. Record actual observations and runtime versions separately on Android and iOS in [Lab01/FINDINGS.md](Lab01/FINDINGS.md). Never invent a Destroying event, equate effect cleanup with termination, or assume a new JavaScript session proves process death.

The counter is intentionally not persisted. Logs retain the newest 500 entries across sessions using AsyncStorage. No backend or sensitive permission is needed. Offline checks should start after the development bundle is loaded; cold-opening Expo Go may still need Metro.

## Architecture

`src/lifecycle` contains a framework-independent event model/store, a serialized storage adapter, native subscriptions, and a root React provider. The store owns ordering, retention, resume interpretation, recovery, and the counter; screens only render state and invoke actions. Subscription cleanup does not emit a destruction event. One module-level store represents a JavaScript session, so tab changes and effect reattachment do not create sessions. Fast Refresh is excluded from experimental evidence.

## Verify

```powershell
npm run typecheck
npm run lint
npm test
npx expo export --platform web --output-dir .expo/lab-web
```

Jest uses `jest-expo` and React Native Testing Library. Tests cover behavior and failure recovery rather than snapshots. Device checks, security constraints, dependency-audit limitations, and release boundaries are documented in [Lab01/constraints.md](Lab01/constraints.md). Passing mocks or a web build does not establish platform compliance.

## Pair repository submission

This working directory currently has no Git repository. Obtain the intended pair repository URL and clone it into a separate directory first; do not invent a remote or initialize/push this folder automatically. Copy the lab source and lockfile into the agreed project location, excluding `node_modules`, `.expo`, and local caches. In that repository:

```powershell
git status
# Stage only the reviewed lab files in your agreed project location.
git add <reviewed-paths>
git commit -m "Implement React Native lifecycle lab"
git push
```

Suggested checkpoints are logger/store, screens and tests, then device findings. Replace pending findings with actual evidence before coursework submission. The screenshot only showed the overview; confirm any unseen instructor rubric separately.
