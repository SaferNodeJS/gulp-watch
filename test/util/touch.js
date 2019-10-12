const fs = require('fs');

const touch = (path, content, cb) => {
	if (typeof content === 'function') {
		cb = content;
		content = undefined;
	}

	const nullFunc = () => {};
	cb = cb || nullFunc;

	return () => {
		fs.writeFileSync(path, content || 'wadap');
		cb();
	};
};

module.exports = touch;
