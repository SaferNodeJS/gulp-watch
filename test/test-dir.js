/* global describe, it, afterEach */

const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const watch = require('..');
const touch = require('./util/touch');
require('should');

function fixtures(glob) {
	return path.join(__dirname, 'fixtures', glob);
}

describe('dir', function () {
	let w;

	afterEach(function (done) {
		w.on('end', function () {
			rimraf.sync(fixtures('newDir'));
			done();
		});
		w.close();
	});

	it('should watch files inside directory', function (done) {
		fs.mkdirSync(fixtures('newDir'));
		touch(fixtures('newDir/index.js'))();
		w = watch(fixtures('newDir'), function (file) {
			file.relative.should.eql(path.normalize('newDir/index.js'));
			done();
		}).on('ready', function () {
			touch(fixtures('newDir/index.js'))('new content');
		});
	});

	it('should watch directory creation');

	it('should watch directory removal');
});
