import { AnimatedSprite, Container, Assets, Texture, Graphics } from "pixi.js";

export class NPC extends Container {
  private sprite!: AnimatedSprite;
  private animations: Record<string, Texture[]> = {};
  private direction = "front";
  private debugGraphics: Graphics;
  private collisionRadius = 12;
  private showDebug = false;

  constructor() {
    super();

    this.debugGraphics = new Graphics();
    this.addChild(this.debugGraphics);
  }

  public async init() {
    const sheet = await Assets.load("main/characters/main/main.json");

    this.animations = {
      idle_front: sheet.animations.idle,
      idle_right: sheet.animations.idle_right,
      idle_back: sheet.animations.idle_back,
      idle_left: sheet.animations.idle_left,
    };

    this.sprite = new AnimatedSprite(this.animations.idle_front, true);
    this.sprite.anchor.set(0.5);
    this.sprite.animationSpeed = 0.15;
    this.sprite.play();

    this.addChild(this.sprite);
    this.drawDebug();
  }

  private drawDebug() {
    if (!this.showDebug) return;

    this.debugGraphics.clear();
    this.debugGraphics.circle(0, 0, this.collisionRadius);
    this.debugGraphics.stroke({ width: 2, color: 0xff0000 });
  }

  public setDebugMode(enabled: boolean) {
    this.showDebug = enabled;
    this.debugGraphics.clear();
  }

  public setDirection(direction: string) {
    this.direction = direction;
    const animKey = `idle_${direction}`;

    if (this.animations[animKey]) {
      this.sprite.textures = this.animations[animKey];
      this.sprite.play();
    }
  }
}
