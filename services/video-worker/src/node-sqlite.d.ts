declare module "node:sqlite" {
  export interface RunResult {
    changes: number | bigint;
    lastInsertRowid: number | bigint;
  }

  export interface StatementSync {
    run(...params: Array<string | number | bigint | Uint8Array | null>): RunResult;
    get(...params: Array<string | number | bigint | Uint8Array | null>): unknown;
    all(...params: Array<string | number | bigint | Uint8Array | null>): unknown[];
  }

  export class DatabaseSync {
    constructor(location: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
