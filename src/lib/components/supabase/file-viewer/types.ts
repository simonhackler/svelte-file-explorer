interface SharedProps {
    name: string;
    parent: Folder | null;
}

export interface Folder extends SharedProps {
    children: ExplorerNode[];
}

export interface FileLeaf extends SharedProps {
    name: string;
}

export type ExplorerNode = Folder | FileLeaf;

export function isFolder(node: ExplorerNode): node is Folder {
  return (
    typeof node === 'object' &&
    node !== null &&
    'children' in node &&
    Array.isArray((node as Folder).children)
  );
}

export function isFileLeaf(node: ExplorerNode): node is FileLeaf {
  return !isFolder(node);
}
