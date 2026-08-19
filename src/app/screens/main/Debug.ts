/**
 * Anything that can be toggled into a diagnostic / debug rendering mode.
 * Kept tiny on purpose so additional entity types can adopt it without
 * pulling in the gameplay base class.
 */
export interface Debug {
  setDebugMode(enabled: boolean): void;
}
