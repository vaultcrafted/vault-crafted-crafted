// Tipi minimi per i binding Cloudflare usati dal gestionale.
declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;
}

interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: { changes?: number; last_row_id?: number };
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(col?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
}
interface R2ObjectBody {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
  size: number;
}
interface R2Bucket {
  put(
    key: string,
    value: ArrayBuffer | Uint8Array | ReadableStream | string,
    opts?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>;
  get(key: string): Promise<R2ObjectBody | null>;
  delete(key: string | string[]): Promise<void>;
}
