import { SupabaseStorageService } from '../storage-service';
import { createFileViewerTests } from '../file-viewer-test-helpers';

const supabaseStorageService = new SupabaseStorageService();

createFileViewerTests(supabaseStorageService, 'Supabase Storage Service');