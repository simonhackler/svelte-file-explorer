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
    constructor(name: string, parent: Folder | null = null, fileData?: FileData) {
        super(name, parent);
        this.fileData = fileData;
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
