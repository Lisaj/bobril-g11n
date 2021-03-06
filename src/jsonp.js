"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function jsonp(url) {
    return new Promise(function (r, e) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.charset = 'utf-8';
        script.onload = function () {
            r();
        };
        script.onerror = function (_ev) {
            e('Failed to load ' + url);
        };
        script.src = url;
        document.head.appendChild(script);
    });
}
exports.jsonp = jsonp;
