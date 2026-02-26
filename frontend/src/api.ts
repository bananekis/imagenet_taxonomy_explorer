export const PAGE_SIZE = 20;
export const MIN_SEARCH_LENGTH = 2;

export interface NodeItem {
  id: number;
  name: string;
  fullName: string;
  size: number;
  depth: number;
}

export interface RootNode extends NodeItem {
  children: NodeItem[];
}

export interface SearchResponse {
  results: NodeItem[];
  total: number;
  hasMore: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const fetchRoot = (): Promise<RootNode> => apiFetch('/api/nodes');

export const fetchChildren = (parentId: number): Promise<NodeItem[]> =>
  apiFetch(`/api/nodes?parentId=${parentId}`);

export const fetchSearch = (q: string, offset = 0): Promise<SearchResponse> =>
  apiFetch(`/api/search?q=${encodeURIComponent(q)}&limit=${PAGE_SIZE}&offset=${offset}`);
