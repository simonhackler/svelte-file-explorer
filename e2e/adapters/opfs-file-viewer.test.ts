import { OPFSStorageService } from '../opfs-storage-service';
import { createFileViewerTests } from '../file-viewer-test-helpers';

const opfsStorageService = new OPFSStorageService('/');

createFileViewerTests(opfsStorageService, 'OPFS Storage Service');