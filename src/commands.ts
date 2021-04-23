import readline from 'readline'
import WebSocket from 'ws'
import { toDebugString } from './utils'
import chalk from 'chalk'

let commandSocket: WebSocket
let commandId = 0

const DEFAULT_URL = 'ws://localhost'
const HUB_PORT = 7777
const ADV_PORT = 7778
const DEFAULT_PORT = ADV_PORT

let completions = 'disconnect connect update'.split(' ');
let rl: readline.Interface

export function runLootConsole() {
	connectToDefault()
	runCommands()
}

export function connectToDefault() {
	connect(`${DEFAULT_URL}:${DEFAULT_PORT}`)
}

function completer(line: string) {
	logsys(` calling completer on (${line})`)

	const words = splitIntoWords(line)
	if (words.length > 0) {
		line = words[words.length - 1]
		logsys(` calling completer on (${line})`)
	}

	const hits = completions.filter((c) => c.startsWith(line));
	// Show all completions if none found
	return [hits.length ? hits : completions, line];
}

export function runCommands() {
	rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		completer
	});

	rl.on('SIGINT', () => {
		// 	rl.question('Are you sure you want to exit? ', (answer) => {
		// 		if (answer.match(/^y(es)?$/i)) rl.pause();
		// 	});
	});

	function loop() {
		rl.question(chalk.underline('Enter Command') + '> ', (command) => {
			command = command.trim()
			if (command.startsWith('/')) {
				sendCommand(command)
			} else {
				if (command.startsWith('connect')) {
					const port = parsePort(command, DEFAULT_PORT)
					const url = parseUrl(command, DEFAULT_URL)
					connect(`${url}:${port}`)
				} else if (command === 'disconnect') {
					disconnect()
				} else if (command === 'update') {
					sendCommand('/pk', addKeyWords)
				} else {
					logsys(`unknown command:${command}`)
				}
			}

			setTimeout(loop, 100)
		});
	}
	loop()
}

const callbacks = []

export function sendCommand(command: string, cb?: (result) => void) {
	const id = commandId++
	if (cb) {
		callbacks[id] = cb
	}
	commandSocket.send(JSON.stringify({ type: 'command', id, data: { command } }))
	return id
}

export function receiveMessage(message: string, id: number) {
	if (callbacks[id]) {
		callbacks[id](message)
	} else {
		console.log(message.replace(/fda/g, chalk.yellow('$1')))
	}
}

function logsys(s) {
	return console.log(chalk.gray('# ' + s))
}

function connect(url: string) {
	if (commandSocket && commandSocket.readyState === commandSocket.OPEN) {
		logsys('already connected')
	} else {
		commandSocket = new WebSocket(url)
		logsys(`connecting to ${url}`)
	}

	commandSocket.onopen = (ev) => {
		sendCommand('/who', (result) => console.log(`testing things:${result}`))
		sendCommand('/pk', addKeyWords)
	}
	commandSocket.onclose = (ev) => {
		logsys(toDebugString(ev))
	}

	commandSocket.onmessage = (ev) => {
		const response = JSON.parse(ev.data as string)
		if (response.id) {
			receiveMessage(response.result, response.id)
		} else if (response.result) {
			logsys(response.result)
		} else {
			console.log(response)
		}
	}
}

function splitIntoWords(s: string) {
	return s.match(/[^ \t\n]+/g)
}

function addKeyWords(keywords: string) {
	const test = splitIntoWords(keywords)
	completions = completions.concat(test)
	logsys(`added ${test.length} keywords`)
}

function disconnect() {
	if (commandSocket.readyState === commandSocket.OPEN) {
		commandSocket.close()
	}
}

function hasWord(s: string, word: string) {
	const words = s.split(' ')
	for (let i = 0; i < words.length; i++) {
		const w = words[i];
		if (w === word) {
			return true
		}
	}
	return false
}

function parseUrl(s: string, dfault: string): string {
	const words = s.split(' ')
	for (let i = 0; i < words.length; i++) {
		const word = words[i];
		const n = Number.parseFloat(word)
		if (!isNaN(n)) {
			return word
		}
	}
	return dfault
}

function parsePort(s: string, dfault: number) {
	if (hasWord(s, 'hub')) {
		return HUB_PORT
	} else if (hasWord(s, 'adv')) {
		return ADV_PORT
	}

	return parseNumberAnywhere(s, dfault)
}

function parseNumberAnywhere(s: string, dfault: number): number {
	const words = s.split(' ')
	for (let i = 0; i < words.length; i++) {
		const word = words[i];
		const n = Number.parseFloat(word)
		if (!isNaN(n)) {
			return n
		}
	}
	return dfault
}