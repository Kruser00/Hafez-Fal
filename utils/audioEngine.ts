class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientNodes: AudioNode[] = [];
  private ambientGain: GainNode | null = null; // Dedicated channel for ambient drone
  
  // Breath FX Nodes
  private breathSource: AudioBufferSourceNode | null = null;
  private breathGain: GainNode | null = null;
  private breathFilter: BiquadFilterNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private readonly BASE_AMBIENT_VOL = 0.15;

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
    this.initNoiseBuffer();
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

  /**
   * Triggers haptic feedback on supported devices
   */
  triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'failure' | 'tick') {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        switch (type) {
          case 'tick':
            navigator.vibrate(5); // Very sharp tick
            break;
          case 'light':
            navigator.vibrate(10); // Subtle tick
            break;
          case 'medium':
            navigator.vibrate(40); // Standard tap
            break;
          case 'heavy':
            navigator.vibrate(70); // Firm click
            break;
          case 'success':
            navigator.vibrate([50, 50, 150]); // Da-da-DA pattern
            break;
          case 'failure':
            navigator.vibrate([100, 50, 100]); // Buzz-buzz
            break;
        }
      } catch (e) {
        // Haptics not supported or restricted
      }
    }
  }

  private initNoiseBuffer() {
    if (!this.ctx || this.noiseBuffer) return;
    
    // Create a 2-second stereo buffer of white noise
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
        // Generate white noise: random values between -1.0 and 1.0
        // We multiply by 0.5 to keep raw levels reasonable
        left[i] = (Math.random() * 2 - 1) * 0.5;
        right[i] = (Math.random() * 2 - 1) * 0.5;
    }
    this.noiseBuffer = buffer;
  }

  private startAmbient() {
    if (!this.ctx || this.ambientNodes.length > 0) return;

    // Create a dedicated gain node for the ambient loop so we can fade it separately from SFX
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0; // Start silent for fade-in
    this.ambientGain.connect(this.masterGain!);

    // Create a mystical drone using two oscillators
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();
    const gain = this.ctx.createGain(); // Mix gain for the oscillators
    
    // Frequencies for a suspended chord (D2, A2, E3)
    osc1.frequency.value = 73.42; // D2
    osc2.frequency.value = 110.00; // A2
    osc3.frequency.value = 164.81; // E3
    
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc3.type = 'sine';

    // Internal mix volume
    gain.gain.value = 1.0; 
    
    // Low Frequency Oscillator (LFO) to modulate volume slightly for "breathing" effect
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.05; // Very slow cycle (20s)
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.15; // Depth of modulation
    
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    
    osc1.connect(gain);
    osc2.connect(gain);
    osc3.connect(gain);
    
    // Connect the mix to the ambient channel
    gain.connect(this.ambientGain);

    osc1.start();
    osc2.start();
    osc3.start();
    lfo.start();

    // Store nodes to prevent garbage collection or for cleanup
    this.ambientNodes = [osc1, osc2, osc3, lfo, gain, lfoGain];

    // Initial Fade In
    this.fadeAmbientIn(3);
  }

  /**
   * Fades the ambient drone volume down (ducking)
   */
  fadeAmbientOut(duration: number = 2) {
    if (!this.ctx || !this.ambientGain) return;
    const now = this.ctx.currentTime;
    this.ambientGain.gain.cancelScheduledValues(now);
    this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
    // Fade to a very low hum (0.02) instead of complete silence to keep the atmosphere
    this.ambientGain.gain.linearRampToValueAtTime(0.02, now + duration);
  }

  /**
   * Fades the ambient drone volume back up
   */
  fadeAmbientIn(duration: number = 2) {
    if (!this.ctx || !this.ambientGain) return;
    const now = this.ctx.currentTime;
    this.ambientGain.gain.cancelScheduledValues(now);
    this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
    this.ambientGain.gain.linearRampToValueAtTime(this.BASE_AMBIENT_VOL, now + duration);
  }

  playClick() {
    this.triggerHaptic('light'); // Feedback
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
   * Starts the ASMR "Inhale" effect for the ritual
   */
  startBreath() {
    if (!this.ctx) return;
    if (this.breathSource) return; // Already playing

    // Ensure buffer exists
    if (!this.noiseBuffer) this.initNoiseBuffer();
    if (!this.noiseBuffer) return;

    const t = this.ctx.currentTime;
    const duration = 3.0; // Standard charge duration

    // 1. Create Source (Stereo Noise Loop)
    this.breathSource = this.ctx.createBufferSource();
    this.breathSource.buffer = this.noiseBuffer;
    this.breathSource.loop = true;

    // 2. Create Filter (LowPass) - simulates the mouth/throat opening
    // Starts muffled, opens up to be airy
    this.breathFilter = this.ctx.createBiquadFilter();
    this.breathFilter.type = 'lowpass';
    this.breathFilter.Q.value = 0.6; // Subtle resonance
    this.breathFilter.frequency.setValueAtTime(150, t); // Start very muffled
    this.breathFilter.frequency.exponentialRampToValueAtTime(3500, t + duration); // Open up to "air"

    // 3. Create Gain - simulates lung capacity/intensity
    this.breathGain = this.ctx.createGain();
    this.breathGain.gain.setValueAtTime(0, t);
    this.breathGain.gain.linearRampToValueAtTime(1.0, t + duration); 
    
    // Connect Chain: Source -> Filter -> Gain -> Master
    this.breathSource.connect(this.breathFilter);
    this.breathFilter.connect(this.breathGain);
    this.breathGain.connect(this.masterGain!);
    
    this.breathSource.start(t);
  }

  /**
   * Stops the breath sound.
   * If completed = true, triggers a gentle "Exhale" fade out.
   * If completed = false, triggers a quick stop (interrupted).
   */
  stopBreath(completed: boolean = false) {
    if (this.breathSource && this.breathGain && this.breathFilter && this.ctx) {
       const t = this.ctx.currentTime;
       
       // Cancel any ongoing ramps
       this.breathGain.gain.cancelScheduledValues(t);
       this.breathFilter.frequency.cancelScheduledValues(t);

       // Lock values at current time to prevent jumps
       this.breathGain.gain.setValueAtTime(this.breathGain.gain.value, t);
       this.breathFilter.frequency.setValueAtTime(this.breathFilter.frequency.value, t);

       if (completed) {
         // Exhale / Release
         this.breathFilter.frequency.exponentialRampToValueAtTime(100, t + 2.0);
         this.breathGain.gain.linearRampToValueAtTime(0, t + 2.0);
         this.breathSource.stop(t + 2.0);
         this.triggerHaptic('success');
       } else {
         // Interrupted - quick fade
         this.breathGain.gain.linearRampToValueAtTime(0, t + 0.2);
         this.breathSource.stop(t + 0.2);
         this.triggerHaptic('failure');
       }
    }
    this.breathSource = null;
    this.breathGain = null;
    this.breathFilter = null;
  }

  playCompletion() {
    this.triggerHaptic('success');
    if (!this.ctx) return;
    
    const t = this.ctx.currentTime;
    
    // Bell/Chime sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, t); // C5
    // Add subtle harmonics
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, t); // C6
    const gain2 = this.ctx.createGain();
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 3.0);
    
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.1, t + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
    
    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(this.masterGain!);
    gain2.connect(this.masterGain!);
    
    osc.start(t);
    osc2.start(t);
    osc.stop(t + 3.5);
    osc2.stop(t + 3.5);
  }

  playReveal() {
    this.triggerHaptic('medium');
    if (!this.ctx) return;
    
    const t = this.ctx.currentTime;
    // Mystical swell
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, t); // A2
    osc.frequency.linearRampToValueAtTime(220, t + 2); // Slide up to A3
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 1.5);
    gain.gain.linearRampToValueAtTime(0, t + 4);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.start(t);
    osc.stop(t + 4);
  }
}

export const audioEngine = new AudioEngine();