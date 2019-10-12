/* global describe, it */

const { join } = require('path');
const watch = require('..');
require('should');

function fixtures(glob) {
	return join(__dirname, 'fixtures', glob);
}

describe('opts', function () {
	it('should not mutate the options object', function () {
		const opts = {};
		watch(fixtures('index.js'), opts).close();
		opts.should.have.keys([]);
	});
});
