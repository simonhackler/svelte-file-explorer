<script lang="ts">
	import * as TreeView from '$lib/components/ui/tree-view';
	import { isFolder, type ExplorerNode } from './types';
    import FileItem from './file-item.svelte';

    interface Props {
        node: ExplorerNode
    }

    let { node }: Props = $props();

</script>

{#if isFolder(node)}
    <TreeView.Folder name={node.name}>
    {#each node.children as child}
        <FileItem node={child} />
    {/each}
</TreeView.Folder>
{:else}
	<TreeView.File name={node.name} />
{/if}
