export type KeyState = {
  key: string;
  cooldownUntil: number;
  disabled: boolean;
};

export class KeyPool {
  private keys: KeyState[];
  private next = 0;

  constructor(raw: string) {
    this.keys = raw
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)
      .map((key) => ({ key, cooldownUntil: 0, disabled: false }));
  }

  get size(): number {
    return this.keys.length;
  }

  available(): number {
    const now = Date.now();
    return this.keys.filter((k) => !k.disabled && k.cooldownUntil <= now).length;
  }

  acquire(): KeyState | null {
    const now = Date.now();
    for (let i = 0; i < this.keys.length; i++) {
      const idx = (this.next + i) % this.keys.length;
      const k = this.keys[idx];
      if (k.disabled || k.cooldownUntil > now) continue;
      this.next = (idx + 1) % this.keys.length;
      return k;
    }
    return null;
  }

  cooldown(k: KeyState, seconds: number): void {
    k.cooldownUntil = Date.now() + seconds * 1000;
  }

  disable(k: KeyState): void {
    k.disabled = true;
  }

  secondsUntilFree(): number {
    const waits = this.keys
      .filter((k) => !k.disabled)
      .map((k) => k.cooldownUntil - Date.now());
    if (waits.length === 0) return 0;
    return Math.max(1, Math.ceil(Math.min(...waits) / 1000));
  }

  label(k: KeyState): string {
    return `...${k.key.slice(-4)}`;
  }
}

let pool: KeyPool | null = null;

export function getPool(): KeyPool {
  if (!pool) pool = new KeyPool(process.env.AI_API_KEYS ?? "");
  return pool;
}