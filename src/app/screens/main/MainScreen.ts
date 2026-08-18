import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import type { Ticker } from "pixi.js";
import { Container } from "pixi.js";

import { engine } from "../../getEngine";
import { PausePopup } from "../../popups/PausePopup";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { Button } from "../../ui/Button";
import { CharacterController } from "./CharacterController";
import { NPC } from "./NPC";

/** The screen that holds the app */
export class MainScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main"];

  public mainContainer: Container;
  private pauseButton: FancyButton;
  private settingsButton: FancyButton;
  private debugButton: FancyButton;
  private character: CharacterController;
  private npcs: NPC[] = [];
  private paused = false;
  private debugMode = false;

  constructor() {
    super();

    // ponytail: sortableChildren = true is required for sortChildren() to actually
    // re-order the render. Without it, sortChildren mutates zIndex but the
    // renderer ignores it and keeps add-index order. Enable once at construction.
    this.mainContainer = new Container({ sortableChildren: true });
    this.addChild(this.mainContainer);
    this.character = new CharacterController();
    this.mainContainer.addChild(this.character);

    const npcConfigs = [
      { x: 100, y: 50, direction: "left" },
      { x: -80, y: -60, direction: "right" },
      { x: 120, y: -40, direction: "back" },
      { x: -100, y: 80, direction: "front" },
    ];

    for (let i = 0; i < npcConfigs.length; i++) {
      const npc = new NPC();
      this.npcs.push(npc);
      this.mainContainer.addChild(npc);
      this.character.addCollider(npc);
    }

    const buttonAnimations = {
      hover: {
        props: {
          scale: { x: 1.1, y: 1.1 },
        },
        duration: 100,
      },
      pressed: {
        props: {
          scale: { x: 0.9, y: 0.9 },
        },
        duration: 100,
      },
    };
    this.pauseButton = new FancyButton({
      defaultView: "icon-pause.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.pauseButton.onPress.connect(() =>
      engine().navigation.presentPopup(PausePopup),
    );
    this.addChild(this.pauseButton);

    this.settingsButton = new FancyButton({
      defaultView: "icon-settings.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.settingsButton.onPress.connect(() =>
      engine().navigation.presentPopup(SettingsPopup),
    );
    this.addChild(this.settingsButton);

    this.debugButton = new Button({
      text: "Debug: OFF",
      fontSize: 16,
      width: 120,
      height: 50,
    });
    this.debugButton.onPress.connect(() => this.toggleDebugMode());
    this.addChild(this.debugButton);
  }

  /** Prepare the screen just before showing */
  public prepare() {}

  /** Update the screen */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(_time: Ticker) {
    if (this.paused) return;
    this.character.update();
    this.sortEntitiesByDepth();
  }

  private sortEntitiesByDepth() {
    // ponytail: PixiJS v8 sortChildren() takes no args — it sorts by zIndex only.
    // So we copy y -> zIndex each frame on every child. sortableChildren + the
    // zIndex setter auto-flag sortDirty, so the renderer re-sorts on next render.
    for (const child of this.mainContainer.children) {
      child.zIndex = child.y;
    }
  }

  private toggleDebugMode() {
    this.debugMode = !this.debugMode;
    this.character.setDebugMode(this.debugMode);
    for (const npc of this.npcs) {
      npc.setDebugMode(this.debugMode);
    }
    this.debugButton.text = this.debugMode ? "Debug: ON" : "Debug: OFF";
  }

  /** Pause gameplay - automatically fired when a popup is presented */
  public async pause() {
    this.mainContainer.interactiveChildren = false;
    this.paused = true;
  }

  /** Resume gameplay */
  public async resume() {
    this.mainContainer.interactiveChildren = true;
    this.paused = false;
  }

  /** Fully reset */
  public reset() {}

  /** Resize the screen, fired whenever window size changes */
  public resize(width: number, height: number) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.mainContainer.x = centerX;
    this.mainContainer.y = centerY;
    this.pauseButton.x = 30;
    this.pauseButton.y = 30;
    this.settingsButton.x = width - 30;
    this.settingsButton.y = 30;
    this.debugButton.x = width / 2;
    this.debugButton.y = 30;

    this.character.x = 0;
    this.character.y = 0;

    const npcConfigs = [
      { x: 100, y: 50 },
      { x: -80, y: -60 },
      { x: 120, y: -40 },
      { x: -100, y: 80 },
    ];

    for (let i = 0; i < this.npcs.length; i++) {
      this.npcs[i].x = npcConfigs[i].x;
      this.npcs[i].y = npcConfigs[i].y;
    }
  }

  /** Show screen with animations */
  public async show(): Promise<void> {
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });

    await this.character.init();

    const npcDirections = ["left", "right", "back", "front"];
    for (let i = 0; i < this.npcs.length; i++) {
      await this.npcs[i].init();
      this.npcs[i].setDirection(npcDirections[i]);
    }

    const elementsToAnimate = [this.pauseButton, this.settingsButton];

    let finalPromise!: AnimationPlaybackControls;
    for (const element of elementsToAnimate) {
      element.alpha = 0;
      finalPromise = animate(
        element,
        { alpha: 1 },
        { duration: 0.3, delay: 0.75, ease: "backOut" },
      );
    }

    await finalPromise;
  }

  /** Hide screen with animations */
  public async hide() {}

  /** Auto pause the app when window go out of focus */
  public blur() {
    if (!engine().navigation.currentPopup) {
      engine().navigation.presentPopup(PausePopup);
    }
  }
}
