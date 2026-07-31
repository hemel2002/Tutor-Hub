export type ChatRole = "user" | "assistant";

export interface AssistantMessage {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string;
}

export interface MemoryFact {
  id: string;
  text: string;
  createdAt: string;
}

export interface AssistantRequest {
  message: string;
  history: AssistantMessage[];
  memories: MemoryFact[];
}

export type AssistantEventKind =
  | "status"
  | "tool_start"
  | "tool_result"
  | "memory"
  | "answer"
  | "error";

export interface AssistantEvent {
  kind: AssistantEventKind;
  message: string;
  speak?: boolean;
  sourceUrl?: string;
  memory?: MemoryFact;
}

export interface SearchResult {
  title: string;
  summary: string;
  url?: string;
}

export interface AssistantDependencies {
  search: (query: string) => Promise<SearchResult | null>;
  now?: () => Date;
}

const MAX_MEMORY_LENGTH = 180;

export function normalizeSpeech(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isStopCommand(value: string): boolean {
  const normalized = normalizeSpeech(value);
  return [
    "stop",
    "guide stop",
    "stop speaking",
    "guide stop speaking",
    "be quiet",
    "guide be quiet",
  ].includes(normalized);
}

export function removeWakeWord(value: string): string | null {
  const match = value
    .trim()
    .match(/^(?:hey\s+)?(?:guide|tutor\s+guide)[,.\s:;-]*(.*)$/i);

  if (!match) return null;
  return match[1].trim();
}

function tokenOverlap(first: string, second: string): number {
  const firstTokens = normalizeSpeech(first).split(" ").filter(Boolean);
  const secondSet = new Set(normalizeSpeech(second).split(" ").filter(Boolean));

  if (firstTokens.length === 0 || secondSet.size === 0) return 0;

  const matches = firstTokens.filter((token) => secondSet.has(token)).length;
  return matches / firstTokens.length;
}

export function isLikelyAssistantEcho(
  transcript: string,
  recentlySpoken: string[],
): boolean {
  const normalizedTranscript = normalizeSpeech(transcript);
  if (normalizedTranscript.length < 3) return false;

  return recentlySpoken.some((spoken) => {
    const normalizedSpoken = normalizeSpeech(spoken);
    if (!normalizedSpoken) return false;

    if (
      normalizedSpoken.includes(normalizedTranscript) ||
      normalizedTranscript.includes(normalizedSpoken)
    ) {
      return true;
    }

    const wordCount = normalizedTranscript.split(" ").length;
    return wordCount >= 3 && tokenOverlap(transcript, spoken) >= 0.72;
  });
}

function cleanFact(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "")
    .trim()
    .slice(0, MAX_MEMORY_LENGTH);
}

export function extractMemoryFact(
  message: string,
  now = new Date(),
): MemoryFact | null {
  const trimmed = message.trim();
  const patterns: Array<{
    expression: RegExp;
    format: (match: RegExpMatchArray) => string;
  }> = [
    {
      expression: /\bremember(?:\s+that)?\s+(.+)/i,
      format: (match) => cleanFact(match[1]),
    },
    {
      expression: /\bmy name is\s+([\p{L}][\p{L}\p{M}' -]{0,60})/iu,
      format: (match) => `The user's name is ${cleanFact(match[1])}`,
    },
    {
      expression: /\bcall me\s+([\p{L}][\p{L}\p{M}' -]{0,60})/iu,
      format: (match) => `The user wants to be called ${cleanFact(match[1])}`,
    },
    {
      expression: /\bi prefer\s+(.+)/i,
      format: (match) => `The user prefers ${cleanFact(match[1])}`,
    },
    {
      expression: /\bi(?: am|'m) allergic to\s+(.+)/i,
      format: (match) => `The user is allergic to ${cleanFact(match[1])}`,
    },
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern.expression);
    if (!match) continue;

    const text = pattern.format(match);
    if (text.length < 2) return null;

    return {
      id: `memory-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      createdAt: now.toISOString(),
    };
  }

  return null;
}

export function mergeMemory(
  existing: MemoryFact[],
  candidate: MemoryFact,
): MemoryFact[] {
  const normalizedCandidate = normalizeSpeech(candidate.text);
  const withoutDuplicate = existing.filter(
    (fact) => normalizeSpeech(fact.text) !== normalizedCandidate,
  );
  return [...withoutDuplicate, candidate].slice(-50);
}

function memorySummary(memories: MemoryFact[]): string {
  if (memories.length === 0) {
    return "I do not have any saved personal details yet. Say, for example, “Guide, remember that I prefer short answers.”";
  }

  return `Here is what I remember: ${memories
    .map((memory, index) => `${index + 1}. ${memory.text}`)
    .join("; ")}.`;
}

function recentConversationSummary(history: AssistantMessage[]): string {
  const recentUserMessages = history
    .filter((item) => item.role === "user")
    .slice(-3)
    .map((item) => item.text);

  if (recentUserMessages.length === 0) {
    return "This is the first thing you have told me in this conversation.";
  }

  return `Your recent messages were: ${recentUserMessages
    .map((text, index) => `${index + 1}. ${text}`)
    .join("; ")}.`;
}

function readableDate(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function readableTime(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

class ExpressionParser {
  private position = 0;

  constructor(private readonly input: string) {}

  parse(): number {
    const result = this.parseExpression();
    this.skipSpaces();
    if (this.position !== this.input.length || !Number.isFinite(result)) {
      throw new Error("That calculation is not valid.");
    }
    return result;
  }

  private parseExpression(): number {
    let result = this.parseTerm();
    while (true) {
      this.skipSpaces();
      const operator = this.input[this.position];
      if (operator !== "+" && operator !== "-") break;
      this.position += 1;
      const value = this.parseTerm();
      result = operator === "+" ? result + value : result - value;
    }
    return result;
  }

  private parseTerm(): number {
    let result = this.parseFactor();
    while (true) {
      this.skipSpaces();
      const operator = this.input[this.position];
      if (operator !== "*" && operator !== "/") break;
      this.position += 1;
      const value = this.parseFactor();
      if (operator === "/" && value === 0) {
        throw new Error("I cannot divide by zero.");
      }
      result = operator === "*" ? result * value : result / value;
    }
    return result;
  }

  private parseFactor(): number {
    this.skipSpaces();

    if (this.input[this.position] === "-") {
      this.position += 1;
      return -this.parseFactor();
    }

    if (this.input[this.position] === "(") {
      this.position += 1;
      const result = this.parseExpression();
      this.skipSpaces();
      if (this.input[this.position] !== ")") {
        throw new Error("A closing parenthesis is missing.");
      }
      this.position += 1;
      return result;
    }

    const start = this.position;
    while (/[\d.]/.test(this.input[this.position] ?? "")) {
      this.position += 1;
    }

    const value = Number(this.input.slice(start, this.position));
    if (start === this.position || !Number.isFinite(value)) {
      throw new Error("I could not understand the numbers in that calculation.");
    }

    return value;
  }

  private skipSpaces(): void {
    while (this.input[this.position] === " ") this.position += 1;
  }
}

export function calculateExpression(message: string): number {
  const expression = message
    .toLocaleLowerCase()
    .replace(/what is|what's|calculate|work out|equals?|please/gi, " ")
    .replace(/\bplus\b/g, "+")
    .replace(/\bminus\b/g, "-")
    .replace(/\b(?:times|multiplied by)\b/g, "*")
    .replace(/\b(?:divided by|over)\b/g, "/")
    .replace(/\s+/g, " ")
    .trim();

  if (!expression || /[^0-9+\-*/().\s]/.test(expression)) {
    throw new Error(
      "I can calculate numbers using plus, minus, times, divided by, and parentheses.",
    );
  }

  return new ExpressionParser(expression).parse();
}

function looksLikeCalculation(message: string): boolean {
  const normalized = message.toLocaleLowerCase();
  return (
    /\b(calculate|work out)\b/.test(normalized) ||
    (/^(?:what is|what's)\b/.test(normalized) &&
      /\d/.test(normalized) &&
      /(?:[+\-*/]|\bplus\b|\bminus\b|\btimes\b|\bdivided by\b)/.test(
        normalized,
      ))
  );
}

export function searchQueryFromMessage(message: string): string | null {
  const trimmed = message.trim();
  const explicit = trimmed.match(
    /^(?:please\s+)?(?:search(?:\s+the\s+web)?(?:\s+for)?|look\s+up|find\s+(?:information\s+)?(?:about|on))\s+(.+)/i,
  );
  if (explicit?.[1]) return explicit[1].replace(/[?.!]+$/, "").trim();

  if (
    /^(?:who|what|where|when)\s+(?:is|are|was|were|did|does)\b/i.test(
      trimmed,
    ) &&
    !/\b(?:remember|time|date|my name)\b/i.test(trimmed)
  ) {
    return trimmed.replace(/[?.!]+$/, "").trim();
  }

  const tellMe = trimmed.match(
    /^(?:please\s+)?tell me (?:about|who|what)\s+(.+)/i,
  );
  return tellMe?.[1]?.replace(/[?.!]+$/, "").trim() ?? null;
}

function rememberedName(memories: MemoryFact[]): string | null {
  for (const memory of [...memories].reverse()) {
    const match = memory.text.match(
      /(?:name is|called)\s+([\p{L}][\p{L}\p{M}' -]*)/iu,
    );
    if (match) return cleanFact(match[1]);
  }
  return null;
}

function conversationalAnswer(
  message: string,
  history: AssistantMessage[],
  memories: MemoryFact[],
): string {
  const normalized = normalizeSpeech(message);

  if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(normalized)) {
    const name = rememberedName(memories);
    return `Hello${name ? `, ${name}` : ""}. I am ready. You can ask me to search, calculate, remember something, recall our conversation, or tell the time and date.`;
  }

  if (/\bwhat(?:'s| is) my name\b/.test(normalized)) {
    const name = rememberedName(memories);
    return name
      ? `You told me your name is ${name}.`
      : "You have not told me your name yet. Say, “Guide, my name is,” followed by your name.";
  }

  if (
    /\b(what did i say|what were we talking about|recap|conversation so far)\b/.test(
      normalized,
    )
  ) {
    return recentConversationSummary(history);
  }

  if (/\b(thank you|thanks)\b/.test(normalized)) {
    return "You are welcome. I am listening when you are ready.";
  }

  return `I heard: “${message.trim()}.” I can reliably search the web, calculate, remember personal details on this device, recall recent messages, and tell the time or date. Say “Guide, help” for examples.`;
}

export async function* runAssistant(
  request: AssistantRequest,
  dependencies: AssistantDependencies,
): AsyncGenerator<AssistantEvent> {
  const message = request.message.trim();
  const normalized = normalizeSpeech(message);
  const now = dependencies.now?.() ?? new Date();

  if (!message) {
    yield {
      kind: "error",
      message: "I did not receive a message. Please try again.",
      speak: true,
    };
    return;
  }

  yield {
    kind: "status",
    message: "I heard you. I am working on your request.",
  };

  const memory = extractMemoryFact(message, now);
  if (memory) {
    yield {
      kind: "memory",
      message: `I saved this to memory: ${memory.text}.`,
      memory,
    };
    yield {
      kind: "answer",
      message: `I will remember that. ${memory.text}.`,
      speak: true,
    };
    return;
  }

  if (/\b(what do you remember|show memory|read my memory|saved memories)\b/.test(normalized)) {
    yield {
      kind: "answer",
      message: memorySummary(request.memories),
      speak: true,
    };
    return;
  }

  if (/\b(help|what can you do|instructions)\b/.test(normalized)) {
    yield {
      kind: "answer",
      message:
        "You can say: “Guide, search for accessible technology news,” “Guide, calculate 18 times 4,” “Guide, remember that I prefer short answers,” or “Guide, what do you remember?” Press Escape or say “Guide, stop” at any time to silence me.",
      speak: true,
    };
    return;
  }

  if (/\b(?:what(?:'s| is) the )?time\b/.test(normalized)) {
    yield {
      kind: "tool_start",
      message: "Checking the current time.",
      speak: true,
    };
    yield {
      kind: "answer",
      message: `The time is ${readableTime(now)}.`,
      speak: true,
    };
    return;
  }

  if (/\b(?:what(?:'s| is) the )?date\b|\bwhat day is it\b/.test(normalized)) {
    yield {
      kind: "tool_start",
      message: "Checking today’s date.",
      speak: true,
    };
    yield {
      kind: "answer",
      message: `Today is ${readableDate(now)}.`,
      speak: true,
    };
    return;
  }

  if (looksLikeCalculation(message)) {
    yield {
      kind: "tool_start",
      message: "Opening the calculator and checking the expression.",
      speak: true,
    };

    try {
      const result = calculateExpression(message);
      yield {
        kind: "tool_result",
        message: "The calculation is complete.",
      };
      yield {
        kind: "answer",
        message: `The answer is ${new Intl.NumberFormat("en", {
          maximumFractionDigits: 8,
        }).format(result)}.`,
        speak: true,
      };
    } catch (error) {
      yield {
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "I could not complete that calculation.",
        speak: true,
      };
    }
    return;
  }

  const searchQuery = searchQueryFromMessage(message);
  if (searchQuery) {
    yield {
      kind: "tool_start",
      message: `I am searching for ${searchQuery}.`,
      speak: true,
    };

    try {
      const result = await dependencies.search(searchQuery);
      if (!result) {
        yield {
          kind: "error",
          message: `I finished searching, but I could not find a reliable summary for ${searchQuery}. Try using more specific words.`,
          speak: true,
        };
        return;
      }

      yield {
        kind: "tool_result",
        message: `I found a result from ${result.title}. I am preparing a concise answer.`,
        speak: true,
        sourceUrl: result.url,
      };
      yield {
        kind: "answer",
        message: `${result.title}. ${result.summary}`,
        speak: true,
        sourceUrl: result.url,
      };
    } catch {
      yield {
        kind: "error",
        message:
          "The search service is unavailable right now. Your conversation is still safe, and you can retry in a moment.",
        speak: true,
      };
    }
    return;
  }

  yield {
    kind: "answer",
    message: conversationalAnswer(message, request.history, request.memories),
    speak: true,
  };
}
