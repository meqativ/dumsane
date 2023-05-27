(function (exports) {
	'use strict';

	var index = {
	  onLoad() {
	    this.onUnload = vendetta.patcher.before("start", vendetta.metro.findByProps("Timeout").Timeout.prototype, function(args) {
	      if (args[1].name === "disconnect") {
	        args[1] = function() {
	        };
	      }
	      return args;
	    });
	  }
	};

	exports.default = index;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({});
