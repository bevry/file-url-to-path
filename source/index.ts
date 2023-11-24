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
	// file:/path (no hostname)
	// file://hostname/path
	// file:///path (empty hostname)

	// https://nodejs.org/api/url.html#urlfileurltopathurl
	// file:///C:/path/' => C:\path\ (Windows)
	// file://nas/foo.txt => \\nas\foo.txt (Windows)
	// file:///你好.txt => /你好.txt (POSIX)
	// file:///hello world => /hello world (POSIX)
	let file
	if (separator === '\\') {
		// is windows
		if (href.startsWith('file:///')) {
			// is full path, e.g. file:///C:/path
			file = href.substring(8)
		} else if (href.startsWith('file://')) {
			// is host path, e.g. file://nas/foo.txt
			file = separator + separator + href.substring(7)
		} else if (href.startsWith('file:/')) {
			// is full path with unknown drive letter
			file = separator + separator + 'localhost' + separator + href.substring(6)
		} else {
			file = href
		}

		// replace slashes with backslashes
		file = file.replace(/[/]/g, separator)
	} else if (separator === '/') {
		// is posix
		if (href.startsWith('file:///')) {
			// is full path, e.g. file:///volume/dir/file.txt
			file = href.substring(7) // keep leading slash
		} else if (href.startsWith('file://')) {
			// is host path, e.g. file://localhost/volume/dir/file.txt
			if (!href.startsWith('file://localhost/')) {
				const error = new Error(
					'File URL host must be "localhost" or empty'
				) as any
				error.code = 'ERR_INVALID_FILE_URL_HOST'
				throw error
			}
			file = href.substring(16) // keep leading slash
		} else if (href.startsWith('file:/')) {
			// is full path, e.g. file:/volume/dir/file.txt
			file = href.substring(5) // keep leading slash
		} else {
			file = href
		}
	} else {
		file = href
	}
	return file
}
