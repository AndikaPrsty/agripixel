import { AnimatedSprite, Container, Assets, Texture, Graphics } from "pixi.js";

import type { Debug } from "./Debug";

export class CharacterController extends Container implements Debug {
  private sprite!: AnimatedSprite;
  private keys: Record<string, boolean> = {};
  private speed = 3;
  private currentDirection = "front";
  private isMoving = false;
  private animations: Record<string, Texture[]> = {};
  private colliders: Container[] = [];
  private collisionRadius = 12;
  private debugGraphics: Graphics;
  private showDebug = false;

  constructor() {
    super();

    this.debugGraphics = new Graphics();
    this.addChild(this.debugGraphics);

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  public addCollider(collider: Container) {
    this.colliders.push(collider);
  }

  public setDebugMode(enabled: boolean): void {
    this.showDebug = enabled;
    this.debugGraphics.clear();
  }

  public async init() {
    // Load the sprite sheet
    const sheet = await Assets.load("main/characters/main/main.json");

    // Store all animations
    this.animations = {
      idle_front: sheet.animations.idle,
      idle_right: sheet.animations.idle_right,
      idle_back: sheet.animations.idle_back,
      idle_left: sheet.animations.idle_left,
      walk_front: sheet.animations.walk,
      walk_right: sheet.animations.walk_right,
      walk_back: sheet.animations.walk_back,
      walk_left: sheet.animations.walk_left,
    };

    // Create animated sprite with idle_front as default
    this.sprite = new AnimatedSprite(this.animations.idle_front, true);
    this.sprite.anchor.set(0.5);
    this.sprite.animationSpeed = 0.15;
    this.sprite.play();

    this.addChild(this.sprite);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys[e.key] = true;
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key] = false;
  };

  public update() {
    let dx = 0;
    let dy = 0;
    let newDirection = this.currentDirection;

    if (this.keys["ArrowUp"]) {
      dy -= 1;
      newDirection = "back";
    }
    if (this.keys["ArrowDown"]) {
      dy += 1;
      newDirection = "front";
    }
    if (this.keys["ArrowLeft"]) {
      dx -= 1;
      newDirection = "left";
    }
    if (this.keys["ArrowRight"]) {
      dx += 1;
      newDirection = "right";
    }

    // Normalize diagonal movement so speed stays constant
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    dx *= this.speed;
    dy *= this.speed;

    const newX = this.x + dx;
    const newY = this.y + dy;

    if (!this.checkCollision(newX, this.y)) {
      this.x = newX;
    }
    if (!this.checkCollision(this.x, newY)) {
      this.y = newY;
    }

    const wasMoving = this.isMoving;
    this.isMoving = dx !== 0 || dy !== 0;

    if (newDirection !== this.currentDirection || this.isMoving !== wasMoving) {
      this.currentDirection = newDirection;
      this.updateAnimation();
    }

    this.drawDebug();
  }

  private drawDebug() {
    if (!this.showDebug) return;

    this.debugGraphics.clear();
    this.debugGraphics.circle(0, 0, this.collisionRadius);
    this.debugGraphics.stroke({ width: 2, color: 0xff0000 });

    for (const collider of this.colliders) {
      const dx = collider.x - this.x;
      const dy = collider.y - this.y;
      this.debugGraphics.circle(dx, dy, this.collisionRadius);
      this.debugGraphics.stroke({ width: 2, color: 0xff0000 });
    }
  }

  private checkCollision(x: number, y: number): boolean {
    for (const collider of this.colliders) {
      const dx = x - collider.x;
      const dy = y - collider.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.collisionRadius * 2) {
        return true;
      }
    }
    return false;
  }

  private updateAnimation() {
    const state = this.isMoving ? "walk" : "idle";
    const animKey = `${state}_${this.currentDirection}`;

    if (this.animations[animKey]) {
      this.sprite.textures = this.animations[animKey];
      this.sprite.play();
    }
  }

  public destroy(
    options?:
      | boolean
      | { children?: boolean; texture?: boolean; baseTexture?: boolean },
  ) {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    super.destroy(options);
  }
}
