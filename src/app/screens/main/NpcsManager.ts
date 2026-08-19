import { Container } from "pixi.js";

import type { CharacterController } from "./CharacterController";
import type { Debug } from "./Debug";
import { NPC } from "./NPC";

interface NpcSpawn {
  x: number;
  y: number;
  direction: "left" | "right" | "back" | "front";
}

const NPC_SPAWNS: readonly NpcSpawn[] = [
  { x: 100, y: 50, direction: "left" },
  { x: -80, y: -60, direction: "right" },
  { x: 120, y: -40, direction: "back" },
  { x: -100, y: 80, direction: "front" },
];

/**
 * Owns the NPC population, their spawn layout, and their debug toggle.
 * Lives as a child of the world container so the depth-sort sees them.
 */
export class NpcsManager extends Container implements Debug {
  private readonly npcs: NPC[] = [];

  constructor(private readonly character: CharacterController) {
    super();

    for (let i = 0; i < NPC_SPAWNS.length; i++) {
      const npc = new NPC();
      this.npcs.push(npc);
      this.addChild(npc);
      this.character.addCollider(npc);
    }
  }

  public async init(): Promise<void> {
    await Promise.all(
      this.npcs.map((npc, i) => {
        const spawn = NPC_SPAWNS[i];
        if (!spawn) return npc.init();
        return npc.init().then(() => npc.setDirection(spawn.direction));
      }),
    );
  }

  /** Re-apply the canonical spawn positions. Safe to call from resize(). */
  public resetPositions(): void {
    for (let i = 0; i < this.npcs.length; i++) {
      const spawn = NPC_SPAWNS[i];
      if (!spawn) continue;
      this.npcs[i].x = spawn.x;
      this.npcs[i].y = spawn.y;
    }
  }

  public setDebugMode(enabled: boolean): void {
    for (const npc of this.npcs) npc.setDebugMode(enabled);
  }
}
