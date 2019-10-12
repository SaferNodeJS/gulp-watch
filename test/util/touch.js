const fs = require('fs');

const touch = function(path, content, cb) {
	if (typeof content === 'function') {
		cb = content;
		content = undefined;
	}

	cb = cb || function() {};

	return function() {
		fs.writeFileSync(path, content || 'wadap');
		cb();
	};
};

module.exports = touch;
