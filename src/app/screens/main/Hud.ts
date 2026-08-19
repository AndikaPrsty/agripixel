import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import { Container } from "pixi.js";

import { engine } from "../../getEngine";
import { PausePopup } from "../../popups/PausePopup";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { Button } from "../../ui/Button";

const ICON_BUTTON_ANIMATIONS = {
  hover: { props: { scale: { x: 1.1, y: 1.1 } }, duration: 100 },
  pressed: { props: { scale: { x: 0.9, y: 0.9 } }, duration: 100 },
} as const;

const HUD_PADDING = 30;
const DEBUG_LABEL_OFF = "Debug: OFF";
const DEBUG_LABEL_ON = "Debug: ON";

/**
 * Top-of-screen UI chrome. Pause top-left, settings top-right,
 * debug toggle centered. Owns its own layout so the host screen
 * only needs to call `resize(width, height)`.
 */
export class Hud extends Container {
  private readonly pauseButton = new FancyButton({
    defaultView: "icon-pause.png",
    anchor: 0.5,
    animations: ICON_BUTTON_ANIMATIONS,
  });
  private readonly settingsButton = new FancyButton({
    defaultView: "icon-settings.png",
    anchor: 0.5,
    animations: ICON_BUTTON_ANIMATIONS,
  });
  private readonly debugButton = new Button({
    text: DEBUG_LABEL_OFF,
    fontSize: 16,
    width: 120,
    height: 50,
  });

  private debugOn = false;

  constructor(private readonly onDebugChange: (enabled: boolean) => void) {
    super();

    this.pauseButton.onPress.connect(() =>
      engine().navigation.presentPopup(PausePopup),
    );
    this.settingsButton.onPress.connect(() =>
      engine().navigation.presentPopup(SettingsPopup),
    );
    this.debugButton.onPress.connect(() => this.toggleDebug());

    this.addChild(this.pauseButton, this.settingsButton, this.debugButton);
  }

  public async show(): Promise<void> {
    const animated = [this.pauseButton, this.settingsButton].map((element) => {
      element.alpha = 0;
      return animate(
        element,
        { alpha: 1 },
        { duration: 0.3, delay: 0.75, ease: "backOut" },
      );
    });
    await Promise.all(animated);
  }

  public resize(width: number): void {
    this.pauseButton.x = HUD_PADDING;
    this.pauseButton.y = HUD_PADDING;
    this.settingsButton.x = width - HUD_PADDING;
    this.settingsButton.y = HUD_PADDING;
    this.debugButton.x = width * 0.5;
    this.debugButton.y = HUD_PADDING;
  }

  private toggleDebug(): void {
    this.debugOn = !this.debugOn;
    this.debugButton.text = this.debugOn ? DEBUG_LABEL_ON : DEBUG_LABEL_OFF;
    this.onDebugChange(this.debugOn);
  }
}
