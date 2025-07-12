interface AudioConfig {
  enabled: boolean;
  volume: number; // 0.0 to 1.0
  upperBeadFrequency: number; // Hz
  lowerBeadFrequency: number; // Hz
  duration: number; // milliseconds
  answerFeedback: {
    enabled: boolean;
    volume: number; // 0.0 to 1.0
    correctSoundDuration: number; // milliseconds
    incorrectSoundDuration: number; // milliseconds
  };
}

const DEFAULT_CONFIG: AudioConfig = {
  enabled: true,
  volume: 0.3,
  upperBeadFrequency: 800, // Higher pitch for upper beads
  lowerBeadFrequency: 600, // Lower pitch for lower beads
  duration: 80, // Short, crisp click
  answerFeedback: {
    enabled: true,
    volume: 0.4, // Slightly louder for answer feedback
    correctSoundDuration: 400, // Happy melody duration
    incorrectSoundDuration: 350, // Sad sound duration
  },
};

class AudioFeedbackManager {
  private audioContext: AudioContext | null = null;
  private config: AudioConfig = DEFAULT_CONFIG;
  private isInitialized = false;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext(): void {
    try {
      // Create AudioContext only if supported
      if (typeof AudioContext !== 'undefined') {
        this.audioContext = new AudioContext();
        this.isInitialized = true;
      } else {
        // Try webkit prefix for older browsers
        const webkitAudioContext = (
          window as { webkitAudioContext?: new () => AudioContext }
        ).webkitAudioContext;
        if (webkitAudioContext) {
          this.audioContext = new webkitAudioContext();
          this.isInitialized = true;
        }
      }
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.isInitialized = false;
    }
  }

  private async ensureAudioContextResumed(): Promise<boolean> {
    if (!this.audioContext || !this.isInitialized) {
      return false;
    }

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return this.audioContext.state === 'running';
    } catch (error) {
      console.warn('Failed to resume audio context:', error);
      return false;
    }
  }

  private createMelodySound(
    frequencies: number[],
    noteDuration: number,
    volume: number,
  ): void {
    if (
      !this.audioContext ||
      !this.config.enabled ||
      !this.config.answerFeedback.enabled
    ) {
      return;
    }

    try {
      const currentTime = this.audioContext.currentTime;
      const noteLength = noteDuration / frequencies.length / 1000; // Divide duration among notes

      frequencies.forEach((frequency, index) => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();

        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        // Configure oscillator
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, currentTime);

        // Configure timing for each note
        const noteStartTime = currentTime + index * noteLength;
        const noteEndTime = noteStartTime + noteLength * 0.9; // Small gap between notes

        // Configure gain envelope
        gainNode.gain.setValueAtTime(0, noteStartTime);
        gainNode.gain.linearRampToValueAtTime(volume, noteStartTime + 0.02); // Quick attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, noteEndTime); // Decay

        // Start and stop oscillator
        oscillator.start(noteStartTime);
        oscillator.stop(noteEndTime);

        // Clean up nodes after they finish
        oscillator.addEventListener('ended', () => {
          oscillator.disconnect();
          gainNode.disconnect();
        });
      });
    } catch (error) {
      console.warn('Failed to create melody sound:', error);
    }
  }

  private createClickSound(frequency: number): void {
    if (!this.audioContext || !this.config.enabled) {
      return;
    }

    try {
      // Create oscillator for the click sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure oscillator
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime,
      );

      // Configure gain (volume envelope for click effect)
      const currentTime = this.audioContext.currentTime;
      const duration = this.config.duration / 1000; // Convert to seconds

      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(
        this.config.volume,
        currentTime + 0.005,
      ); // Quick attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + duration); // Quick decay

      // Start and stop oscillator
      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration);

      // Clean up nodes after they finish
      oscillator.addEventListener('ended', () => {
        oscillator.disconnect();
        gainNode.disconnect();
      });
    } catch (error) {
      console.warn('Failed to create click sound:', error);
    }
  }

  async playUpperBeadClick(): Promise<void> {
    const contextReady = await this.ensureAudioContextResumed();
    if (contextReady) {
      this.createClickSound(this.config.upperBeadFrequency);
    }
  }

  async playLowerBeadClick(): Promise<void> {
    const contextReady = await this.ensureAudioContextResumed();
    if (contextReady) {
      this.createClickSound(this.config.lowerBeadFrequency);
    }
  }

  async playCorrectAnswerSound(): Promise<void> {
    const contextReady = await this.ensureAudioContextResumed();
    if (contextReady) {
      // Happy ascending major chord: C4, E4, G4, C5
      const happyFrequencies = [261.63, 329.63, 392.0, 523.25];
      this.createMelodySound(
        happyFrequencies,
        this.config.answerFeedback.correctSoundDuration,
        this.config.answerFeedback.volume,
      );
    }
  }

  async playIncorrectAnswerSound(): Promise<void> {
    const contextReady = await this.ensureAudioContextResumed();
    if (contextReady) {
      // Sad descending minor sequence: A4, F4, D4
      const sadFrequencies = [440.0, 349.23, 293.66];
      this.createMelodySound(
        sadFrequencies,
        this.config.answerFeedback.incorrectSoundDuration,
        this.config.answerFeedback.volume,
      );
    }
  }

  setConfig(newConfig: Partial<AudioConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): AudioConfig {
    return { ...this.config };
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  isAudioSupported(): boolean {
    return this.isInitialized && this.audioContext !== null;
  }

  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.isInitialized = false;
    }
  }
}

// Singleton instance
const audioFeedbackManager = new AudioFeedbackManager();

// Exported functions for ease of use
export const playUpperBeadClick = () =>
  audioFeedbackManager.playUpperBeadClick();
export const playLowerBeadClick = () =>
  audioFeedbackManager.playLowerBeadClick();
export const playCorrectAnswerSound = () =>
  audioFeedbackManager.playCorrectAnswerSound();
export const playIncorrectAnswerSound = () =>
  audioFeedbackManager.playIncorrectAnswerSound();
export const setAudioEnabled = (enabled: boolean) =>
  audioFeedbackManager.setEnabled(enabled);
export const setAudioConfig = (config: Partial<AudioConfig>) =>
  audioFeedbackManager.setConfig(config);
export const getAudioConfig = () => audioFeedbackManager.getConfig();
export const isAudioSupported = () => audioFeedbackManager.isAudioSupported();

export default audioFeedbackManager;
export type { AudioConfig };
