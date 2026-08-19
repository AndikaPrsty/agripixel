import { Container } from "pixi.js";

/**
 * World container for gameplay entities.
 *
 * In PixiJS v8, `sortChildren()` sorts by `zIndex`, but the renderer only
 * re-sorts when `sortableChildren` is enabled AND a child's `zIndex` has
 * changed since the last sort. So we mirror `y -> zIndex` on every child
 * before invoking the sort each frame.
 */
export class World extends Container {
  constructor() {
    super({ sortableChildren: true });
  }

  /** Mirror y to zIndex, then re-sort. Call once per frame. */
  public sortByY(): void {
    for (const child of this.children) {
      child.zIndex = child.y;
    }
    this.sortChildren();
  }
}
