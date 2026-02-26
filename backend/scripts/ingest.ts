import { PrismaClient } from '@prisma/client';
import { XMLParser } from 'fast-xml-parser';
import * as dotenv from 'dotenv';

dotenv.config();

const XML_URL =
  'https://raw.githubusercontent.com/tzutalin/ImageNet_Utils/master/detection_eval_tools/structure_released.xml';
const BATCH_SIZE = 2000;

const prisma = new PrismaClient();

interface Synset {
  '@_wnid': string;
  '@_words': string;
  synset?: Synset[];
}

interface FlatNode {
  wnid: string;
  name: string;
  shortName: string;
  size: number;
  depth: number;
  parentWnid: string | null;
}

/**
 * DFS traversal — collects every synset as a flat record and computes its
 * size (number of descendants) bottom-up. Returns descendant count.
 */
function collect(
  node: Synset,
  parentPath: string | null,
  depth: number,
  parentWnid: string | null,
  out: FlatNode[],
): number {
  const shortName = node['@_words'];
  const name = parentPath ? `${parentPath} > ${shortName}` : shortName;
  const index = out.length;

  out.push({
    wnid: node['@_wnid'],
    name,
    shortName,
    size: 0,
    depth,
    parentWnid,
  });

  let descendants = 0;
  for (const child of node.synset ?? []) {
    descendants += 1 + collect(child, name, depth + 1, node['@_wnid'], out);
  }

  out[index].size = descendants;
  return descendants;
}

async function main() {
  if ((await prisma.node.count()) > 0) {
    console.log('Database already seeded. Skipping.');
    return;
  }

  console.log('Fetching XML...');
  const res = await fetch(XML_URL);
  if (!res.ok) throw new Error(`Failed to fetch XML: ${res.status}`);

  console.log('Parsing...');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (n) => n === 'synset',
  });
  const root: Synset = parser.parse(await res.text()).ImageNetStructure.synset[0];

  console.log('Building flat list...');
  const flat: FlatNode[] = [];
  collect(root, null, 0, null, flat);
  console.log(`${flat.length} nodes collected`);

  console.log('Inserting into database...');
  for (let i = 0; i < flat.length; i += BATCH_SIZE) {
    await prisma.node.createMany({
      data: flat.slice(i, i + BATCH_SIZE),
      skipDuplicates: true,
    });
    console.log(`  ${Math.min(i + BATCH_SIZE, flat.length)} / ${flat.length}`);
  }

  // Resolve parentId for all nodes in a single SQL statement
  await prisma.$executeRaw`
    UPDATE "Node" AS child
    SET "parentId" = parent.id
    FROM "Node" AS parent
    WHERE child."parentWnid" = parent.wnid
      AND child."parentWnid" IS NOT NULL
  `;

  console.log('Done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
