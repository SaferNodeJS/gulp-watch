/* global describe, it, afterEach */

const { join } = require('path');
const rimraf = require('rimraf');
const fs = require('fs');
const touch = require('./util/touch');
const watch = require('..');
require('should');

function fixtures(glob) {
	return join(__dirname, 'fixtures', glob);
}

describe('ignore', function () {
	let w;

	afterEach(function (done) {
		w.on('end', function () {
			rimraf.sync(fixtures('temp'));
			done();
		});
		w.close();
	});

	it('should ignore files', function (done) {
		w = watch([fixtures('**/*.ts'), '!**/*.js'], function () {
			done('Ignored file was watched');
		});

		w.on('ready', function () {
			fs.mkdirSync(fixtures('temp'));
			touch(fixtures('temp/index.js'))();
			setTimeout(done, 200);
		});
	});
});
