declare function route(name: string, params?: Record<string, unknown> | unknown): string;
declare function route(): { current: (name: string) => boolean };

interface ImportMeta {
  readonly env: Record<string, string>;
  glob<T = Record<string, unknown>>(
    pattern: string,
    options?: { eager?: boolean },
  ): Record<string, () => Promise<T>>;
}
