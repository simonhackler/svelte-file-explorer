import { defineErrors, extractErrorMessage, type InferErrors } from 'wellcrafted/error';
import { Ok, type Result } from 'wellcrafted/result';

export type FsOperation =
	| 'list'
	| 'openDir'
	| 'ensureDir'
	| 'read'
	| 'readText'
	| 'write'
	| 'remove';

export type FsEntry = {
	name: string;
	kind: 'file' | 'directory';
};

export type FsCause = {
	name?: string;
	message: string;
};

export type FsWriteData = FileSystemWriteChunkType | Blob | BufferSource | string;

export const FsError = defineErrors({
	NotFound: ({
		operation,
		path,
		cause
	}: {
		operation: FsOperation;
		path?: string;
		cause?: FsCause;
	}) => ({
		message: `Filesystem entry not found during ${operation}${path ? `: ${path}` : ''}.`,
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
		cause?: FsCause;
	}) => ({
		message: expected
			? `Expected a ${expected}${path ? ` at ${path}` : ''}.`
			: `Filesystem entry has the wrong kind${path ? ` at ${path}` : ''}.`,
		operation,
		path,
		expected,
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
export type FsResult<T> = Result<T, FsError>;

export interface FsDir {
	list(path?: string): Promise<FsResult<FsEntry[]>>;
	openDir(path: string): Promise<FsResult<FsDir>>;
	ensureDir(path: string): Promise<FsResult<FsDir>>;
	read(path: string): Promise<FsResult<File>>;
	readText(path: string): Promise<FsResult<string>>;
	write(path: string, data: FsWriteData): Promise<FsResult<void>>;
	remove(path: string, options?: { recursive?: boolean }): Promise<FsResult<void>>;
}

export type Adapter = FsDir;
export type FileFunctions = FsDir;

export function fsCause(cause: unknown): FsCause {
	const name =
		cause && typeof cause === 'object' && 'name' in cause
			? String((cause as { name: unknown }).name)
			: undefined;

	return {
		name,
		message: extractErrorMessage(cause)
	};
}

export function fsFailed(
	operation: FsOperation,
	cause: unknown,
	path?: string,
	expected?: 'file' | 'directory'
): FsResult<never> {
	const serialized = fsCause(cause);

	if (serialized.name === 'NotFoundError') {
		return FsError.NotFound({ operation, path, cause: serialized });
	}

	if (serialized.name === 'TypeMismatchError') {
		return FsError.WrongKind({ operation, path, expected, cause: serialized });
	}

	return FsError.Failed({
		operation,
		path,
		cause: serialized
	});
}

export async function wrapFs<T>(
	context: {
		operation: FsOperation;
		path?: string;
		expected?: 'file' | 'directory';
	},
	fn: () => Promise<T>
): Promise<FsResult<T>> {
	try {
		return Ok(await fn());
	} catch (cause) {
		return fsFailed(context.operation, cause, context.path, context.expected);
	}
}

export function joinFsPath(...parts: string[]): string {
	return parts
		.flatMap((part) => part.split('/'))
		.filter(Boolean)
		.join('/');
}

export function parseFsPath(operation: FsOperation, path: string): FsResult<string[]> {
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

export function dirname(path: string): string {
	const parts = joinFsPath(path).split('/');
	parts.pop();
	return parts.join('/');
}

export function basename(path: string): string {
	const parts = joinFsPath(path).split('/');
	return parts[parts.length - 1] ?? '';
}

export function entryPath(parent: string | undefined, name: string): string {
	return parent ? joinFsPath(parent, name) : name;
}
