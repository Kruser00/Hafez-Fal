export enum AppStage {
  SPLASH = 'SPLASH',
  INTENT = 'INTENT',
  BREATH = 'BREATH',
  SCROLL = 'SCROLL',
  REVEAL = 'REVEAL',
}

export interface Poem {
  id: number;
  persian: string[]; // Array of lines (couplets)
  english: string[]; // Translation
  theme: string;
}

export interface InterpretationResponse {
  interpretation: string;
  reflection: string;
}

export type ContextOption = 'Love' | 'Career' | 'Grief' | 'Guidance' | 'Spirituality' | 'Uncertainty';
