/* global describe, it, afterEach */

const path = require('path');
const should = require('should');
const touch = require('./util/touch');
const watch = require('..');

function fixtures(glob) {
	return path.join(__dirname, 'fixtures', glob);
}

describe('cwd', function () {
	let w;

	afterEach(function (done) {
		w.on('end', done);
		w.close();
	});

	it('should respect opts.cwd', function (done) {
		w = watch('index.js', { cwd: fixtures('') }, function (file) {
			file.relative.should.eql('index.js');
			done();
		}).on('ready', touch(fixtures('index.js')));
	});

	it('should emit file outside opts.cwd using relative glob', function (done) {
		w = watch('../index.js', { cwd: fixtures('folder') }, function (file) {
			file.relative.should.eql('index.js');
			file.contents.toString().should.equal('fixtures index');
			done();
		}).on('ready', touch(fixtures('index.js'), 'fixtures index'));
	});

	it('should emit file outside opts.cwd using absolute glob', function (done) {
		w = watch(fixtures('index.js'), { cwd: fixtures('folder') }, function (
			file,
		) {
			file.relative.should.eql('index.js');
			file.contents.toString().should.equal('fixtures index');
			done();
		}).on('ready', touch(fixtures('index.js'), 'fixtures index'));
	});

	it('should normalized reported paths with non-normalized cwd and non-normalized relative glob', function (done) {
		w = watch(
			'../fixtures/index.js',
			{ cwd: fixtures('../util') },
			function (file) {
				file.path.should.eql(fixtures('index.js'));
				done();
			},
		).on('ready', touch(fixtures('index.js'), 'fixtures index'));
	});

	it('should normalized reported paths with non-normalized cwd and non-normalized absolute glob', function (done) {
		w = watch(
			fixtures('../fixtures/index.js'),
			{ cwd: fixtures('../util') },
			function (file) {
				file.path.should.eql(fixtures('index.js'));
				done();
			},
		).on('ready', touch(fixtures('index.js'), 'fixtures index'));
	});

	it('should normalized reported paths with non-normalized relative glob outside implicit cwd', function (done) {
		const cwd = process.cwd();
		process.chdir(fixtures('../util'));
		w = watch('../fixtures/index.js', function (file) {
			process.chdir(cwd);
			file.path.should.eql(fixtures('index.js'));
			done();
		}).on('ready', touch(fixtures('index.js'), 'fixtures index'));
	});

	it('should normalized reported paths with non-normalized absolute glob outside implicit cwd', function (done) {
		const cwd = process.cwd();
		process.chdir(fixtures('../util'));
		w = watch(
			fixtures('../fixtures/index.js'),
			{ cwd: fixtures('../util') },
			function (file) {
				process.chdir(cwd);
				file.path.should.eql(fixtures('index.js'));
				done();
			},
		).on('ready', touch(fixtures('index.js'), 'fixtures index'));
	});
});
