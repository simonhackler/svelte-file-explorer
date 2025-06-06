<script lang="ts" generics="TValue">
	import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	import DataTableNameButton from './data-table-name-button.svelte';
	import FileBrowserItemIcon from './file-browser-item-icon.svelte';
	import { displaySize } from '$lib/components/ui/file-drop-zone';
	import FileBrowserActions from './file-browser-actions.svelte';
	import {
		type ColumnDef,
		type ColumnFiltersState,
		getCoreRowModel,
		getSortedRowModel,
		getFilteredRowModel,
		type SortingState,
		type VisibilityState
	} from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { cn } from '$lib/utils/utils';
	import type { ExplorerNode } from '../file-viewer/types.svelte';
	import FileBrowserGridItem from './file-browser-grid-item.svelte';
	import type { Snippet } from 'svelte';
	import { Input } from '$lib/components/ui/input/index.js';

	type DataTableProps<ExplorerNode, TValue> = {
		data: ExplorerNode[];
		display: 'list' | 'grid';
		actionList: Snippet<[ExplorerNode]>;
		onNodeClicked: (node: ExplorerNode) => void;
		class?: string;
        showActions?: boolean
	};

	let {
		data,
		class: className,
		onNodeClicked,
		display,
		actionList,
        showActions = true,
	}: DataTableProps<ExplorerNode, TValue> = $props();

	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let columnVisibility = $state<VisibilityState>({});

	export const columns: ColumnDef<ExplorerNode>[] = [
		{
			id: 'icon',
			cell: ({ row }) => {
				return renderComponent(FileBrowserItemIcon, { node: row.original });
			}
		},
		{
			accessorKey: 'name',
			header: ({ column }) =>
				renderComponent(DataTableNameButton, {
					onclick: column.getToggleSortingHandler()
				})
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				return renderSnippet(actionList, row.original);
			}
		},
		{
			accessorFn: (row) => {
				console.log(row);
				return displaySize(row?.fileData?.size || 0);
			},
			header: 'Size'
		}
	];

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		state: {
			get sorting() {
				return sorting;
			},
			get columnFilters() {
				return columnFilters;
			},
			get columnVisibility() {
				return columnVisibility;
			}
		}
	});

    table.getColumn('actions')?.toggleVisibility(showActions);
</script>

<div class={cn('flex h-full flex-col', className)}>
	<div class="flex-0">
		<div class="flex items-center py-4">
			<Input
				placeholder="Filter files..."
				value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
				onchange={(e) => {
					table.getColumn('name')?.setFilterValue(e.currentTarget.value);
				}}
				oninput={(e) => {
					table.getColumn('name')?.setFilterValue(e.currentTarget.value);
				}}
				class="max-w-sm"
			/>
		</div>
		<div class="rounded-md border">
			<Table.Root><!-- ... --></Table.Root>
		</div>
	</div>

	<ScrollArea class="min-h-0 flex-1 overflow-y-auto">
		<div class="w-full rounded-md border">
			<Table.Root>
				<Table.Header>
					{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
						<Table.Row>
							{#each headerGroup.headers as header (header.id)}
								<Table.Head>
									{#if !header.isPlaceholder}
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
									{/if}
								</Table.Head>
							{/each}
						</Table.Row>
					{/each}
				</Table.Header>
				{#if display === 'list'}
					<Table.Body>
						{#each table.getRowModel().rows as row (row.id)}
							<Table.Row
								data-state={row.getIsSelected() && 'selected'}
								onclick={() => onNodeClicked(row.original)}
							>
								{#each row.getVisibleCells() as cell (cell.id)}
									<Table.Cell>
										<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
									</Table.Cell>
								{/each}
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell colspan={columns.length} class="h-24 text-center"
									>No results.</Table.Cell
								>
							</Table.Row>
						{/each}
					</Table.Body>
				{/if}
			</Table.Root>
			{#if display === 'grid'}
				<div
					class="col-span-full grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8"
				>
					{#each table.getRowModel().rows as row (row.id)}
						<FileBrowserGridItem
							child={row.original}
                            {showActions}
							onclick={() => onNodeClicked(row.original)}
							{actionList}
						/>
					{/each}
				</div>
			{/if}
		</div>
	</ScrollArea>
</div>
