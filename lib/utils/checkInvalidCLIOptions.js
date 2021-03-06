/* @flow */
'use strict';

const _ = require('lodash');
const EOL = require('os').EOL;
const leven = require('leven');
// $FlowFixMe default export exists, please see ~/node_modules/chalk/index.js
const { default: chalk } = require('chalk');

/*:: type allowedOptionsType = { [key: string]: { alias?: string } }*/

/**
 * @param {{ [key: string]: { alias?: string } }} allowedOptions
 * @return {string[]}
 */
const buildAllowedOptions = (allowedOptions /*: allowedOptionsType */) => {
	let options = Object.keys(allowedOptions);

	options = options.reduce((opts, opt) => {
		const alias = allowedOptions[opt].alias;

		if (alias) {
			opts.push(alias);
		}

		return opts;
	}, options);
	options.sort();

	return options;
};

/**
 * @param {string[]} all
 * @param {string} invalid
 * @return {null|string}
 */
const suggest = (all /*: string[]*/, invalid /*: string*/) => {
	const maxThreshold = 10;

	for (let threshold = 1; threshold <= maxThreshold; threshold++) {
		const suggestion = all.find((option) => leven(option, invalid) <= threshold);

		if (suggestion) {
			return suggestion;
		}
	}

	return null;
};

/**
 * @param {string} opt
 * @return {string}
 */
const cliOption = (opt /*: string*/) =>
	opt.length === 1 ? `"-${opt}"` : `"--${_.kebabCase(opt)}"`;

/**
 * @param {string} invalid
 * @param {string|null} suggestion
 * @return {string}
 */
const buildMessageLine = (invalid /*: string*/, suggestion /*: ?string*/) => {
	let line = `Invalid option ${chalk.red(cliOption(invalid))}.`;

	if (suggestion) {
		line += ` Did you mean ${chalk.cyan(cliOption(suggestion))}?`;
	}

	return line + EOL;
};

/**
 * @param {{ [key: string]: any }} allowedOptions
 * @param {{ [key: string]: any }}inputOptions
 * @return {string}
 */
module.exports = function checkInvalidCLIOptions(
	allowedOptions /*: { [key: string]: any }*/,
	inputOptions /*: { [key: string]: any }*/,
) /*: string*/ {
	const allOptions = buildAllowedOptions(allowedOptions);

	return Object.keys(inputOptions)
		.map((opt) => _.kebabCase(opt))
		.filter((opt) => !allOptions.includes(opt))
		.reduce((msg, invalid) => {
			// NOTE: No suggestion for shortcut options because it's too difficult
			const suggestion = invalid.length >= 2 ? suggest(allOptions, invalid) : null;

			return msg + buildMessageLine(invalid, suggestion);
		}, '');
};
