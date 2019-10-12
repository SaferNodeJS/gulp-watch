/* global describe, it, afterEach */

const path = require('path')
const watch = require('..')
const touch = require('./util/touch')
require('should')

function fixtures(glob) {
	return path.join(__dirname, 'fixtures', glob)
}

describe('base', function() {
	let w

	afterEach(function(done) {
		w.on('end', done)
		w.close()
	})

	it('should be determined by glob', function(done) {
		w = watch(fixtures('**/*.js'), function(file) {
			file.relative.should.eql(path.normalize('folder/index.js'))
			file.base.should.eql(fixtures(''))
			done()
		}).on('ready', touch(fixtures('folder/index.js')))
	})

	it('should be overridden by option', function(done) {
		const explicitBase = fixtures('folder')
		w = watch(fixtures('**/*.js'), { base: explicitBase }, function(file) {
			file.relative.should.eql('index.js')
			file.base.should.eql(explicitBase)
			done()
		}).on('ready', touch(fixtures('folder/index.js')))
	})
})
