import type { SearchResult } from "./core";

interface WikipediaPage {
  pageid?: number;
  title?: string;
  extract?: string;
  fullurl?: string;
}

interface WikipediaResponse {
  query?: {
    pages?: Record<string, WikipediaPage>;
  };
}

function cleanSummary(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\[[^\]]+\]/g, "")
    .trim()
    .slice(0, 900);
}

export async function searchWikipedia(
  query: string,
): Promise<SearchResult | null> {
  const parameters = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: query,
    gsrlimit: "3",
    prop: "extracts|info",
    exintro: "1",
    explaintext: "1",
    exsentences: "4",
    inprop: "url",
    origin: "*",
  });

  const response = await fetch(
    `https://en.wikipedia.org/w/api.php?${parameters.toString()}`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "Tutor-Hub-Accessible-Guide/1.0",
      },
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Knowledge search failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as WikipediaResponse;
  const pages = Object.values(payload.query?.pages ?? {})
    .filter((page) => page.title && page.extract)
    .sort((first, second) => {
      const firstExact =
        first.title?.toLocaleLowerCase() === query.toLocaleLowerCase() ? 1 : 0;
      const secondExact =
        second.title?.toLocaleLowerCase() === query.toLocaleLowerCase() ? 1 : 0;
      return secondExact - firstExact;
    });

  const page = pages[0];
  if (!page?.title || !page.extract) return null;

  return {
    title: page.title,
    summary: cleanSummary(page.extract),
    url:
      page.fullurl ??
      `https://en.wikipedia.org/?curid=${encodeURIComponent(String(page.pageid ?? ""))}`,
  };
}
