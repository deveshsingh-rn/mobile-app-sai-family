export type VoiceAudioSegment = {
  turnId: string;
  index: number;
  data: string;
};

type QueueOptions = {
  play: (segment: VoiceAudioSegment, signal: AbortSignal, onStarted: () => void) => Promise<void>;
  onStarted: (segment: VoiceAudioSegment) => void;
  onWaiting: () => void;
  onComplete: () => void;
  onError: (error: unknown) => void;
};

export class VoiceSegmentQueue {
  readonly turnId: string;
  private readonly options: QueueOptions;
  private readonly controller = new AbortController();
  private chain = Promise.resolve();
  private received = 0;
  private pending = 0;
  private ended = false;
  private completed = false;

  constructor(turnId: string, options: QueueOptions) {
    this.turnId = turnId;
    this.options = options;
  }

  enqueue(segment: VoiceAudioSegment) {
    if (this.controller.signal.aborted || segment.turnId !== this.turnId) return;
    if (Number.isInteger(segment.index) && segment.index >= 0 && segment.index < this.received) return;
    if (this.ended || segment.index !== this.received || !segment.data || segment.data.length > 2_700_000 || this.received >= 16) {
      this.fail(new Error("Voice audio arrived out of order or exceeded its limit."));
      return;
    }
    this.received++;
    this.pending++;
    this.chain = this.chain.then(async () => {
      if (this.controller.signal.aborted) return;
      await this.options.play(segment, this.controller.signal, () => {
        if (!this.controller.signal.aborted) this.options.onStarted(segment);
      });
      if (this.controller.signal.aborted) return;
      this.pending--;
      if (!this.pending && !this.ended) this.options.onWaiting();
      this.completeIfDrained();
    }).catch((error: unknown) => this.fail(error));
  }

  finish(expectedSegments?: number) {
    if (this.controller.signal.aborted) return;
    if (!this.received || (expectedSegments !== undefined && expectedSegments !== this.received)) {
      this.fail(new Error("The voice reply ended before all audio arrived."));
      return;
    }
    this.ended = true;
    this.completeIfDrained();
  }

  stop() {
    this.controller.abort();
  }

  private completeIfDrained() {
    if (this.ended && !this.pending && !this.completed && !this.controller.signal.aborted) {
      this.completed = true;
      this.options.onComplete();
    }
  }

  private fail(error: unknown) {
    if (this.controller.signal.aborted) return;
    this.stop();
    this.options.onError(error);
  }
}
