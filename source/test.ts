import { equal } from 'assert-helpers'
import kava from 'kava'

import { sep } from 'path'
import { fileURLToPath as fileURLToPathNode } from 'url'
import fileURLToPath from './index.js'

const fixtures = [
	// posix
	{ args: ['file:/path', '/'], result: '/path' },

	// windows
	{ args: ['file:/c:/path', '\\'], result: 'c:\\path' },
	{ args: ['file:/path', '\\'], errorCode: 'ERR_INVALID_FILE_URL_PATH' },

	// posix
	{ args: ['file://localhost/path', '/'], result: '/path' },
	{
		args: ['file://hostname/path', '/'],
		errorCode: 'ERR_INVALID_FILE_URL_HOST',
	},

	// windows
	{
		args: ['file://localhost/c:/path', '\\'],
		result: 'c:\\path',
	},
	{ args: ['file://hostname/c:/path', '\\'], result: '\\\\hostname\\c:\\path' },
	{
		args: ['file://localhost/path', '\\'],
		errorCode: 'ERR_INVALID_FILE_URL_PATH',
	},
	{
		args: ['file://hostname/path', '\\'],
		result: '\\\\hostname\\path',
	},

	// posix
	{ args: ['file:///path', '/'], result: '/path' },
	// windows
	{ args: ['file:///c:/path', '\\'], result: 'c:\\path' },
	{ args: ['file:///path', '\\'], errorCode: 'ERR_INVALID_FILE_URL_PATH' },

	// failures
	{ args: ['/whatever', '/'], errorCode: 'ERR_INVALID_URL' },
	{ args: ['/whatever', '\\'], errorCode: 'ERR_INVALID_URL' },
	{ args: ['c:/whatever', '/'], errorCode: 'ERR_INVALID_URL_SCHEME' },
	{ args: ['c:/whatever', '\\'], errorCode: 'ERR_INVALID_URL_SCHEME' },
	{ args: ['https:/whatever', '\\'], errorCode: 'ERR_INVALID_URL_SCHEME' },
	{ args: ['https:/whatever', '\\'], errorCode: 'ERR_INVALID_URL_SCHEME' },

	// examples
	{ args: ['file:///c:/path/', '\\'], result: 'c:\\path\\' },
	{
		args: ['file://nas/foo.txt', '\\'],
		result: '\\\\nas\\foo.txt',
	},
	{ args: ['file:///你好.txt', '/'], result: '/你好.txt' },
	{ args: ['file:///hello world', '/'], result: '/hello world' },
]
kava.suite('file-url-to-path', function (suite, test) {
	for (const fixture of fixtures) {
		test(JSON.stringify(fixture), function () {
			// our test
			if (fixture.errorCode) {
				let code
				try {
					fileURLToPath(fixture.args[0], fixture.args[1])
				} catch (error: any) {
					code = error.code
				}
				equal(code, fixture.errorCode, 'error code was as expected')
			} else {
				const actual = fileURLToPath(fixture.args[0], fixture.args[1])
				equal(actual, fixture.result, 'result was as expected')
			}
			// node.js test
			if (fixture.args[1] === sep) {
				if (fixture.errorCode) {
					let ourCode, nodeCode
					try {
						fileURLToPath(fixture.args[0], fixture.args[1])
					} catch (error: any) {
						ourCode = error.code
					}
					try {
						fileURLToPathNode(fixture.args[0])
					} catch (error: any) {
						nodeCode = error.code
					}
					equal(ourCode, nodeCode, 'error code was same as Node.js')
				} else {
					const ourResult = fileURLToPath(fixture.args[0], fixture.args[1])
					const nodeResult = fileURLToPathNode(fixture.args[0])
					equal(ourResult, nodeResult, 'result was as same as Node.js')
				}
			}
		})
	}
})
