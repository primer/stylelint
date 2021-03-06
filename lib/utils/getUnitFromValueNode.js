/* @flow */
'use strict';

const blurInterpolation = require('./blurInterpolation');
const isStandardSyntaxValue = require('./isStandardSyntaxValue');
const valueParser = require('postcss-value-parser');

/**
 * Get unit from value node
 *
 * Returns `null` if the unit is not found.
 */
module.exports = function(node /*: Object*/) /*: ?string*/ {
	if (!node || (node && !node.value)) {
		return null;
	}

	// Ignore non-word nodes
	if (node.type !== 'word') {
		return null;
	}

	// Ignore non standard syntax
	if (!isStandardSyntaxValue(node.value)) {
		return null;
	}

	// Ignore HEX
	if (node.value[0] === '#') {
		return null;
	}

	// Remove non standard stuff
	const value = blurInterpolation(node.value, '')
		// ignore hack unit
		.replace('\\0', '')
		.replace('\\9', '');

	const parsedUnit = valueParser.unit(value);

	if (!parsedUnit) {
		return null;
	}

	return parsedUnit.unit;
};
