const PATH_SEPARATOR = ' > ';

interface Record {
  name: string;
  size: number;
}

export interface TreeNode {
  name: string | undefined;
  size: number;
  children: TreeNode[];
}

/**
 * Rebuilds a tree from a flat list of (name, size) tuples stored in the DB.
 *
 * `name` encodes the full path, e.g. "Root > Animals > Dog".
 *
 * Two-pass O(n) algorithm:
 *   Pass 1 — insert every node into a Map keyed by its full path.
 *   Pass 2 — for each node, derive the parent path by dropping the last
 *             segment and link the node as a child of its parent.
 */
export function buildTree(records: Record[]): TreeNode | null {
  if (records.length === 0) return null;

  // Pass 1 — build lookup map
  const map = new Map<string, TreeNode>();
  for (const { name, size } of records) {
    map.set(name, { name: name.split(PATH_SEPARATOR).at(-1), size, children: [] });
  }

  // Pass 2 — link children to parents
  let root: TreeNode | null = null;
  for (const { name } of records) {
    const parts = name.split(PATH_SEPARATOR);
    if (parts.length === 1) {
      root = map.get(name) ?? null;
    } else {
      const parentPath = parts.slice(0, -1).join(PATH_SEPARATOR);
      const parent = map.get(parentPath);
      const node = map.get(name);
      if (parent && node) parent.children.push(node);
    }
  }

  return root;
}
