import type { NewsDemoDraft, PublishedDemoNews } from "@/types/news-demo";

const STORAGE_KEY = "reserva_lago_demo_news";
const DRAFT_STORAGE_KEY = "reserva_lago_news_demo_draft";

function readList(): PublishedDemoNews[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PublishedDemoNews[]) : [];
  } catch {
    return [];
  }
}

function writeList(list: PublishedDemoNews[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function saveDemoNews(news: PublishedDemoNews) {
  const list = readList();
  const withoutSameSlug = list.filter((item) => item.slug !== news.slug);
  writeList([news, ...withoutSameSlug]);
}

export function getDemoNewsList() {
  return readList().sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getDemoNewsBySlug(slug: string) {
  return readList().find((news) => news.slug === slug) ?? null;
}

export function clearDemoNews() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function saveNewsDemoDraft(draft: NewsDemoDraft) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function loadNewsDemoDraft() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as NewsDemoDraft;
  } catch {
    return null;
  }
}

export function clearNewsDemoDraft() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
}
