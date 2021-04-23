import Jimp from 'jimp'
import net from 'net'
import Tesseract from 'tesseract.js';
import { forOwn, chain } from 'lodash'
import { exec } from 'child_process';
import watch from 'watch'

export function screenCaptureToFile(robotScreenPic) {
	return new Promise((resolve, reject) => {
		try {
			const image = new Jimp(robotScreenPic.width, robotScreenPic.height);
			let pos = 0;
			image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
				/* eslint-disable no-plusplus */
				image.bitmap.data[idx + 2] = robotScreenPic.image.readUInt8(pos++);
				image.bitmap.data[idx + 1] = robotScreenPic.image.readUInt8(pos++);
				image.bitmap.data[idx + 0] = robotScreenPic.image.readUInt8(pos++);
				image.bitmap.data[idx + 3] = robotScreenPic.image.readUInt8(pos++);
				/* eslint-enable no-plusplus */
			});
			resolve(image);
		} catch (e) {
			console.error(e);
			reject(e);
		}
	});
}


export function testTesseract() {
	let start = highResolutionTimestamp()
	Tesseract.recognize(
		'C:/Users/Michaels/Documents/ShareX/Screenshots/2020-12/ConEmu64_HbdhopxtcC.png',
		//'https://tesseract.projectnaptha.com/img/eng_bw.png',
		'eng',
		{ logger: m => console.log(m) }
	).then(({ data: { text } }) => {
		console.log(text, `took:${(highResolutionTimestamp() - start) * 0.001}`);
	})
}

export const highResolutionTimestamp = (): number => {
	if (process && process.hrtime) {
		const time = process.hrtime()
		return time[0] * 1000 + time[1] / 1000000
	} else {
		return performance.now()
	}
}

export function createMontage(files) {
	const allFiles = files.join(' ')

	const command = `magick montage -geometry 500x500>+4+3 ${allFiles} montage_test.jpg`
	console.log('executing:', command)
	exec(command, defLogger)
}

const defLogger = (error, stdout, stderr) => {
	if (error) {
		console.log(`error: ${error.message}`);
		return;
	}
	if (stderr) {
		console.log(`stderr: ${stderr}`);
		return;
	}
	console.log(`stdout: ${stdout}`);
}

export const printGraph = function(obj: object, rootName: string) {

	const idLabelMap: Map<number, string> = new Map()
	const ignoreIfParent: Set<number> = new Set()

	// [label="myEntity|{facingDirection | -1}"]
	visitObject(obj, rootName, (parentName, parent, elementName, element, depth) => {
		console.log(`visitObject elementName:${elementName} type:${typeof element} class:${element.constructor?.name} depth:${depth}`)
		const id1 = getObjId(parent)
		const id2 = getObjId(element)

		if (ignoreIfParent.has(id1)) {
			return
		}

		if (!idLabelMap.get(id1)) {
			idLabelMap.set(id1, `<${parentName}> ${parentName}`)
		}

		// if we're not an atomic element then add ourselves to the id->label map
		if (!isAtomic(element)) {
			if (!idLabelMap.get(id2)) {
				if (element.x && element.y) {
					idLabelMap.set(id2, `{<${elementName}> ${elementName}|${toDebugString(element)}}`)
					ignoreIfParent.add(id2)
				} else {
					idLabelMap.set(id2, `<${elementName}> ${elementName}`)
				}
			}
		}

		let valueString = ''
		if (isAtomic(element) && typeof element !== 'function') {
			valueString = ` | ${element}`
		}
		//https://cdn.discordapp.com/attachments/696802919449886771/777910595416621096/unknown.png
		idLabelMap.set(id1, `${idLabelMap.get(id1)} | {<${elementName}> ${elementName}${valueString}}`)
	})

	let s: string =
		`
digraph dep {
rankdir=LR
node [shape=record, height=0.1]
`

	idLabelMap.forEach((v, id) => {
		s += `${id} [label="${v}"]\n`
	})

	visitObject(obj, rootName, (parentName, parent, elementName, element, depth) => {
		//console.log(parentName, elementName, depth)
		const parentId = getObjId(parent)
		const elementId = getObjId(element)
		// s += `    ${parentId} [label="${parentName}"]; `
		// if (typeof element === 'number' || typeof element === 'string') {
		// 	s += `    ${elementId} [label="{${elementName} | ${element}}", tooltip="id:${elementId} d:${depth}"];`
		// } else {
		// 	s += `    ${elementId} [label="${elementName}", tooltip="id:${elementId} d:${depth}"];`
		// }
		if (!isAtomic(element)) {
			s += `    ${parentId}:${elementName} -> ${elementId}:${elementName} [color="#${Math.floor(pickRandomColor()).toString(16)}"]\n`
		}
	})

	s += '}'

	console.log(s)
}

function isAtomic(obj) {
	if (obj === null || obj === undefined) {
		return true
	}
	const type = typeof obj
	return type === 'number' || type === 'string' || type === 'function'
}

export function toDebugString(o: object) {
	return chain(o)
		.forOwn(o)
		.map((v, k) => `${k}:${v}`)
		.join(', ')
		.value()
}

function getObjId(o: object) {
	const id1 = getObjId1(o)
	const id2 = getObjId2(o)
	//console.log(id1, id2, o)
	return id2
}

const getObjId1_map: Map<object, number> = new Map()
function getObjId1(o: object) {
	if (typeof o === 'number') {
		return -1
	}
	if (!getObjId1_map.get(o)) {
		getObjId1_map.set(o, getObjId1_map.size)
	}
	return getObjId1_map.get(o)
}

const getObjId2_map = new WeakMap;
let objectCount = 0;
function getObjId2(o: object) {
	if (o === null || o === undefined || typeof o !== 'object') {
		return objectCount++
	}

	//console.log(typeof o, o)
	if (!getObjId2_map.has(o)) {
		getObjId2_map.set(o, objectCount++);
	}
	return getObjId2_map.get(o);
}

export const addTraceToMethod = function(o, method, toCall) {
	const methodBackup = o[method]
	o[method] = function(renderer) {
		toCall(this)
		methodBackup.bind(this)(renderer)
	}
}

const visitObject = function(obj: object, objName: string, onVisit) {
	//console.log(`visitObject: ${objName}`)

	const _visitObjectInner = function(o: object, name: string, depth: number) {
		//console.log(`_visitObjectInner: ${getObjId(o)}`)

		if (name == null) {
			name = _getName(o)
		}

		// if (name !== 'myEntity' && name !== 'nameplateText' && name !== '_events') {
		// 	return
		// }

		if (o instanceof Map) {
			o.forEach((value, key) => {
				console.log(` Map ${name} -> ${value} (${depth})`)
			})
		} else if (typeof o === 'object') {
			let c = 0
			Object.keys(o).forEach((element) => {
				const p = o[element]

				// if (c++ >= 1) {
				// 	return
				// }

				// if (element !== 'myEntity' && element !== 'nameplateText' && element !== '_events') {
				// 	return
				// }

				onVisit(name, o, element, p, depth)

				if (typeof p === 'object') {
					const id = getObjId(p)
					if (p && !visited[id] && depth < 1) {
						visited[id] = true
						_visitObjectInner(p, element, depth + 1)
					}
				}
			})
		} else {
			onVisit(name, o)
		}
	}

	const _getName = function(o: object) {
		return o.constructor.name
	}

	const visited = {}
	_visitObjectInner(obj, objName, 0)
}

export const pickRandomColor = () => {
	const r = Math.random()
	switch (Math.floor(Math.random() * 3)) {
		case 0:
			return Math.round(0xff * r) * 0x10000 + Math.round(0xff * (1 - r)) * 0x100
		case 1:
			return Math.round(0xff * r) * 0x10000 + Math.round(0xff * (1 - r))
		case 2:
			return Math.round(0xff * r) * 0x100 + Math.round(0xff * (1 - r))
	}
}

export interface VectorXY {
	x: number
	y: number
}

var client = new net.Socket();

export function drawLine(id: string, p1: VectorXY, p2: VectorXY) {
	client.write(JSON.stringify({ id, p1, p2 }))
}

export function drawLine2(id: string, x1, y1, x2, y2) {
	const test = { id, p1: { x: x1, y: y1 }, p2: { x: x2, y: y2 } }
	client.write(JSON.stringify(test))
}

export function boxify(p1: VectorXY, p2: VectorXY): VectorXY[] {
	return [
		{ x: p1.x, y: p1.y },
		{ x: p2.x, y: p1.y },
		{ x: p2.x, y: p2.y },
		{ x: p1.x, y: p2.y },
	]
}

export function drawRect(id: string, p1: VectorXY, p2: VectorXY) {
	const box = boxify(p1, p2)
	for (let i = 0; i < box.length; i++) {
		drawLine(id + i, box[i], box[(i + 1) % 4])
	}
}

const player = {
	name: 'Thrump',
	position: { x: 10, y: 1 },
	bounds: boxify({ x: 0.1, y: 0.2 }, { x: 1.1, y: 1.2 })
}

export function initMontageWatcher() {

	let files = []
	//C:\Users\Michaels\Documents\ShareX\Screenshots\2021-01\firefox_CuJXRclaje.png
	const folder = 'C:\\Users\\Michaels\\Documents\\ShareX\\Screenshots\\2021-01'
	watch.watchTree(folder, function(f, curr, prev) {
		console.log(f)
		if (typeof f == "object" && prev === null && curr === null) {
			// Finished walking the tree
			files = Object.keys(f)
			createMontage(files)
		} else if (prev === null) {
			const s = f as string
			if (s.includes('.png')) {
				files.push(f)
			}

			createMontage(files)
			// f is a new file
		} else if (curr.nlink === 0) {
			// f was removed
		} else {
			// f was changed
		}
	})
}