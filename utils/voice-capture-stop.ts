// A second native stop can deactivate the iOS session after reply playback starts.
export function createVoiceCaptureStop(stopNative: () => Promise<unknown>) {
  let stopped: Promise<void> | undefined;
  return () => {
    stopped ??= Promise.resolve().then(stopNative).then(() => undefined);
    return stopped;
  };
}
