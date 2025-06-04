import { renderComponent } from "$lib/components/ui/data-table";
import type { ExplorerNode } from "../file-viewer/types.svelte";
import DataTableNameButton from "./data-table-name-button.svelte";
import FileBrowserActions from "./file-browser-actions.svelte";
import FileBrowserItemIcon from "./file-browser-item-icon.svelte";
import type { ColumnDef } from "@tanstack/table-core";
import { displaySize } from '$lib/components/ui/file-drop-zone';

export const columns: ColumnDef<ExplorerNode>[] = [
    {
        id: "icon",
        cell: ({ row }) => {
            return renderComponent(FileBrowserItemIcon, { node: row.original });
        },
    },
    {
        accessorKey: "name",
        header: ({ column }) =>
            renderComponent(DataTableNameButton, {
                onclick: column.getToggleSortingHandler(),
            }),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            // You can pass whatever you need from `row.original` to the component
            return renderComponent(FileBrowserActions, { name: row.original.name });
        },
    },
    {
        accessorFn: (row) => {
            console.log(row);
            return displaySize(row?.fileData?.size || 0)
        },
        header: "Size",
    },
];
