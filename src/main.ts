#!/usr/bin/env node
import net from 'net'
// import robot from 'robotjs' //https://github.com/octalmage/robotjs
// import ioHook from 'iohook' //https://github.com/wilix-team/iohook/blob/master/examples/example.js
import { Vector } from 'sat'
import { createMontage, drawRect, printGraph, testTesseract } from './utils'
import { exec } from "child_process"
import readline from 'readline'
import { connectToDefault, runCommands, runLootConsole } from './commands'
import { roller } from './dice'
//import { runKeylogger } from './keylogger'

// const PORT = 5000
// const LOCAL_HOST = '127.0.0.1';
// const HOST = LOCAL_HOST

let mouseDown: Vector

roller()

// process.on('uncaughtException', function(err) {
// 	console.log('Caught exception: ', err);
// });

// let client = new net.Socket();

//runKeylogger()
//runLootConsole()

// function initHooks() {
// 	ioHook.on("mousedown", function(msg) {
// 		console.log(msg);
// 		mouseDown = new Vector(msg.x, msg.y)
// 	});
// 	ioHook.on("mouseup", function(msg) {
// 		mouseDown = undefined
// 	});
// 	ioHook.on("keydown", function(msg) {
// 		console.log(msg);
// 		//console.log('testTesseract')
// 		//testTesseract()
// 	});
// 	ioHook.start();
// }

// function initConnection() {
// 	console.log('initConnection1')
// 	client.connect(PORT, HOST, function() {
// 		console.log('CONNECTED TO: ' + HOST + ':' + PORT);
// 		client.write('I am Chuck Norris!');
// 	});

// 	// console.log('initConnection2')
// 	// client.on('data', function(data) {
// 	// 	console.log('DATA: ' + data);
// 	// 	//client.destroy();
// 	// });

// 	// console.log('initConnection3')
// 	// client.on('close', function() {
// 	// 	console.log('Connection closed');
// 	// });

// 	// console.log('initConnection4')
// }

//exec("dir",);

//printGraph(player, 'player')
//process.exit()

// function robotLoop() {
// 	const mp = robot.getMousePos()
// 	console.log('loop', robot.getMousePos())

// 	if (mouseDown) {
// 		drawRect('box', mouseDown, mp)
// 	}

// 	setTimeout(robotLoop, 500)
// }

// initHooks();
// // initConnection()
// robotLoop()
