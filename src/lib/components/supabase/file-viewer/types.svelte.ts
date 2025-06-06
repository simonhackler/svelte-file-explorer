export interface FileData {
    size: number;
    mimetype: string;
    updatedAt: Date;
    url?: Promise<string>;
}

export abstract class ExplorerNodeBase {
    name = $state<string>('');
    parent = $state<Folder | null>(null);

    constructor(name: string, parent: Folder | null = null) {
        this.name = name;
        this.parent = parent;
    }
}

export class FileLeaf extends ExplorerNodeBase {
    fileData = $state<FileData | undefined>(undefined);
    blob: Blob | null = null;
    constructor(name: string, parent: Folder | null = null, fileData?: FileData, blob: Blob | null= null) {
        super(name, parent);
        this.fileData = fileData;
        this.blob = blob
    }
}

export class Folder extends ExplorerNodeBase {
    children = $state<ExplorerNode[]>([]);
    isEmpty = $derived(this.children.length === 0);

    constructor(
        name: string,
        parent: Folder | null = null,
        children: ExplorerNode[] = []
    ) {
        super(name, parent);
        this.children = children;                 // keep this reactive too
    }
}

export type ExplorerNode = Folder | FileLeaf;

export function isFolder(node: ExplorerNode): node is Folder {
    return node instanceof Folder;
}

export function deepCopyExplorerNode(
  node: ExplorerNode,
  parent: Folder | null = null
): ExplorerNode {
  if (isFolder(node)) {
    const copyFolder = new Folder(node.name, parent);

    const newChildren: ExplorerNode[] = [];
    for (const child of node.children) {
      const childCopy = deepCopyExplorerNode(child, copyFolder);
      newChildren.push(childCopy);
    }

    copyFolder.children = newChildren;

    return copyFolder;
  }

  else {
    const originalData = node.fileData;
    let fileDataCopy: FileData | undefined = undefined;

    if (originalData) {
      fileDataCopy = {
        size: originalData.size,
        mimetype: originalData.mimetype,
        updatedAt: new Date(originalData.updatedAt.getTime()),
        url: originalData.url
      };
    }

    const copyFile = new FileLeaf(node.name, parent, fileDataCopy);
    return copyFile;
  }
}
