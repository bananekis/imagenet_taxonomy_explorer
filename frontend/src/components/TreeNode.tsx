import { memo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ChevronDown, Minus, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { fetchChildren } from '../api';
import type { NodeItem } from '../api';

const INDENT_PX = 18;

function TreeNode({ node, level }: { node: NodeItem; level: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.size > 0;
  const indent = level * INDENT_PX + 8;

  const { data: children, isLoading } = useQuery({
    queryKey: ['children', node.id],
    queryFn: () => fetchChildren(node.id),
    enabled: expanded && hasChildren,
  });

  function getIcon() {
    if (isLoading) return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
    if (!hasChildren) return <Minus className="h-3 w-3 opacity-30" />;
    return expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />;
  }

  return (
    <div>
      <div
        className={clsx(
          'flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors',
          hasChildren ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default',
        )}
        style={{ paddingLeft: `${indent}px` }}
        onClick={() => hasChildren && setExpanded((v) => !v)}
        role={hasChildren ? 'button' : undefined}
        aria-expanded={hasChildren ? expanded : undefined}
      >
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-slate-400">
          {getIcon()}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{node.name}</span>
        {node.size > 0 && (
          <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
            {node.size.toLocaleString()}
          </span>
        )}
      </div>

      {expanded &&
        children?.map((child) => <TreeNode key={child.id} node={child} level={level + 1} />)}

      {expanded && isLoading && (
        <div
          className="flex items-center gap-2 py-2 text-xs text-slate-400"
          style={{ paddingLeft: `${indent + INDENT_PX}px` }}
        >
          <Loader2 className="h-3 w-3 animate-spin" /> Loading…
        </div>
      )}
    </div>
  );
}

export default memo(TreeNode);
