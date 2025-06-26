import { LocalStorageService } from '../local-storage-service';
import { createFileViewerTests } from '../file-viewer-test-helpers';

const localStorageService = new LocalStorageService('/home');

createFileViewerTests(localStorageService, 'Local Storage Service');