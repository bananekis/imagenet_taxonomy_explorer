import { Router } from 'express';
import prisma from '../lib/prisma';
import { buildTree } from '../lib/buildTree';

const router = Router();

const SELECT = { id: true, shortName: true, name: true, size: true, depth: true };

const toDTO = (n: {
  id: number;
  shortName: string;
  name: string;
  size: number;
  depth: number;
}) => ({
  id: n.id,
  name: n.shortName,
  fullName: n.name,
  size: n.size,
  depth: n.depth,
});

// GET /api/nodes           — root node with its direct children
// GET /api/nodes?parentId= — children of the given node
router.get('/', async (req, res) => {
  const { parentId } = req.query;

  if (parentId !== undefined) {
    const id = parseInt(parentId as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'parentId must be a number' });
      return;
    }

    const children = await prisma.node.findMany({
      where: { parentId: id },
      select: SELECT,
      orderBy: { shortName: 'asc' },
    });
    res.json(children.map(toDTO));
    return;
  }

  const root = await prisma.node.findFirst({
    where: { depth: 0 },
    select: { ...SELECT, children: { select: SELECT, orderBy: { shortName: 'asc' } } },
  });

  if (!root) {
    res.status(404).json({ error: 'No data. Run: npm run ingest' });
    return;
  }

  res.json({ ...toDTO(root), children: root.children.map(toDTO) });
});

// GET /api/nodes/tree — full tree rebuilt from (name, size) tuples (demonstrates the algorithm)
router.get('/tree', async (_req, res) => {
  const records = await prisma.node.findMany({
    select: { name: true, size: true },
    orderBy: { depth: 'asc' },
  });
  const tree = buildTree(records);
  if (!tree) {
    res.status(404).json({ error: 'No data. Run: npm run ingest' });
    return;
  }
  res.json(tree);
});

export default router;
