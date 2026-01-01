import { defineConfig } from "jsrepo";
import { repository } from "jsrepo/outputs";
import prettier from "@jsrepo/transform-prettier";
    
export default defineConfig({
	registry: {
        name: "@simonhackler/svelte-shadcn-file-browser",
		description: undefined,
		homepage: undefined,
		authors: undefined,
		bugs: undefined,
		repository: undefined,
		tags: undefined,
		version: "0.0.1",
		access: undefined,
		defaultPaths: undefined,
		excludeDeps: [],
        outputs: [repository({ format: true })],
        items: [
	{
		"name": "utils",
		"add": "when-needed",
		"type": "utils",
		"files": [
			{
				"path": "src/lib/utils/utils.ts"
			}
		]
	},
	{
		"name": "adapters",
		"add": "when-added",
		"type": "file-browser",
		"files": [
			{
				"path": "src/lib/components/file-browser/adapters",
				"files": [
					{
						"path": "adapter.ts"
					},
					{
						"path": "local-storage/local-storage-adapter.ts"
					},
					{
						"path": "opfs/opdfs-adapter.ts"
					},
					{
						"path": "supabase/helper.ts"
					},
					{
						"path": "supabase/supabase-adapter.ts"
					}
				]
			}
		]
	},
	{
		"name": "browser-ui",
		"add": "when-added",
		"type": "file-browser",
		"files": [
			{
				"path": "src/lib/components/file-browser/browser-ui",
				"files": [
					{
						"path": "adapter-file-browser.svelte"
					},
					{
						"path": "breadcrumb-recursive.svelte"
					},
					{
						"path": "data-table-name-button.svelte"
					},
					{
						"path": "data-table.svelte"
					},
					{
						"path": "file-browser-actions.svelte"
					},
					{
						"path": "file-browser-grid-item.svelte"
					},
					{
						"path": "file-browser-item-icon.svelte"
					},
					{
						"path": "file-browser.svelte"
					},
					{
						"path": "file-upload.svelte"
					},
					{
						"path": "move-copy-dialog.svelte"
					}
				]
			}
		]
	},
	{
		"name": "browser-utils",
		"add": "when-added",
		"type": "file-browser",
		"files": [
			{
				"path": "src/lib/components/file-browser/browser-utils",
				"files": [
					{
						"path": "explorer-node-functions.ts"
					},
					{
						"path": "file-tree.svelte.ts"
					},
					{
						"path": "types.svelte.ts"
					}
				]
			}
		]
	},
	{
		"name": "breadcrumb",
		"add": "when-needed",
		"type": "ui",
		"files": [
			{
				"path": "src/lib/components/ui/breadcrumb",
				"files": [
					{
						"path": "breadcrumb-ellipsis.svelte"
					},
					{
						"path": "breadcrumb-item.svelte"
					},
					{
						"path": "breadcrumb-link.svelte"
					},
					{
						"path": "breadcrumb-list.svelte"
					},
					{
						"path": "breadcrumb-page.svelte"
					},
					{
						"path": "breadcrumb-separator.svelte"
					},
					{
						"path": "breadcrumb.svelte"
					},
					{
						"path": "index.ts"
					}
				]
			}
		]
	},
	{
		"name": "button",
		"add": "when-needed",
		"type": "ui",
		"files": [
			{
				"path": "src/lib/components/ui/button",
				"files": [
					{
						"path": "button.svelte"
					},
					{
						"path": "index.ts"
					}
				]
			}
		]
	},
	{
		"name": "checkbox",
		"add": "when-needed",
		"type": "ui",
		"files": [
			{
				"path": "src/lib/components/ui/checkbox",
				"files": [
					{
						"path": "checkbox.svelte"
					},
					{
						"path": "index.ts"
					}
				]
			}
		]
	},
	{
		"name": "data-table",
		"add": "when-needed",
		"type": "ui",
		"files": [
			{
				"path": "src/lib/components/ui/data-table",
				"files": [
					{
						"path": "data-table.svelte.ts"
					},
					{
						"path": "flex-render.svelte"
					},
					{
						"path": "index.ts"
					},
					{
						"path": "render-helpers.ts"
					}
				]
			}
		]
	},
	{
		"name": "dialog",
		"add": "when-needed",
		"type": "ui",
		"files": [
			{
				"path": "src/lib/components/ui/dialog",
				"files": [
					{
						"path": "dialog-close.svelte"
					},
					{
						"path": "dialog-content.svelte"
					},
					{
						"path": "dialog-description.svelte"
					},
					{
						"path": "dialog-footer.svelte"
					},
					{
						"path": "dialog-header.svelte"
					},
					{
						"path": "dialog-overlay.svelte"
					},
					{
						"path": "dialog-title.svelte"
					},
					{
						"path": "dialog-trigger.svelte"
					},
					{
						"path": "index.ts"
					}
				]
			}
		]
	},
	{
		"name": "dropdown-menu",
		"add": "when-needed",
		"type": "ui",
		"files": [
			{
				"path": "src/lib/components/ui/dropdown-menu",
				"files": [
					{
						"path": "dropdown-menu-checkbox-item.svelte"
					},
					{
						"path": "dropdown-menu-content.svelte"
					},
					{
						"path": "dropdown-menu-group-heading.svelte"
					},
					{
						"path": "dropdown-menu-group.svelte"
					},
					{
						"path": "dropdown-menu-item.svelte"
					},
					{
						"path": "dropdown-menu-label.svelte"
					},
					{
						"path": "dropdown-menu-radio-group.svelte"
					},
					{
						"path": "dropdown-menu-radio-item.svelte"
					},
					{
						"path": "dropdown-menu-separator.svelte"
					},
					{
						"path": "dropdown-menu-shortcut.svelte"
					},
					{
						"path": "dropdown-menu-sub-content.svelte"
					},
					{
						"path": "dropdown-menu-sub-trigger.svelte"
					},
					{
						"path": "dropdown-menu-trigger.svelte"
					},
					{
						"path": "index.ts"
					}
				]
			}
		]
	},
	{
		"name": "file-drop-zone",
		"add": "when-needed",
		"type": "ui",
		"files": [
			{
				"path": "src/lib/components/ui/file-drop-zone",
				"files": [
					{
						"path": "file-drop-zone.svelte"
					},
					{
						"path": "index.ts"
					}
				]
			}
		]
	},
	{
		"name": "input",
		"add": "when-needed",
		"type": "ui",
		"files": [
			{
				"path": "src/lib/components/ui/input",
				"files": [
					{
						"path": "index.ts"
					},
					{
						"path": "input.svelte"
					}
				]
			}
		]
	},
	{
		"name": "popover",
		"add": "when-needed",
		"type": "ui",
		"files": [
			{
				"path": "src/lib/components/ui/popover",
				"files": [
					{
						"path": "index.ts"
					},
					{
						"path": "popover-content.svelte"
					},
					{
						"path": "popover-trigger.svelte"
					}
				]
			}
		]
	},
	{
		"name": "scroll-area",
		"add": "when-needed",
		"type": "ui",
		"files": [
			{
				"path": "src/lib/components/ui/scroll-area",
				"files": [
					{
						"path": "index.ts"
					},
					{
						"path": "scroll-area-scrollbar.svelte"
					},
					{
						"path": "scroll-area.svelte"
					}
				]
			}
		]
	},
	{
		"name": "table",
		"add": "when-needed",
		"type": "ui",
		"files": [
			{
				"path": "src/lib/components/ui/table",
				"files": [
					{
						"path": "index.ts"
					},
					{
						"path": "table-body.svelte"
					},
					{
						"path": "table-caption.svelte"
					},
					{
						"path": "table-cell.svelte"
					},
					{
						"path": "table-footer.svelte"
					},
					{
						"path": "table-head.svelte"
					},
					{
						"path": "table-header.svelte"
					},
					{
						"path": "table-row.svelte"
					},
					{
						"path": "table.svelte"
					}
				]
			}
		]
	}
]
    },
	registries: [
	"@ieedan/shadcn-svelte-extras"
],
	paths: {
	"*": "$lib/blocks",
	"ui": "$lib/components/ui",
	"hooks": "$lib/hooks",
	"actions": "$lib/actions",
	"utils": "$lib/utils"
},
	transforms: [prettier()],
});