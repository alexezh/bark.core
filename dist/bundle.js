/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/animator.ts":
/*!*************************!*\
  !*** ./src/animator.ts ***!
  \*************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"NumberProperty\": function() { return /* binding */ NumberProperty; },\n/* harmony export */   \"LinearAnimator\": function() { return /* binding */ LinearAnimator; },\n/* harmony export */   \"LinearAnimator2\": function() { return /* binding */ LinearAnimator2; },\n/* harmony export */   \"LoopLinearAnimator\": function() { return /* binding */ LoopLinearAnimator; },\n/* harmony export */   \"DiscreteAnimator\": function() { return /* binding */ DiscreteAnimator; },\n/* harmony export */   \"PropertyAnimationManager\": function() { return /* binding */ PropertyAnimationManager; },\n/* harmony export */   \"animator\": function() { return /* binding */ animator; }\n/* harmony export */ });\nvar NumberProperty = (function () {\r\n    function NumberProperty(value) {\r\n        this._value = (value !== undefined) ? value : 0;\r\n        this.id = animator.nextId();\r\n    }\r\n    NumberProperty.prototype.glide = function (delta, step) {\r\n        animator.animateLinear(this, delta, step);\r\n    };\r\n    NumberProperty.prototype.add = function (delta) {\r\n        this._value = this._value + delta;\r\n    };\r\n    NumberProperty.prototype.get = function () {\r\n        return this._value;\r\n    };\r\n    NumberProperty.prototype.set = function (value) {\r\n        this._value = value;\r\n    };\r\n    return NumberProperty;\r\n}());\r\n\r\nvar LinearAnimator = (function () {\r\n    function LinearAnimator(prop, delta, step) {\r\n        this.prop = prop;\r\n        this.delta = delta;\r\n        this.step = step;\r\n    }\r\n    LinearAnimator.prototype.animate = function (frameTime) {\r\n        if (this.delta === 0) {\r\n            return false;\r\n        }\r\n        else if (this.delta > 0) {\r\n            if (this.delta > this.step) {\r\n                this.delta -= this.step;\r\n                this.prop.add(this.step);\r\n                return true;\r\n            }\r\n            else {\r\n                this.prop.add(this.delta);\r\n                this.delta = 0;\r\n                return false;\r\n            }\r\n        }\r\n        else {\r\n            if (this.delta < this.step) {\r\n                this.delta -= this.step;\r\n                this.prop.add(this.step);\r\n                return true;\r\n            }\r\n            else {\r\n                this.prop.add(this.delta);\r\n                this.delta = 0;\r\n                return false;\r\n            }\r\n        }\r\n    };\r\n    return LinearAnimator;\r\n}());\r\n\r\nvar LinearAnimator2 = (function () {\r\n    function LinearAnimator2(obj, prop, delta, step) {\r\n        this.obj = obj;\r\n        this.prop = prop;\r\n        this.delta = delta;\r\n        this.step = step;\r\n    }\r\n    LinearAnimator2.prototype.animate = function (frameTime) {\r\n        if (this.delta === 0) {\r\n            return false;\r\n        }\r\n        else if (this.delta > 0) {\r\n            if (this.delta > this.step) {\r\n                this.delta -= this.step;\r\n                this.obj[this.prop] += this.step;\r\n                return true;\r\n            }\r\n            else {\r\n                this.obj[this.prop] += this.delta;\r\n                this.delta = 0;\r\n                return false;\r\n            }\r\n        }\r\n        else {\r\n            if (this.delta < this.step) {\r\n                this.delta -= this.step;\r\n                this.obj[this.prop] += this.step;\r\n                return true;\r\n            }\r\n            else {\r\n                this.obj[this.prop] += this.delta;\r\n                this.delta = 0;\r\n                return false;\r\n            }\r\n        }\r\n    };\r\n    return LinearAnimator2;\r\n}());\r\n\r\nvar LoopLinearAnimator = (function () {\r\n    function LoopLinearAnimator(prop, delta, step) {\r\n        this.prop = prop;\r\n        this.startDelta = Math.abs(delta);\r\n        this.delta = this.startDelta;\r\n        this.step = Math.abs(step);\r\n        this.direction = (delta > 0) ? 1 : -1;\r\n    }\r\n    LoopLinearAnimator.prototype.animate = function (frameTime) {\r\n        if (this.delta > this.step) {\r\n            this.delta -= this.step;\r\n            this.prop.add(this.step * this.direction);\r\n        }\r\n        else {\r\n            this.prop.set(this.delta * this.direction);\r\n            this.delta = this.startDelta;\r\n            this.direction = -this.direction;\r\n        }\r\n        return true;\r\n    };\r\n    return LoopLinearAnimator;\r\n}());\r\n\r\nvar DiscreteAnimator = (function () {\r\n    function DiscreteAnimator(prop, values, intervalSeconds) {\r\n        this.prop = prop;\r\n        this.values = values;\r\n        this.index = 0;\r\n        this.intervalMs = intervalSeconds * 1000;\r\n        this.lastFrameTimeMs = performance.now();\r\n        this.prop.set(this.values[this.index]);\r\n    }\r\n    DiscreteAnimator.prototype.animate = function (frameTime) {\r\n        if (this.lastFrameTimeMs + this.intervalMs > frameTime)\r\n            return true;\r\n        var newIndex = this.index + 1;\r\n        if (newIndex >= this.values.length)\r\n            newIndex = 0;\r\n        this.index = newIndex;\r\n        this.prop.set(this.values[newIndex]);\r\n        this.lastFrameTimeMs = frameTime;\r\n        return true;\r\n    };\r\n    return DiscreteAnimator;\r\n}());\r\n\r\nvar PropertyAnimationManager = (function () {\r\n    function PropertyAnimationManager() {\r\n        this._props = {};\r\n        this._props2 = {};\r\n        this._nextKey = 0;\r\n        this.onUpdateScene = null;\r\n        var self = this;\r\n        window.setInterval(function () { return self.processAnimation(); }, 100);\r\n    }\r\n    PropertyAnimationManager.prototype.animateLinear = function (prop, delta, step) {\r\n        if (this._props[prop.id] !== undefined) {\r\n            return;\r\n        }\r\n        this._props[prop.id] = new LinearAnimator(prop, delta, step);\r\n    };\r\n    PropertyAnimationManager.prototype.animate = function (prop, animator) {\r\n        if (prop === undefined || animator == undefined)\r\n            throw \"missing required args\";\r\n        if (this._props[prop.id] !== undefined) {\r\n            return;\r\n        }\r\n        this._props[prop.id] = animator;\r\n    };\r\n    PropertyAnimationManager.prototype.glide = function (args) {\r\n        this._props2[args.obj.id + args.prop] = new LinearAnimator2(args.obj, args.prop, args.delta, args.step);\r\n    };\r\n    PropertyAnimationManager.prototype.animateProperty = function (args) {\r\n        this._props2[args.obj.id + args.prop] = args.animator;\r\n    };\r\n    PropertyAnimationManager.prototype.nextId = function () {\r\n        return this._nextKey++;\r\n    };\r\n    PropertyAnimationManager.prototype.processAnimation = function () {\r\n        var frameTime = performance.now();\r\n        for (var key in this._props) {\r\n            var prop = this._props[key];\r\n            if (!prop.animate(frameTime)) {\r\n                delete this._props[key];\r\n            }\r\n        }\r\n        for (var key in this._props2) {\r\n            var prop = this._props2[key];\r\n            if (!prop.animate(frameTime)) {\r\n                delete this._props2[key];\r\n            }\r\n        }\r\n        if (this.onUpdateScene !== null) {\r\n            return this.onUpdateScene();\r\n        }\r\n    };\r\n    return PropertyAnimationManager;\r\n}());\r\n\r\nvar animator = new PropertyAnimationManager();\r\n\n\n//# sourceURL=webpack://bark/./src/animator.ts?");

/***/ }),

/***/ "./src/game.ts":
/*!*********************!*\
  !*** ./src/game.ts ***!
  \*********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Game\": function() { return /* binding */ Game; },\n/* harmony export */   \"game\": function() { return /* binding */ game; },\n/* harmony export */   \"screen\": function() { return /* binding */ screen; },\n/* harmony export */   \"input\": function() { return /* binding */ input; },\n/* harmony export */   \"tryLoadGameCode\": function() { return /* binding */ tryLoadGameCode; },\n/* harmony export */   \"loadGameFrame\": function() { return /* binding */ loadGameFrame; }\n/* harmony export */ });\n/* harmony import */ var _input__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./input */ \"./src/input.ts\");\n/* harmony import */ var _screen__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./screen */ \"./src/screen.ts\");\n\r\n\r\nvar Game = (function () {\r\n    function Game() {\r\n        this._screen = null;\r\n        this._canvas = null;\r\n    }\r\n    Game.prototype.run = function (screen) {\r\n        this._screen = screen;\r\n        this.tryRun();\r\n    };\r\n    Game.prototype.loadCanvas = function (canvas) {\r\n        this._canvas = canvas;\r\n        this.tryRun();\r\n    };\r\n    Game.prototype.tryRun = function () {\r\n        if (this._screen !== null && this._canvas !== null) {\r\n            this._screen.run(this._canvas);\r\n        }\r\n    };\r\n    return Game;\r\n}());\r\n\r\nvar game = new Game();\r\nvar screen = new _screen__WEBPACK_IMPORTED_MODULE_1__.Screen();\r\nvar input = new _input__WEBPACK_IMPORTED_MODULE_0__.Input();\r\nvar gameCode = '';\r\nvar isGameLoaded = false;\r\nwindow.addEventListener(\"message\", function (event) {\r\n    gameCode = event.data;\r\n    tryLoadGameCode();\r\n}, false);\r\nfunction tryLoadGameCode() {\r\n    if (gameCode !== null) {\r\n        eval(gameCode);\r\n        game.run(screen);\r\n    }\r\n}\r\nfunction loadGameFrame(body) {\r\n    body.innerHtml = '<canvas id=\"canvas\"></canvas>';\r\n    var canvas = document.createElement('canvas');\r\n    canvas.id = 'canvas';\r\n    body.appendChild(canvas);\r\n    game.loadCanvas(canvas);\r\n    isGameLoaded = true;\r\n    tryLoadGameCode();\r\n}\r\n\n\n//# sourceURL=webpack://bark/./src/game.ts?");

/***/ }),

/***/ "./src/input.ts":
/*!**********************!*\
  !*** ./src/input.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Input\": function() { return /* binding */ Input; }\n/* harmony export */ });\nvar Input = (function () {\r\n    function Input() {\r\n        this.pressedKeys = {};\r\n        var self = this;\r\n        window.addEventListener('keydown', function (evt) { return self.onKeyDown(evt); }, false);\r\n        window.addEventListener('keyup', function (evt) { return self.onKeyUp(evt); }, false);\r\n    }\r\n    Input.prototype.onKeyDown = function (evt) {\r\n        this.pressedKeys[evt.code] = true;\r\n    };\r\n    Input.prototype.onKeyUp = function (evt) {\r\n        this.pressedKeys[evt.code] = false;\r\n    };\r\n    return Input;\r\n}());\r\n\r\n\n\n//# sourceURL=webpack://bark/./src/input.ts?");

/***/ }),

/***/ "./src/screen.ts":
/*!***********************!*\
  !*** ./src/screen.ts ***!
  \***********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Screen\": function() { return /* binding */ Screen; }\n/* harmony export */ });\n/* harmony import */ var _animator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./animator */ \"./src/animator.ts\");\n\r\nvar Screen = (function () {\r\n    function Screen() {\r\n        this._width = 0;\r\n        this._height = 0;\r\n        this._level = null;\r\n        this._canvas = null;\r\n        this._cameraX = 0;\r\n        this._cameraY = 0;\r\n        this.$scrollX = new _animator__WEBPACK_IMPORTED_MODULE_0__.NumberProperty(0);\r\n    }\r\n    Object.defineProperty(Screen.prototype, \"scrollX\", {\r\n        get: function () { return this.$scrollX.get(); },\r\n        enumerable: false,\r\n        configurable: true\r\n    });\r\n    Object.defineProperty(Screen.prototype, \"width\", {\r\n        get: function () { return this._width; },\r\n        enumerable: false,\r\n        configurable: true\r\n    });\r\n    Object.defineProperty(Screen.prototype, \"height\", {\r\n        get: function () { return this._height; },\r\n        enumerable: false,\r\n        configurable: true\r\n    });\r\n    Screen.prototype.setLevel = function (level, width, height) {\r\n        this._level = level;\r\n        this._width = width;\r\n        this._height = height;\r\n    };\r\n    Screen.prototype.run = function (canvas) {\r\n        this._canvas = canvas;\r\n        canvas.width = this._width;\r\n        canvas.height = this._height;\r\n        this._cameraX = undefined;\r\n        this._cameraY = undefined;\r\n        var self = this;\r\n        window.requestAnimationFrame(function () { return self._repaint(); });\r\n    };\r\n    Screen.prototype._repaint = function () {\r\n        var ctx = this._canvas.getContext('2d');\r\n        var frameTime = performance.now();\r\n        ctx.save();\r\n        ctx.clearRect(0, 0, this._width, this._height);\r\n        ctx.translate(-this.scrollX, 0);\r\n        if (this._level !== null) {\r\n            this._level.draw(ctx, 0, this._width);\r\n        }\r\n        ctx.restore();\r\n        var self = this;\r\n        window.requestAnimationFrame(function () { return self._repaint(); });\r\n    };\r\n    Screen.prototype.relativePosX = function (x) {\r\n        return x - this.scrollX;\r\n    };\r\n    Screen.prototype.setCamera = function (x, y) {\r\n        if (this._level === null) {\r\n            return;\r\n        }\r\n        if (this._cameraX !== undefined) {\r\n            var shiftX = 0;\r\n            if (x > this._cameraX) {\r\n                if (this.relativePosX(x) > screen.width * 3 / 4) {\r\n                    shiftX = this.width / 2;\r\n                }\r\n            }\r\n            if (x < this._cameraX) {\r\n                if (this.relativePosX(x) > this.width * 3 / 4) {\r\n                    shiftX = -this.width / 2;\r\n                }\r\n            }\r\n            if (this.scrollX + shiftX > this._level.pixelWidth - this._width) {\r\n                shiftX = this._level.pixelWidth - this._width - this.scrollX;\r\n            }\r\n            if (shiftX !== 0) {\r\n                this.$scrollX.glide(shiftX, shiftX / 10);\r\n            }\r\n        }\r\n        this._cameraX = x;\r\n        this._cameraY = y;\r\n    };\r\n    return Screen;\r\n}());\r\n\r\n\n\n//# sourceURL=webpack://bark/./src/screen.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/game.ts");
/******/ 	
/******/ })()
;