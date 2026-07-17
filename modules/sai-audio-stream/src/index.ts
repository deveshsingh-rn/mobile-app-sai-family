import { requireOptionalNativeModule } from "expo-modules-core";

export type SaiAudioStreamChunkEvent = {
  channels: number;
  data: string;
  encoding: "base64";
  sampleRate: number;
  sequence: number;
  timestamp: number;
};

export type SaiAudioStreamErrorEvent = {
  code: string;
  message: string;
};

export type SaiAudioStreamStartOptions = {
  chunkMs?: number;
  sampleRate?: number;
};

type SaiAudioStreamNativeModule = {
  addListener: (
    eventName: "audioChunk" | "audioError",
    listener: (event: any) => void
  ) => { remove: () => void };
  getStatusAsync: () => Promise<{ isRecording: boolean }>;
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
  startAsync: (options?: SaiAudioStreamStartOptions) => Promise<{ started: boolean }>;
  stopAsync: () => Promise<{ stopped: boolean }>;
};

const SaiAudioStreamModule =
  requireOptionalNativeModule<SaiAudioStreamNativeModule>("SaiAudioStream");

function getSaiAudioStreamModule() {
  if (!SaiAudioStreamModule) {
    throw new Error(
      "SaiAudioStream native module is unavailable. Install a fresh development build that includes modules/sai-audio-stream."
    );
  }

  return SaiAudioStreamModule;
}

export function isSaiAudioStreamAvailable() {
  return Boolean(SaiAudioStreamModule);
}

export function addAudioChunkListener(
  listener: (event: SaiAudioStreamChunkEvent) => void
) {
  return getSaiAudioStreamModule().addListener("audioChunk", listener);
}

export function addAudioErrorListener(
  listener: (event: SaiAudioStreamErrorEvent) => void
) {
  return getSaiAudioStreamModule().addListener("audioError", listener);
}

export function getSaiAudioStreamStatusAsync() {
  return getSaiAudioStreamModule().getStatusAsync();
}

export function requestSaiAudioStreamPermissionsAsync() {
  return getSaiAudioStreamModule().requestPermissionsAsync();
}

export function startSaiAudioStreamAsync(
  options?: SaiAudioStreamStartOptions
) {
  return getSaiAudioStreamModule().startAsync(options);
}

export function stopSaiAudioStreamAsync() {
  return getSaiAudioStreamModule().stopAsync();
}
