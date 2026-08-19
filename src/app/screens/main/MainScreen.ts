import type { Ticker } from "pixi.js";
import { Container } from "pixi.js";

import { engine } from "../../getEngine";
import { PausePopup } from "../../popups/PausePopup";
import { CharacterController } from "./CharacterController";
import type { Debug } from "./Debug";
import { Hud } from "./Hud";
import { NpcsManager } from "./NpcsManager";
import { World } from "./World";

/** The screen that holds the app */
export class MainScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main"];

  public readonly world = new World();
  private readonly character: CharacterController;
  private readonly npcs: NpcsManager;
  private readonly hud: Hud;

  private readonly debugables: Debug[] = [];
  private paused = false;

  constructor() {
    super();

    this.character = new CharacterController();
    this.npcs = new NpcsManager(this.character);
    this.hud = new Hud((enabled) => this.setDebugMode(enabled));

    this.world.addChild(this.character, this.npcs);
    this.addChild(this.world, this.hud);

    this.debugables.push(this.character, this.npcs);
  }

  /** Prepare the screen just before showing */
  public prepare() {}

  /** Update the screen */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(_time: Ticker) {
    if (this.paused) return;
    this.character.update();
    this.world.sortByY();
  }

  private setDebugMode(enabled: boolean): void {
    for (const target of this.debugables) target.setDebugMode(enabled);
  }

  /** Pause gameplay - automatically fired when a popup is presented */
  public async pause() {
    this.world.interactiveChildren = false;
    this.paused = true;
  }

  /** Resume gameplay */
  public async resume() {
    this.world.interactiveChildren = true;
    this.paused = false;
  }

  /** Fully reset */
  public reset() {}

  /** Resize the screen, fired whenever window size changes */
  public resize(width: number, height: number) {
    this.world.x = width * 0.5;
    this.world.y = height * 0.5;
    this.character.x = 0;
    this.character.y = 0;

    this.npcs.resetPositions();
    this.hud.resize(width);
  }

  /** Show screen with animations */
  public async show(): Promise<void> {
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });

    await Promise.all([
      this.character.init(),
      this.npcs.init(),
      this.hud.show(),
    ]);
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
