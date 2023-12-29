/**
 * This function ensures the correct decodings of percent-encoded characters as
 * well as ensuring a cross-platform valid absolute path string.
 */
export default function fileURLToPath(href: string, separator: string): string {
	// conform with Node.js fileURLToPath
	if (!href.includes(':/')) {
		const error = new Error('Invalid URL') as any
		error.code = 'ERR_INVALID_URL'
		throw error
	}
	if (!href.startsWith('file:')) {
		const error = new Error('The URL must be of scheme file') as any
		error.code = 'ERR_INVALID_URL_SCHEME'
		throw error
	}

	// https://en.wikipedia.org/wiki/File_URI_scheme#Examples
	// https://nodejs.org/api/url.html#urlfileurltopathurl
	// file:/path (no hostname)
	// file://hostname/path
	// file:///path (empty hostname)
	let file
	if (separator === '\\') {
		// is windows
		if (href.startsWith('file:///')) {
			// is full path, e.g. file:///foo
			file = href.substring(8)
			if (file[1] !== ':') {
				const error = new Error('File URL path must be absolute') as any
				error.code = 'ERR_INVALID_FILE_URL_PATH'
				throw error
			}
		} else if (href.startsWith('file://localhost/')) {
			// is localhost path, e.g. file://localhost/foo
			// conform with Node.js fileURLToPath
			file = href.substring(17) // trim leading slash
			if (file[1] !== ':') {
				const error = new Error('File URL path must be absolute') as any
				error.code = 'ERR_INVALID_FILE_URL_PATH'
				throw error
			}
		} else if (href.startsWith('file://')) {
			// is host path, e.g. file://hostname/foo
			// conform with Node.js fileURLToPath, which does not error
			file = href.substring(7)
			file = separator + separator + file
		} else if (href.startsWith('file:/')) {
			// is full path with unknown drive letter
			// conform with Node.js fileURLToPath
			file = href.substring(6)
			if (file[1] !== ':') {
				const error = new Error('File URL path must be absolute') as any
				error.code = 'ERR_INVALID_FILE_URL_PATH'
				throw error
			}
		} else {
			file = href
		}

		// replace slashes with backslashes
		file = file.replace(/[/]/g, separator)
	} else if (separator === '/') {
		// is posix
		if (href.startsWith('file:///')) {
			// is full path, e.g. file:///foo
			file = href.substring(7) // keep leading slash
		} else if (href.startsWith('file://')) {
			// is host path, e.g. file://localhost/foo
			if (!href.startsWith('file://localhost/')) {
				const error = new Error(
					'File URL host must be "localhost" or empty',
				) as any
				error.code = 'ERR_INVALID_FILE_URL_HOST'
				throw error
			}
			file = href.substring(16) // keep leading slash
		} else if (href.startsWith('file:/')) {
			// is full path, e.g. file:/foo
			file = href.substring(5) // keep leading slash
		} else {
			file = href
		}
	} else {
		file = href
	}
	return file
}
