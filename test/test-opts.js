/* global describe, it */

const {join} = require('path');
const watch = require('..');

function fixtures(glob) {
	return join(__dirname, 'fixtures', glob);
}

describe('opts', () => {
	it('should not mutate the options object', () => {
		const opts = {};
		watch(fixtures('index.js'), opts).close();
		opts.should.have.keys([]);
	});
});
