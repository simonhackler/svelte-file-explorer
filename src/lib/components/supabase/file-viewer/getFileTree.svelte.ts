import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExplorerNode, FileLeaf, Folder } from "./types";
import type { Database } from "../../../../schema";

interface inputPaths {
    pathTokens: string[];
}

interface BuildFolder {
    name: string;
    children: Map<string, BuildNode>;
}

type BuildNode = BuildFolder | FileLeaf;

function buildTree(filePathList: inputPaths[]) {
    const root: BuildFolder = { name: 'home', children: new Map<string, BuildFolder>() };
    for (const { pathTokens } of filePathList) {
        subBuild(root, pathTokens);
    }
    return root;
}

function subBuild(root: BuildFolder, pathTokens: string[]) {
    let current = root;
    for (let i = 1; i < pathTokens.length; i++) {
        let newRoot = current.children.get(pathTokens[i]);
        if (!newRoot) {
            if (i == pathTokens.length - 1) {
                current.children.set(pathTokens[i], { name: pathTokens[i] } as FileLeaf);
                return;
            }
            newRoot = { name: pathTokens[i], children: new Map<string, BuildFolder>() };
            current.children.set(pathTokens[i], newRoot);
        }
        current = newRoot as BuildFolder;
    }
}

function convertToArray(buildNode: BuildNode, parent: Folder | null): ExplorerNode {
    if (!buildNode.hasOwnProperty('children')) {
        return { name: buildNode.name, parent};
    }
    let node: Folder = { name: buildNode.name, children: [], parent: parent };
    for (const child of buildNode.children.values()) {
        if (child.hasOwnProperty('children')) {
            node.children.push(convertToArray(child as BuildFolder, node));
        } else {
            node.children.push(child);
        }
    }
    return node;
}
function prettyPrintTreeArray(node: ExplorerNode, prefix = ''): void {
    if (!node.hasOwnProperty('children')) {
        return;
    }
    if (node.name !== 'root') {
        // console.log(prefix + node.name);
    }

    const kids = node.children as ExplorerNode[];
    // Optional: alphabetical order.  Remove `.sort()` to retain insertion order.
    kids.sort((a, b) => a.name.localeCompare(b.name));

    // Prepare the “branches” ── draw ├── for all but the last child, and └── for the last one
    kids.forEach((child, index) => {
        const isLast = index === kids.length - 1;
        const branch = isLast ? '└── ' : '├── ';
        const newPrefix = prefix + (node.name === 'root' ? '' : isLast ? '    ' : '│   ');

        // Print the branch and recursively print the subtree
        console.log(newPrefix + branch + child.name);
        prettyPrintTree(child, newPrefix);
    });
}


function prettyPrintTree(node: BuildNode, prefix = ''): void {
    if (!node.hasOwnProperty('children')) {
        return;
    }
    if (node.name !== 'root') {
        // console.log(prefix + node.name);
    }
    const kids = Array.from((node as BuildFolder).children.values());

    kids.sort((a, b) => a.name.localeCompare(b.name));

    kids.forEach((child, index) => {
        const isLast = index === kids.length - 1;
        const branch = isLast ? '└── ' : '├── ';
        const newPrefix = prefix + (node.name === 'root' ? '' : isLast ? '    ' : '│   ');

        console.log(newPrefix + branch + child.name);
        prettyPrintTree(child, newPrefix);
    });
}

export async function getAllFilesAndConvertToTree(supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase
        .schema('storage')
        .from('objects')
        .select('path_tokens')
        .eq('bucket_id', 'folders');
    if (error) {
        console.error(error);
        return { data: null, error };
    }
    const treeMap = buildTree(
        data!
            .filter((x) => x != null)
            .map((x) => {
                return { pathTokens: x.path_tokens as string[] };
            })
    );
    return { data: convertToArray(treeMap, null), error: null };
}
