import { equal } from 'assert-helpers'
import kava from 'kava'

import { sep } from 'path'
import { fileURLToPath as fileURLToPathNode } from 'url'
import fileURLToPath from './index.js'

const fixtures = [
	{ args: ['file:/path', '/'], result: '/path' },
	{ args: ['file:/path', '\\'], result: '\\\\localhost\\path' },

	{ args: ['file://localhost/path', '\\'], result: '\\\\localhost\\path' },
	{ args: ['file://hostname/path', '\\'], result: '\\\\hostname\\path' },
	{ args: ['file://localhost/path', '/'], result: '/path' },
	{
		args: ['file://hostname/path', '/'],
		errorCode: 'ERR_INVALID_FILE_URL_HOST',
	},

	{ args: ['file:///path', '/'], result: '/path' },
	{ args: ['file:///C:/path', '\\'], result: 'C:\\path' },

	{ args: ['/whatever', '/'], errorCode: 'ERR_INVALID_URL' },
	{ args: ['/whatever', '\\'], errorCode: 'ERR_INVALID_URL' },
	{ args: ['C:/whatever', '/'], errorCode: 'ERR_INVALID_URL_SCHEME' },
	{ args: ['C:/whatever', '\\'], errorCode: 'ERR_INVALID_URL_SCHEME' },
	{ args: ['https:/whatever', '\\'], errorCode: 'ERR_INVALID_URL_SCHEME' },
	{ args: ['https:/whatever', '\\'], errorCode: 'ERR_INVALID_URL_SCHEME' },

	// examples

	{ args: ['file:///C:/path/', '\\'], result: 'C:\\path\\' },
	{ args: ['file://nas/foo.txt', '\\'], result: '\\\\nas\\foo.txt' },
	{ args: ['file:///你好.txt', '/'], result: '/你好.txt' },
	{ args: ['file:///hello world', '/'], result: '/hello world' },
]
kava.suite('file-url-to-path', function (suite, test) {
	for (const fixture of fixtures) {
		test(JSON.stringify(fixture), function () {
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
		})
	}
	if (typeof fileURLToPathNode !== 'undefined') {
		suite('Node.js conformance', function (suite, test) {
			for (const fixture of fixtures) {
				if (fixture.args[1] !== sep) continue
				test(JSON.stringify(fixture), function () {
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
				})
			}
		})
	}
})
