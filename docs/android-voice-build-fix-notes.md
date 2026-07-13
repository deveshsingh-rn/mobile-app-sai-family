# Android Voice Build Fix Notes

Date: 2026-07-13

## Problem

Android EAS development build failed with:

```text
Gradle build failed with unknown error.
See logs for the "Run gradlew" phase for more information.
```

Failed build id:

```text
4c80fbd2-0576-4615-95ca-37371b8eec89
```

## Step 1: Fetch The Real EAS Error

The EAS summary was too generic, so the build metadata was fetched:

```bash
npx eas-cli build:list --platform android --limit 1 --json
npx eas-cli build:view 4c80fbd2-0576-4615-95ca-37371b8eec89 --json
```

The log file was Brotli-compressed, so it was decoded before reading:

```bash
brotli -d -f /private/tmp/eas-android-build.log \
  -o /private/tmp/eas-android-build.decoded.log
```

## Step 2: Identify Root Cause

The real Gradle failure was:

```text
Execution failed for task ':siteed-audio-studio:compileDebugKotlin'.
```

Important Kotlin errors:

```text
AudioRecorderManager.kt: 'reject' overrides nothing
AudioRecordingService.kt: 'reject' overrides nothing
AudioStudioModule.kt: 'reject' overrides nothing
```

Root cause:

```text
@siteed/expo-audio-stream@2.2.1
  -> @siteed/audio-studio@3.2.1
```

NPM deprecation message:

```text
Deprecated: use @siteed/audio-studio instead. This compatibility shim only re-exports @siteed/audio-studio.
```

`@siteed/audio-studio@3.2.1` currently does not compile against Expo SDK 54 Android because Expo Modules Core changed the Kotlin `Promise.reject` API shape.

## Step 3: Check Package Options

Installed package tree showed:

```bash
npm ls @siteed/expo-audio-stream @siteed/audio-studio
```

The package metadata was checked:

```bash
npm view @siteed/audio-studio version versions --json
npm view @siteed/expo-audio-stream version versions dependencies peerDependencies --json
```

Findings:

- Latest `@siteed/audio-studio` was `3.2.1`.
- No newer version existed with an SDK 54 fix.
- `@siteed/expo-audio-stream@2.2.1` is only a deprecated shim that re-exports `@siteed/audio-studio`.
- Older `@siteed/expo-audio-stream@2.1.0` avoided `audio-studio`, but brought nested `expo-modules-core@2.1.4`, creating duplicate native modules and still using old Promise signatures.

So keeping `@siteed/expo-audio-stream` was not build-safe for Expo SDK 54.

## Step 4: Remove Broken Mic Package

Removed the incompatible package:

```bash
npm uninstall @siteed/expo-audio-stream
```

Kept build-safe native packages:

```text
expo-dev-client
react-native-audio-api
react-native-worklets@0.8.0
```

Current expected dependency tree:

```bash
npm ls expo-dev-client react-native-audio-api react-native-worklets \
  @siteed/expo-audio-stream @siteed/audio-studio --depth=1
```

Expected result:

```text
expo-dev-client@6.0.21
react-native-audio-api@0.13.1
react-native-worklets@0.8.0
```

And no:

```text
@siteed/expo-audio-stream
@siteed/audio-studio
```

## Step 5: Keep Worklets Version Intentional

`react-native-audio-api@0.13.1` requires:

```text
react-native-worklets >= 0.6.0
```

Expo SDK 54 expected `react-native-worklets@0.5.1`, but `react-native-reanimated@4.1.7` accepts:

```text
react-native-worklets 0.5 - 0.8
```

So `react-native-worklets@0.8.0` was kept intentionally.

`package.json` includes:

```json
"expo": {
  "install": {
    "exclude": [
      "react-native-worklets"
    ]
  }
}
```

This prevents Expo dependency validation from downgrading `react-native-worklets` back to `0.5.1`.

## Step 6: Validate Project

Run:

```bash
npx expo-doctor
npx tsc --noEmit
npm run lint
```

Confirmed result:

```text
npx expo-doctor -> 18/18 checks passed
npx tsc --noEmit -> passed
npm run lint -> passed
```

## Step 7: Retry Android Build

Started a new Android development build:

```bash
npx eas-cli build --profile development --platform android --non-interactive
```

New build id:

```text
c7351469-c21a-4b7c-86fb-9e927d395720
```

Build URL:

```text
https://expo.dev/accounts/devesh-rn/projects/sai-family/builds/c7351469-c21a-4b7c-86fb-9e927d395720
```

At the time of this note, the new build was still:

```text
IN_QUEUE
```

## Current Voice Build Status

Working and build-safe:

- Expo development client is installed.
- Voice session API is wired.
- Voice WebSocket session is wired.
- Mock voice session events can be rendered.
- `react-native-audio-api` is installed for lower-level audio playback work.
- Local Expo module `sai-audio-stream` is implemented for microphone PCM chunk capture.
- Expo autolinking detects `sai-audio-stream` on Android.

Still pending real-device verification:

- Chunked ElevenLabs MP3 playback queue.
- Barge-in with native playback interruption.
- Android EAS build compile result for the local module.
- iOS EAS build compile result for the local module.

## Step 8: Implement Local PCM Mic Module

Because the Siteed packages were not build-safe on Expo SDK 54, a small local
Expo module was added instead:

```text
modules/sai-audio-stream
```

It exposes:

```ts
requestSaiAudioStreamPermissionsAsync()
startSaiAudioStreamAsync({ sampleRate, channels, chunkMs })
stopSaiAudioStreamAsync()
addAudioChunkListener(listener)
addAudioErrorListener(listener)
```

The module emits `audioChunk` events shaped for the backend voice WebSocket:

```json
{
  "base64": "pcm_s16le_base64",
  "sampleRate": 16000,
  "channels": 1,
  "chunkMs": 100,
  "sequence": 1,
  "timestamp": 1780000000000
}
```

The Ask Sai screen sends each chunk as:

```json
{
  "type": "audio_chunk",
  "encoding": "base64",
  "data": "pcm_s16le_base64",
  "turnId": "turn-..."
}
```

Important `.gitignore` note:

```text
/android/
/ios/
```

Use top-level-only ignores. Do not use broad `android/` or `ios/` rules,
because they hide `modules/sai-audio-stream/android` and
`modules/sai-audio-stream/ios` from Git and Expo doctor.

## Recommended Next Step

Do not use `@siteed/expo-audio-stream` on Expo SDK 54 until it publishes a compatible Android release.

Best production path:

1. Run Android EAS development build and confirm native module compilation.
2. Run iOS EAS development build and confirm native module compilation.
3. Test live mic capture on a physical Android device.
4. Test live mic capture on a physical iPhone.
5. Add chunked ElevenLabs MP3 playback queue.
6. Add barge-in with playback interruption.

This is safer than carrying patches against an incompatible third-party Android module.
