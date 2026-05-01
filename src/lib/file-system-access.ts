import { defineErrors, extractErrorMessage, type InferErrors } from 'wellcrafted/error';
import { Ok, type Result } from 'wellcrafted/result';

type FsOperation =
	| 'pickDirectory'
	| 'list'
	| 'openDir'
	| 'ensureDir'
	| 'openFile'
	| 'ensureFile'
	| 'read'
	| 'readText'
	| 'remove'
	| 'snapshot'
	| 'metadata'
	| 'text'
	| 'arrayBuffer'
	| 'write';

type FsCause = {
	name?: string;
	message: string;
};

export type FsEntry = {
	name: string;
	kind: 'file' | 'directory';
};

export type FsWriteOptions = {
	mode?: 'siloed' | 'exclusive';
};

export type FsFileMetadata = {
	name: string;
	size: number;
	type: string;
	lastModified: number;
};

export const FsError = defineErrors({
	Unsupported: () => ({
		message: 'The File System Access API is not available in this environment.'
	}),

	Cancelled: ({ operation, cause }: { operation: FsOperation; cause: FsCause }) => ({
		message: `Cancelled filesystem operation: ${operation}.`,
		operation,
		cause
	}),

	PermissionDenied: ({
		operation,
		path,
		cause
	}: {
		operation: FsOperation;
		path?: string;
		cause: FsCause;
	}) => ({
		message: `Permission denied during ${operation}${path ? `: ${path}` : ''}.`,
		operation,
		path,
		cause
	}),

	NotFound: ({
		operation,
		path,
		cause
	}: {
		operation: FsOperation;
		path?: string;
		cause: FsCause;
	}) => ({
		message: `Filesystem entry not found${path ? `: ${path}` : ''}.`,
		operation,
		path,
		cause
	}),

	WrongKind: ({
		operation,
		path,
		expected,
		cause
	}: {
		operation: FsOperation;
		path?: string;
		expected?: 'file' | 'directory';
		cause: FsCause;
	}) => ({
		message: expected
			? `Expected a ${expected}${path ? ` at ${path}` : ''}.`
			: `Filesystem entry has the wrong kind${path ? ` at ${path}` : ''}.`,
		operation,
		path,
		expected,
		cause
	}),

	Locked: ({
		operation,
		path,
		cause
	}: {
		operation: FsOperation;
		path?: string;
		cause: FsCause;
	}) => ({
		message: `Filesystem entry is locked during ${operation}${path ? `: ${path}` : ''}.`,
		operation,
		path,
		cause
	}),

	InvalidPath: ({
		operation,
		path,
		reason
	}: {
		operation: FsOperation;
		path: string;
		reason: string;
	}) => ({
		message: `Invalid filesystem path for ${operation}: ${path}. ${reason}`,
		operation,
		path,
		reason
	}),

	Failed: ({
		operation,
		path,
		cause
	}: {
		operation: FsOperation;
		path?: string;
		cause: FsCause;
	}) => ({
		message: `Filesystem operation failed: ${operation}${path ? ` ${path}` : ''}: ${cause.message}`,
		operation,
		path,
		cause
	})
});

export type FsError = InferErrors<typeof FsError>;

type DirectoryPicker = (options?: {
	mode?: 'read' | 'readwrite';
}) => Promise<FileSystemDirectoryHandle>;

function causeInfo(cause: unknown): FsCause {
	const name =
		cause && typeof cause === 'object' && 'name' in cause
			? String((cause as { name: unknown }).name)
			: undefined;

	return {
		name,
		message: extractErrorMessage(cause)
	};
}

function toFsError({
	operation,
	path,
	expected,
	cause
}: {
	operation: FsOperation;
	path?: string;
	expected?: 'file' | 'directory';
	cause: unknown;
}): Result<never, FsError> {
	const serialized = causeInfo(cause);

	switch (serialized.name) {
		case 'AbortError':
			return operation === 'pickDirectory'
				? FsError.Cancelled({ operation, cause: serialized })
				: FsError.Failed({ operation, path, cause: serialized });

		case 'NotAllowedError':
		case 'SecurityError':
			return FsError.PermissionDenied({ operation, path, cause: serialized });

		case 'NotFoundError':
			return FsError.NotFound({ operation, path, cause: serialized });

		case 'TypeMismatchError':
			return FsError.WrongKind({
				operation,
				path,
				expected,
				cause: serialized
			});

		case 'NoModificationAllowedError':
			return FsError.Locked({ operation, path, cause: serialized });

		default:
			return FsError.Failed({ operation, path, cause: serialized });
	}
}

async function wrapFs<T>(
	context: {
		operation: FsOperation;
		path?: string;
		expected?: 'file' | 'directory';
	},
	fn: () => Promise<T>
): Promise<Result<T, FsError>> {
	try {
		return Ok(await fn());
	} catch (cause) {
		return toFsError({ ...context, cause });
	}
}

function parsePath(operation: FsOperation, path: string): Result<string[], FsError> {
	const normalized = path.replace(/\\/g, '/');

	if (normalized.length === 0) {
		return FsError.InvalidPath({
			operation,
			path,
			reason: 'Path must not be empty.'
		});
	}

	if (normalized.startsWith('/') || /^[a-zA-Z]:/.test(normalized)) {
		return FsError.InvalidPath({
			operation,
			path,
			reason: 'Use a relative path, not an absolute path.'
		});
	}

	if (normalized.includes('\0')) {
		return FsError.InvalidPath({
			operation,
			path,
			reason: 'Path must not contain null bytes.'
		});
	}

	const parts = normalized.split('/');

	if (parts.some((part) => part === '' || part === '.' || part === '..')) {
		return FsError.InvalidPath({
			operation,
			path,
			reason: "Path segments must not be empty, '.', or '..'."
		});
	}

	return Ok(parts);
}

function getDirectoryPicker(): DirectoryPicker | undefined {
	if (typeof window === 'undefined') return undefined;

	const maybeWindow = window as Window & {
		showDirectoryPicker?: DirectoryPicker;
	};

	return maybeWindow.showDirectoryPicker?.bind(window);
}

export async function pickDirectory(options?: {
	mode?: 'read' | 'readwrite';
}): Promise<Result<FsDir, FsError>> {
	const picker = getDirectoryPicker();

	if (!picker) {
		return FsError.Unsupported();
	}

	return wrapFs({ operation: 'pickDirectory' }, async () => {
		const handle = await picker({
			mode: options?.mode ?? 'readwrite'
		});

		return new FsDir(handle);
	});
}

export class FsFile {
	constructor(
		public readonly handle: FileSystemFileHandle,
		public readonly path?: string
	) {}

	get name(): string {
		return this.handle.name;
	}

	async snapshot(): Promise<Result<File, FsError>> {
		return wrapFs(
			{
				operation: 'snapshot',
				path: this.path,
				expected: 'file'
			},
			() => this.handle.getFile()
		);
	}

	async metadata(): Promise<Result<FsFileMetadata, FsError>> {
		const file = await this.snapshot();
		if (file.error) return file;

		return Ok({
			name: file.data.name,
			size: file.data.size,
			type: file.data.type,
			lastModified: file.data.lastModified
		});
	}

	async text(): Promise<Result<string, FsError>> {
		const file = await this.snapshot();
		if (file.error) return file;

		return wrapFs(
			{
				operation: 'text',
				path: this.path,
				expected: 'file'
			},
			() => file.data.text()
		);
	}

	async arrayBuffer(): Promise<Result<ArrayBuffer, FsError>> {
		const file = await this.snapshot();
		if (file.error) return file;

		return wrapFs(
			{
				operation: 'arrayBuffer',
				path: this.path,
				expected: 'file'
			},
			() => file.data.arrayBuffer()
		);
	}

	async write(
		data: FileSystemWriteChunkType,
		options?: FsWriteOptions
	): Promise<Result<void, FsError>> {
		return wrapFs(
			{
				operation: 'write',
				path: this.path,
				expected: 'file'
			},
			async () => {
				let stream: FileSystemWritableFileStream | undefined;

				try {
					stream = await this.handle.createWritable(
						options?.mode ? ({ mode: options.mode } as FileSystemCreateWritableOptions) : undefined
					);
					await stream.write(data);
					await stream.close();
				} catch (cause) {
					await stream?.abort().catch(() => undefined);
					throw cause;
				}
			}
		);
	}
}

export class FsDir {
	constructor(public readonly handle: FileSystemDirectoryHandle) {}

	async list(path?: string): Promise<Result<FsEntry[], FsError>> {
		const dir = path ? await this.dirHandle('list', path) : Ok(this.handle);
		if (dir.error) return dir;

		return wrapFs(
			{
				operation: 'list',
				path,
				expected: 'directory'
			},
			async () => {
				const entries: FsEntry[] = [];

				for await (const [name, handle] of dir.data.entries()) {
					entries.push({
						name,
						kind: handle.kind
					});
				}

				return entries;
			}
		);
	}

	async openDir(path: string): Promise<Result<FsDir, FsError>> {
		const handle = await this.dirHandle('openDir', path);
		if (handle.error) return handle;

		return Ok(new FsDir(handle.data));
	}

	async ensureDir(path: string): Promise<Result<FsDir, FsError>> {
		const handle = await this.dirHandle('ensureDir', path, {
			create: true
		});
		if (handle.error) return handle;

		return Ok(new FsDir(handle.data));
	}

	async openFile(path: string): Promise<Result<FsFile, FsError>> {
		return this.file(path, { create: false });
	}

	async ensureFile(path: string): Promise<Result<FsFile, FsError>> {
		return this.file(path, { create: true });
	}

	async read(path: string): Promise<Result<File, FsError>> {
		const file = await this.openFile(path);
		if (file.error) return file;

		return wrapFs(
			{
				operation: 'read',
				path,
				expected: 'file'
			},
			() => file.data.handle.getFile()
		);
	}

	async readText(path: string): Promise<Result<string, FsError>> {
		const file = await this.openFile(path);
		if (file.error) return file;

		return file.data.text();
	}

	async write(
		path: string,
		data: FileSystemWriteChunkType,
		options?: FsWriteOptions
	): Promise<Result<void, FsError>> {
		const file = await this.ensureFile(path);
		if (file.error) return file;

		return file.data.write(data, options);
	}

	async remove(path: string, options?: { recursive?: boolean }): Promise<Result<void, FsError>> {
		const parent = await this.parentOf('remove', path);
		if (parent.error) return parent;

		return wrapFs(
			{
				operation: 'remove',
				path
			},
			async () => {
				await parent.data.dir.removeEntry(parent.data.name, {
					recursive: options?.recursive ?? false
				});
			}
		);
	}

	private async dirHandle(
		operation: FsOperation,
		path: string,
		options?: { create?: boolean }
	): Promise<Result<FileSystemDirectoryHandle, FsError>> {
		const parsed = parsePath(operation, path);
		if (parsed.error) return parsed;

		return wrapFs(
			{
				operation,
				path,
				expected: 'directory'
			},
			async () => {
				let dir = this.handle;

				for (const part of parsed.data) {
					dir = await dir.getDirectoryHandle(part, options?.create ? { create: true } : undefined);
				}

				return dir;
			}
		);
	}

	private async file(path: string, options: { create: boolean }): Promise<Result<FsFile, FsError>> {
		const operation = options.create ? 'ensureFile' : 'openFile';
		const parent = await this.parentOf(operation, path);
		if (parent.error) return parent;

		return wrapFs(
			{
				operation,
				path,
				expected: 'file'
			},
			async () => {
				const handle = await parent.data.dir.getFileHandle(parent.data.name, {
					create: options.create
				});

				return new FsFile(handle, path);
			}
		);
	}

	private async parentOf(
		operation: FsOperation,
		path: string
	): Promise<
		Result<
			{
				dir: FileSystemDirectoryHandle;
				name: string;
			},
			FsError
		>
	> {
		const parsed = parsePath(operation, path);
		if (parsed.error) return parsed;

		const parts = parsed.data;
		const name = parts[parts.length - 1];
		const parentParts = parts.slice(0, -1);

		return wrapFs(
			{
				operation,
				path,
				expected: 'directory'
			},
			async () => {
				let dir = this.handle;

				for (const part of parentParts) {
					dir = await dir.getDirectoryHandle(part);
				}

				return { dir, name };
			}
		);
	}
}
