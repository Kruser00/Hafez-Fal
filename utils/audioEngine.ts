class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientNodes: AudioNode[] = [];
  private breathOsc: OscillatorNode | null = null;
  private breathGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Initialize safely for SSR/Non-browser environments
    if (typeof window !== 'undefined') {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.4; // Default volume
      }
    }
  }

  /**
   * Resume AudioContext (must be called after user gesture)
   */
  async init() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.startAmbient();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      // Smooth fade out/in
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : 0.4,
        this.ctx.currentTime,
        0.1
      );
    }
    return this.isMuted;
  }

  private startAmbient() {
    if (!this.ctx || this.ambientNodes.length > 0) return;

    // Create a mystical drone using two oscillators
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Frequencies for a suspended chord (D2, A2, E3)
    osc1.frequency.value = 73.42; // D2
    osc2.frequency.value = 110.00; // A2
    osc3.frequency.value = 164.81; // E3
    
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc3.type = 'sine';

    // Low volume for background
    gain.gain.value = 0.15;
    
    // Low Frequency Oscillator (LFO) to modulate volume slightly for "breathing" effect
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.05; // Very slow cycle (20s)
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.05;
    
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    
    osc1.connect(gain);
    osc2.connect(gain);
    osc3.connect(gain);
    gain.connect(this.masterGain!);

    osc1.start();
    osc2.start();
    osc3.start();
    lfo.start();

    this.ambientNodes = [osc1, osc2, osc3, lfo, gain, lfoGain];
  }

  playClick() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // High pitched short ping
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }
  
  /**
   * Starts the rising tension sound for the breath ritual
   */
  startBreath() {
    if (!this.ctx) return;
    if (this.breathOsc) return; // Already playing

    this.breathOsc = this.ctx.createOscillator();
    this.breathGain = this.ctx.createGain();
    
    this.breathOsc.type = 'sine';
    // Start at A2 (110Hz)
    this.breathOsc.frequency.setValueAtTime(110, this.ctx.currentTime);
    // Ramp to A4 (440Hz) over 3 seconds
    this.breathOsc.frequency.linearRampToValueAtTime(440, this.ctx.currentTime + 3); 
    
    // Ramp volume up
    this.breathGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.breathGain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 3); 
    
    this.breathOsc.connect(this.breathGain);
    this.breathGain.connect(this.masterGain!);
    
    this.breathOsc.start();
  }

  /**
   * Stops the breath sound (abruptly or smooth release)
   */
  stopBreath(completed: boolean = false) {
    if (this.breathOsc && this.breathGain && this.ctx) {
       const now = this.ctx.currentTime;
       
       // If completed, let it ring out slightly or just stop for the chime
       // If interrupted, fade out quickly
       const release = completed ? 0.1 : 0.5;

       this.breathGain.gain.cancelScheduledValues(now);
       this.breathGain.gain.setValueAtTime(this.breathGain.gain.value, now);
       this.breathGain.gain.linearRampToValueAtTime(0, now + release);
       
       this.breathOsc.stop(now + release);
       this.breathOsc = null;
       this.breathGain = null;
    }
  }

  playCompletion() {
      if (!this.ctx) return;
      // Bright chime (C5)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); 
      
      // Bell envelope
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.05); // Attack
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3); // Decay
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start();
      osc.stop(this.ctx.currentTime + 3);
  }

  playReveal() {
      if (!this.ctx) return;
      // Major chord swell (D Major: D3, F#3, A3)
      const frequencies = [146.83, 185.00, 220.00]; 
      frequencies.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = i === 1 ? 'triangle' : 'sine'; // Add some texture with triangle wave
          osc.frequency.value = freq;
          
          gain.gain.setValueAtTime(0, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 2); // Slow attack (2s)
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 8); // Long release
          
          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start();
          osc.stop(this.ctx.currentTime + 8);
      });
  }
}

export const audioEngine = new AudioEngine();
