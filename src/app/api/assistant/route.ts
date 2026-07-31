import {
  runAssistant,
  type AssistantEvent,
  type AssistantRequest,
} from "@/lib/assistant/core";
import { searchWikipedia } from "@/lib/assistant/search";

export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 1_500;
const MAX_HISTORY_ITEMS = 40;
const MAX_MEMORY_ITEMS = 50;

function isAssistantRequest(value: unknown): value is AssistantRequest {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AssistantRequest>;
  return (
    typeof candidate.message === "string" &&
    Array.isArray(candidate.history) &&
    Array.isArray(candidate.memories)
  );
}

function line(event: AssistantEvent): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  if (!isAssistantRequest(payload) || !payload.message.trim()) {
    return Response.json(
      { error: "A non-empty message, history, and memories are required." },
      { status: 400 },
    );
  }

  const safeRequest: AssistantRequest = {
    message: payload.message.trim().slice(0, MAX_MESSAGE_LENGTH),
    history: payload.history.slice(-MAX_HISTORY_ITEMS),
    memories: payload.memories.slice(-MAX_MEMORY_ITEMS),
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of runAssistant(safeRequest, {
          search: searchWikipedia,
        })) {
          controller.enqueue(line(event));
        }
      } catch {
        controller.enqueue(
          line({
            kind: "error",
            message:
              "Something went wrong while handling that request. Please try again.",
            speak: true,
          }),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
