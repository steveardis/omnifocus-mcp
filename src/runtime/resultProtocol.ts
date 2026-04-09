import { z } from "zod";

const ErrorDetail = z.object({
  name: z.string(),
  message: z.string(),
  stack: z.string().optional(),
});

const SuccessEnvelope = z.object({
  ok: z.literal(true),
  data: z.unknown(),
});

const ErrorEnvelope = z.object({
  ok: z.literal(false),
  error: ErrorDetail,
});

const Envelope = z.discriminatedUnion("ok", [SuccessEnvelope, ErrorEnvelope]);

export type ResultEnvelope = z.infer<typeof Envelope>;

export class ExecutionError extends Error {
  readonly errorName: string;
  readonly remoteStack?: string;

  constructor(detail: z.infer<typeof ErrorDetail>) {
    super(detail.message);
    this.name = "ExecutionError";
    this.errorName = detail.name;
    this.remoteStack = detail.stack;
  }
}

/**
 * Scans stdout for the first JSON-parseable line and validates it as a result
 * envelope. Ignores any preceding non-JSON chatter (e.g. osascript warnings).
 */
export function parseResultLine(stdout: string): ResultEnvelope {
  const lines = stdout.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      continue; // not JSON, skip
    }
    const result = Envelope.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    // Parsed as JSON but not a valid envelope — this is a protocol error
    throw new Error(
      `Bridge returned JSON that is not a valid result envelope: ${trimmed}`
    );
  }
  throw new Error(
    `No valid JSON result envelope found in osascript output:\n${stdout}`
  );
}
