const path = require('path');
const assign = require('object-assign');
const PluginError = require('plugin-error');
const fancyLog = require('fancy-log');
const colors = require('ansi-colors');
const chokidar = require('chokidar');
const {Duplex} = require('readable-stream');
const vinyl = require('vinyl-file');
const File = require('vinyl');
const anymatch = require('anymatch');
const pathIsAbsolute = require('path-is-absolute');
const globParent = require('glob-parent');
const normalize = require('normalize-path');

function normalizeGlobs(globs) {
	if (!globs) {
		throw new PluginError('gulp-watch', 'glob argument required');
	}

	if (typeof globs === 'string') {
		globs = [globs];
	}

	if (!Array.isArray(globs)) {
		throw new PluginError(
			'gulp-watch',
			`glob should be String or Array, not ${typeof globs}`
		);
	}

	return globs;
}

function watch(globs, opts, cb) {
	const originalGlobs = globs;
	globs = normalizeGlobs(globs);

	if (typeof opts === 'function') {
		cb = opts;
		opts = {};
	}

	opts = assign({}, watch._defaultOptions, opts);
	cb = cb || {function() {}};

	const resolveFilepath = (filepath) => {
		if (pathIsAbsolute(filepath)) {
			return path.normalize(filepath);
		}

		return path.resolve(opts.cwd || process.cwd(), filepath);
	};

	const resolveGlob = (glob) => {
		let mod = '';

		if (glob[0] === '!') {
			mod = glob[0];
			glob = glob.slice(1);
		}

		return mod + normalize(resolveFilepath(glob));
	};

	globs = globs.map(resolveGlob);

	const baseForced = Boolean(opts.base);
	const outputStream = new Duplex({objectMode: true, allowHalfOpen: true});

	function _write(file, enc, done) {
		cb(file);
		this.push(file);
		done();
	}

	outputStream._write = _write;

	function _read() {}
	outputStream._read = _read();
	const watcher = chokidar.watch(globs, opts);

	opts.events.forEach((ev) => {
		watcher.on(ev, processEvent.bind(undefined, ev));
	});
	[
		'add',
		'change',
		'unlink',
		'addDir',
		'unlinkDir',
		'error',
		'ready',
		'raw'
	].forEach((ev) => {
		watcher.on(ev, outputStream.emit.bind(outputStream, ev));
	});

	function add(newGlobs) {
		const newGlobs2 = normalizeGlobs(newGlobs).map(resolveGlob);
		watcher.add(newGlobs2);
		const pusher = globs.push;
		pusher.apply(globs, newGlobs2);
	}

	outputStream.add = add;

	outputStream.unwatch = watcher.unwatch.bind(watcher);
	outputStream.close = () => {
		watcher.close();
		this.emit('end');
	};

	function processEvent(event, filepath) {
		const fileOpts = assign({}, opts);
		let currentFilepath = resolveFilepath(filepath);

		let glob;
		let checker = false;
		/* Continue regardless of error */
		while (checker) {
			checker =
				!(glob = globs[anymatch(globs, currentFilepath, true)]) &&
				currentFilepath !==
					(currentFilepath = path.dirname(currentFilepath));
		}

		if (!glob) {
			fancyLog.info(
				colors.cyan('[gulp-watch]'),
				`${colors.yellow(
					'Watched unexpected path. This is likely a bug. Please open this link to report the issue:\n'
				)}https://github.com/floatdrop/gulp-watch/issues/new?title=${encodeURIComponent(
					'Watched unexpected filepath'
				)}&body=${encodeURIComponent(
					`Node.js version: \`${process.version} ${
						process.platform
					} ${process.arch}\`\ngulp-watch version: \`${
						require('./package.json').version
					}\`\nGlobs: \`${JSON.stringify(
						originalGlobs
					)}\`\nFilepath: \`${filepath}\`\nEvent: \`${event}\`\nProcess CWD: \`${process.cwd()}\`\nOptions:\n\`\`\`js\n${JSON.stringify(
						opts,
						null,
						2
					)}\n\`\`\``
				)}`
			);

			return;
		}

		if (!baseForced) {
			fileOpts.base = path.normalize(globParent(glob));
		}

		// Do not stat deleted files
		if (event === 'unlink' || event === 'unlinkDir') {
			fileOpts.path = filepath;

			write(event, null, new File(fileOpts));

			return;
		}

		// Workaround for early read
		setTimeout(() => {
			vinyl.read(filepath, fileOpts).then((file) => {
				write(event, null, file);
			});
		}, opts.readDelay);
	}

	function write(event, err, file) {
		const file2 = file;
		if (err) {
			outputStream.emit('error', err);

			return;
		}

		if (opts.verbose) {
			log(event, file2);
		}

		file2.event = event;
		outputStream.push(file2);
		cb(file2);
	}

	function log(event, file) {
		const event2 =
			event[event.length - 1] === 'e' ? `${event}d` : `${event}ed`;

		const msg = [colors.magenta(file.relative), 'was', event2];

		if (opts.name) {
			msg.unshift(`${colors.cyan(opts.name)} saw`);
		}

		fancyLog.info.apply(null, msg);
	}

	return outputStream;
}

// This is not part of the public API as that would lead to global state (singleton) pollution,
// and allow unexpected interference between unrelated modules that make use of gulp-watch.
// This can be useful for unit tests and root application configuration, though.
// Avoid modifying gulp-watch's default options inside a library/reusable package, please.
watch._defaultOptions = {
	events: ['add', 'change', 'unlink'],
	ignoreInitial: true,
	readDelay: 10
};

module.exports = watch;
