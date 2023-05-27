(function (exports, _vendetta, components) {
    'use strict';

    const { FormText } = components.Forms;
    function Settings() {
      return /* @__PURE__ */ React.createElement(FormText, null, "Hello, world!");
    }

    var index = {
      onLoad: function() {
        _vendetta.logger.log("Hello world!");
      },
      onUnload: function() {
        _vendetta.logger.log("Goodbye, world.");
      },
      settings: Settings
    };

    exports.default = index;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({}, vendetta, vendetta.ui.components);
