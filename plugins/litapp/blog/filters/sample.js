/*\
title: $:/plugins/litapp/blog/filters/sample.js
type: application/javascript
module-type: filteroperator

Filter operator that returns a random sample of the input titles.
Usage: [sample[5]]

\*/
(function(){

"use strict";

exports.sample = function(source,operator,options) {
	var results = [],
		count = parseInt(operator.operand) || 1;

	source(function(tiddler,title) {
		results.push(title);
	});

	// Shuffle results (Fisher-Yates)
	for (var i = results.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = results[i];
		results[i] = results[j];
		results[j] = temp;
	}

	return results.slice(0,count);
};

})();
