/* global describe, it, afterEach */

const { join } = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const touch = require('./util/touch');
const watch = require('..');
require('should');

function fixtures (glob) {
	return join(__dirname, 'fixtures', glob);
}

describe('stream', () => {
	let w;

	afterEach((done) => {
		w.on('end', () => {
			rimraf.sync(fixtures('new.js'));
			done();
		});
		w.close();
	});

	it('should emit ready and end', (done) => {
		w = watch(fixtures('*.js'));
		w.on('ready', () => {
			done();
		});
	});

	it('should emit added file', function(done) {
		w = watch('test/fixtures/*.js');
		w.on('data', function(file) {
			file.relative.should.eql('new.js');
			file.event.should.eql('add');
			done();
		}).on('ready', touch(fixtures('new.js')));
	});

	it('should emit change event on file change', function(done) {
		w = watch(fixtures('*.js'));
		w.on('ready', touch(fixtures('index.js')));
		w.on('data', function(file) {
			file.relative.should.eql('index.js');
			done();
		});
	});

	it('should emit changed file with stream contents', function(done) {
		w = watch(fixtures('*.js'), { buffer: false });
		w.on('data', function(file) {
			file.contents.should.have.property('readable', true);
			done();
		}).on('ready', touch(fixtures('index.js')));
	});

	it('should emit changed file with stats', function(done) {
		w = watch(fixtures('*.js'), { buffer: false });
		w.on('data', function(file) {
			file.should.have.property('stat');
			done();
		}).on('ready', touch(fixtures('index.js')));
	});

	it.skip('should emit deleted file with stats', function(done) {
		touch(fixtures('created.js'), function() {
			w = watch(fixtures('**/*.js'), { buffer: false });
			w.on('data', function(file) {
				file.should.have.property('contents', null);
				done();
			}).on('ready', function() {
				fs.unlinkSync(fixtures('created.js'));
			});
		})();
	});
});
