import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../../schema";
import type { Folder } from "./types.svelte";

export async function getAllFilesAndConvertToTree(
    supabase: SupabaseClient<Database>
) {
    const { data, error } = await supabase
        .schema('storage')
        .from('objects')
        .select(`pathTokens: path_tokens,
            size: metadata->>size,
            mimetype: metadata->>mimetype,
            updatedAt: metadata->>updated_at
            `)
        .eq('bucket_id', 'folders');

    if (error) {
        console.error(error);
        return { data: null, error };
    }

    const filePathList = data!
        .filter(Boolean)
        .map((row) => ({
            pathTokens: row.pathTokens as string[],
            fileData: {
                size: Number.parseInt(row.size),
                mimetype: row.mimetype,
                updatedAt: new Date(row.updatedAt)
            }
        }));

    const buildRoot = buildTree(filePathList);
    return { data: convertToArray(buildRoot, null) as Folder, error: null };
}
