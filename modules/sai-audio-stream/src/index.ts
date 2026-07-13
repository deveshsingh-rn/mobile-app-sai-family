import { requireNativeModule } from "expo-modules-core";

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
  requireNativeModule<SaiAudioStreamNativeModule>("SaiAudioStream");

export function addAudioChunkListener(
  listener: (event: SaiAudioStreamChunkEvent) => void
) {
  return SaiAudioStreamModule.addListener("audioChunk", listener);
}

export function addAudioErrorListener(
  listener: (event: SaiAudioStreamErrorEvent) => void
) {
  return SaiAudioStreamModule.addListener("audioError", listener);
}

export function getSaiAudioStreamStatusAsync() {
  return SaiAudioStreamModule.getStatusAsync();
}

export function requestSaiAudioStreamPermissionsAsync() {
  return SaiAudioStreamModule.requestPermissionsAsync();
}

export function startSaiAudioStreamAsync(
  options?: SaiAudioStreamStartOptions
) {
  return SaiAudioStreamModule.startAsync(options);
}

export function stopSaiAudioStreamAsync() {
  return SaiAudioStreamModule.stopAsync();
}
