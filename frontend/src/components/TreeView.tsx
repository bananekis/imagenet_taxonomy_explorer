import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import { fetchRoot } from '../api';
import TreeNode from './TreeNode';

export default function TreeView() {
  const {
    data: root,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['root'],
    queryFn: fetchRoot,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm">Loading taxonomy…</span>
      </div>
    );
  }

  if (error || !root) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-red-400">
        <AlertCircle className="h-8 w-8" />
        <span className="text-sm">{(error as Error | null)?.message ?? 'Failed to load data'}</span>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="mb-1 flex items-center gap-2 rounded-md bg-indigo-50 px-3 py-2">
        <span className="text-sm font-semibold text-indigo-700">{root.name}</span>
        <span className="ml-auto rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
          {root.size.toLocaleString()} synsets
        </span>
      </div>
      {root.children.map((child) => (
        <TreeNode key={child.id} node={child} level={1} />
      ))}
    </div>
  );
}
