var msgFormatParser = require("./msgFormatParser");
var msgFormatter = require('./msgFormatter');
var b = require('bobril');
var jsonp_1 = require('./jsonp');
var localeDataStorage = require('./localeDataStorage');
function newMap() {
    return Object.create(null);
}
var cfg = { defaultLocale: "en-US", pathToTranslation: function () { return null; } };
var loadedLocales = newMap();
var registeredTranslations = newMap();
var initWasStarted = false;
var currentLocale = '';
var currentTranslations = [];
var currentCachedFormat = [];
var stringCachedFormats = newMap();
var momentInstance;
if (window.g11nPath) {
    cfg.pathToTranslation = window.g11nPath;
}
if (window.g11nLoc) {
    cfg.defaultLocale = window.g11nLoc;
}
function currentTranslationMessage(message) {
    var text = currentTranslations[message];
    if (text === undefined) {
        throw new Error('message ' + message + ' is not defined');
    }
    return text;
}
function t(message, params, translationHelp) {
    if (currentLocale.length === 0) {
        throw new Error('before using t you need to wait for initialization of g11n');
    }
    var format;
    if (typeof message === 'number') {
        if (params == null) {
            return currentTranslationMessage(message);
        }
        format = currentCachedFormat[message];
        if (format === undefined) {
            var ast = msgFormatParser.parse(currentTranslationMessage(message));
            if (ast.type === 'error') {
                throw new Error('message ' + message + ' in ' + currentLocale + ' has error: ' + ast.msg);
            }
            format = msgFormatter.compile(currentLocale, ast);
            currentCachedFormat[message] = format;
        }
    }
    else {
        if (params == null)
            return message;
        format = stringCachedFormats[message];
        if (format === undefined) {
            var ast = msgFormatParser.parse(message);
            if (ast.type === 'error') {
                throw new Error('message "' + message + '" has error: ' + ast.msg + ' on position: ' + ast.pos);
            }
            format = msgFormatter.compile(currentLocale, ast);
            stringCachedFormats[message] = format;
        }
    }
    return format(params);
}
exports.t = t;
function f(message, params) {
    return t(message, params);
}
exports.f = f;
var initPromise = Promise.resolve(null);
initPromise = initPromise.then(function () { return setLocale(cfg.defaultLocale); });
b.setBeforeInit(function (cb) {
    initPromise.then(cb);
});
function initGlobalization(config) {
    if (initWasStarted) {
        throw new Error('initLocalization must be called only once');
    }
    b.assign(cfg, config);
    initWasStarted = true;
    if (currentLocale.length !== 0) {
        if (!loadedLocales[currentLocale]) {
            currentLocale = "";
        }
        return setLocale(cfg.defaultLocale);
    }
    return initPromise;
}
exports.initGlobalization = initGlobalization;
function setLocale(locale) {
    var prom = Promise.resolve(null);
    if (currentLocale === locale)
        return prom;
    if (!loadedLocales[locale]) {
        var pathToTranslation = cfg.pathToTranslation;
        if (pathToTranslation) {
            var p = pathToTranslation(locale);
            if (p) {
                prom = prom.then(function () {
                    return jsonp_1.jsonp(p);
                });
            }
        }
    }
    prom = prom.then(function () {
        currentLocale = locale;
        currentTranslations = registeredTranslations[locale] || [];
        currentCachedFormat = [];
        currentCachedFormat.length = currentTranslations.length;
        stringCachedFormats = newMap();
        momentInstance = window.moment().invalid().locale(currentLocale);
        b.ignoreShouldChange();
    });
    return prom;
}
exports.setLocale = setLocale;
function getLocale() {
    return currentLocale;
}
exports.getLocale = getLocale;
function getMoment() {
    return momentInstance.clone();
}
exports.getMoment = getMoment;
function registerTranslations(locale, localeDefs, msgs) {
    if (Array.isArray(localeDefs)) {
        if (localeDefs.length >= 1)
            localeDataStorage.setPluralRule(locale, localeDefs[0]);
    }
    if (Array.isArray(msgs))
        registeredTranslations[locale] = msgs;
    loadedLocales[locale] = true;
}
exports.registerTranslations = registerTranslations;
if (window)
    window['bobrilRegisterTranslations'] = registerTranslations;
