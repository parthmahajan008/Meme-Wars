export class CountdownTimer {
  private duration: number;
  private interval: NodeJS.Timeout | undefined;
  private callback: () => void;
  private stopped: boolean = false;

  constructor(duration: number, callback: () => void) {
    this.duration = duration;
    this.callback = callback;
  }

  private formatTime(timeInSeconds: number): string {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  start() {
    this.interval = setInterval(() => {
      this.duration--;

      if (this.duration <= 0) {
        this.stop();
        this.callback();
      }
    }, 1000); // Update every 1000 milliseconds (1 second)
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
      this.stopped = true;
    }
  }

  getRemainingTime(): string {
    return this.formatTime(this.duration);
  }

  hasStopped(): boolean {
    return this.stopped;
  }
}
