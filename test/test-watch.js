/* global describe, it */

const { join } = require('path')
const watch = require('..')
require('should')

function fixtures(glob) {
	return join(__dirname, 'fixtures', glob)
}

describe('watch', function() {
	it('should throw on invalid glob argument', function() {
		;(function() {
			watch()
		}.should.throw())
		;(function() {
			watch(1)
		}.should.throw())
		;(function() {
			watch({})
		}.should.throw())
	})

	it('should return passThrough stream', function(done) {
		const stream = watch(fixtures('*.js'))
		stream.on('data', function(obj) {
			obj.should.be.eql(1)
			stream.on('end', done)
			stream.close()
		})
		stream.write(1)
	})
})
