import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

const PAGE_SIZE = 20;
const MAX_LIMIT = 50;
const MIN_QUERY_LENGTH = 2;

// GET /api/search?q=term&limit=20&offset=0
router.get('/', async (req, res) => {
  const { q, limit = String(PAGE_SIZE), offset = '0' } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length < MIN_QUERY_LENGTH) {
    res.status(400).json({ error: `Query must be at least ${MIN_QUERY_LENGTH} characters` });
    return;
  }

  const take = Math.min(parseInt(limit as string, 10) || PAGE_SIZE, MAX_LIMIT);
  const skip = Math.max(parseInt(offset as string, 10) || 0, 0);
  const term = q.trim();
  const where = { shortName: { contains: term, mode: 'insensitive' as const } };

  const [results, total] = await Promise.all([
    prisma.node.findMany({
      where,
      select: { id: true, shortName: true, name: true, size: true, depth: true },
      take,
      skip,
      orderBy: { shortName: 'asc' },
    }),
    prisma.node.count({ where }),
  ]);

  res.json({
    results: results.map((n) => ({
      id: n.id,
      name: n.shortName,
      fullName: n.name,
      size: n.size,
      depth: n.depth,
    })),
    total,
    hasMore: skip + take < total,
  });
});

export default router;
