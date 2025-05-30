import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database }         from '../../../../schema';

interface InputPath {
  pathTokens: string[];
}

interface BuildFolder {
  name: string;
  children: Map<string, BuildNode>;
}

type BuildNode = BuildFolder | { name: string }; // leaf placeholders

// -------------------------------------------------------------------------
// Pass 1 – turn db rows into a *temporary* map-based tree
function buildTree(filePathList: InputPath[]) {
  const root: BuildFolder = { name: 'home', children: new Map<string, BuildNode>() };

  for (const { pathTokens } of filePathList) {
    subBuild(root, pathTokens);
  }
  return root;
}

function subBuild(current: BuildFolder, pathTokens: string[]) {
  // i = 1 because token[0] is always the bucket root ("home")
  for (let i = 1; i < pathTokens.length; i++) {
    const token = pathTokens[i];
    let next = current.children.get(token);

    // Create a missing entry (folder OR leaf placeholder)
    if (!next) {
      if (i === pathTokens.length - 1) {
        // Leaf → add a minimal placeholder; we’ll create the FileLeaf later
        next = { name: token };
      } else {
        // Folder → create a new BuildFolder
        next = { name: token, children: new Map<string, BuildNode>() };
      }
      current.children.set(token, next);
    }

    // Descend if it’s a folder
    if ('children' in next) current = next;
  }
}

// -------------------------------------------------------------------------
// Pass 2 – convert the temporary tree into real Folder / FileLeaf instances
function convertToArray(buildNode: BuildNode, parent: Folder | null): ExplorerNode {
  if (!('children' in buildNode)) {
    // Placeholder leaf becomes a live FileLeaf
    return new FileLeaf(buildNode.name, parent);
  }

  const node = new Folder(buildNode.name, parent);

  // Recursively convert children
  for (const child of buildNode.children.values()) {
    node.children.push(convertToArray(child, node));
  }
  return node;
}

// -------------------------------------------------------------------------
// Optional pretty-printers (unchanged apart from instanceof checks)
export function prettyPrintTreeArray(node: ExplorerNode, prefix = ''): void {
  if (!(node instanceof Folder)) return;

  const kids = [...node.children];
  kids.sort((a, b) => a.name.localeCompare(b.name));

  kids.forEach((child, idx) => {
    const last = idx === kids.length - 1;
    const branch = last ? '└── ' : '├── ';
    const newPrefix = prefix + (last ? '    ' : '│   ');
    console.log(newPrefix + branch + child.name);
    prettyPrintTreeArray(child, newPrefix);
  });
}

// -------------------------------------------------------------------------
// Public helper – pull paths from Supabase, return reactive tree
export async function getAllFilesAndConvertToTree(
  supabase: SupabaseClient<Database>
) {
  const { data, error } = await supabase
    .schema('storage')
    .from('objects')
    .select('path_tokens')
    .eq('bucket_id', 'folders');

  if (error) {
    console.error(error);
    return { data: null, error };
  }

  // Build → Convert → Done
  const buildRoot = buildTree(
    data!
      .filter(Boolean)
      .map((row) => ({ pathTokens: row.path_tokens as string[] }))
  );

  return { data: convertToArray(buildRoot, null), error: null };
}
