
let rabbit = {
	type: "white",
	speak(line) {
		console.log(`The ${this.type} rabbit says '${line}'`)
	}
}

let protoRabbit = {
	speak() {

	}
}

//rabbit.speak('hallo')

// const globalInspected = util.inspect(global, true, 1) as string
// console.log(globalInspected)


// const i = 66;
// console.log(eval('global'))
// process.exit()

// console.log(module)
// console.log(exports)

// console.log(Object.keys(globalThis));
// console.log(Object.keys(globalThis.global));
// console.log(globalThis.Boolean)
// console.log(Object.entries(globalThis));

// for (const key in global) {
// 	console.log(key)
// }

// console.log('\n\n^^^')
// util.inspect(console)
// //sconst globalInspected = util.inspect(global, true, 1) as string
// console.log(globalInspected)

// console.log(`includes:visited`, globalInspected.split('\n').filter(line => line.includes('odule')).join('\n'))
// process.exit()

// console.log('^^^\n\n')

// console.log('===')
// eval('console.log(global)')

// console.log('@@@', this)

// console.log('###', Function('return this')())

// process.exit()

const visited = new Set()

function visit(name: string, o: any, func: (name, o) => void, depth = 0) {
	if (visited.has(o)) {
		return
	}
	visited.add(o)

	console.log(name)
	if (Array.isArray(o)) {
		for (let i = 0; i < o.length; i++) {
			const element = o[i];
			visit(i.toString(), element, func, depth + 1)
		}
		return o
	} else if (typeof o === 'object') {
		for (const key in o) {
			console.log(key)
			if (Object.prototype.hasOwnProperty.call(o, key)) {
				const element = o[key];
				visit(key, element, func, depth + 1)
			}
		}
	} else {
		func(name, o)
	}
}

//visit('root', globalThis, (name, o) => console.log(name, o))
