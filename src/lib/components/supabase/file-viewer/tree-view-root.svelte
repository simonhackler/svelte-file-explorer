<script lang="ts">
	import * as TreeView from '$lib/components/ui/tree-view';
	import FileItem from "./file-item.svelte";
	import { type ExplorerNode } from '../../file-browser/browser-utils/types.svelte';

    interface Props {
        node: ExplorerNode
    }

    let { node }: Props = $props();


</script>

<TreeView.Root>
	<FileItem {node} />
</TreeView.Root>
