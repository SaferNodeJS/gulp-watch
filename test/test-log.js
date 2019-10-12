/* global beforeEach, afterEach, describe, it */

const proxyquire = require('proxyquire');

const fancyLogStub = {
	info() {},
};
const watch = proxyquire('..', {
	'fancy-log': fancyLogStub,
});
const sinon = require('sinon');

const path = require('path');
const strip = require('strip-ansi');
const touch = require('./util/touch');

require('should');

function fixtures(glob) {
	return path.join(__dirname, 'fixtures', glob);
}

describe('log', function () {
	let w;

	beforeEach(function () {
		sinon.spy(fancyLogStub, 'info');
	});

	afterEach(function (done) {
		fancyLogStub.info.restore();
		w.on('end', done);
		w.close();
	});

	it('should print file name', function (done) {
		w = watch(fixtures('*.js'), { verbose: true });
		w.once('data', function () {
			fancyLogStub.info.calledOnce.should.be.eql(true);
			strip(fancyLogStub.info.firstCall.args.join(' ')).should.eql(
				'index.js was changed',
			);
			done();
		}).on('ready', touch(fixtures('index.js')));
	});

	it('should print relative file name', function (done) {
		w = watch(fixtures('**/*.js'), { verbose: true });
		w.once('data', function () {
			strip(fancyLogStub.info.firstCall.args.join(' ')).should.eql(
				`${path.normalize('folder/index.js')} was changed`,
			);
			done();
		}).on('ready', touch(fixtures('folder/index.js')));
	});

	it('should print custom watcher name', function (done) {
		w = watch(fixtures('*.js'), { name: 'Watch', verbose: true });
		w.once('data', function () {
			fancyLogStub.info.calledOnce.should.be.eql(true);
			strip(fancyLogStub.info.firstCall.args.join(' ')).should.eql(
				'Watch saw index.js was changed',
			);
			done();
		}).on('ready', touch(fixtures('index.js')));
	});
});
