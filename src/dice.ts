import _ from 'lodash'

type roll = 1 | 2 | 3 | 4 | 5 | 6


function isFlush2(rolls: number[]) {
	for (let i = 0; i < 6; i++) {
		if (!rolls.includes(i + 1)) {
			return false
		}
	}
	return true
}

export function roller() {
	const rolls: roll[] = []
	let flushCount = 0;
	let has1or5 = 0
	let fourOfAKind = 0
	let fiveOfAKind = 0
	let sixOfAKind = 0
	let canContinue = 0
	let doubleThree = 0
	let fifteenHundred = 0
	let fullerHouse = 0

	const tests = ['isFlush', 'is6ofAKind', 'is5ofAKind', 'is4ofAKind', 'isFullerHouse']
	const results = {}

	const possibleRolls = 6 ** 6
	for (let i = 0; i < possibleRolls; i++) {
		if (!(i % 1000))
			console.log(`i:${i}/${possibleRolls}`)
		for (let r = 0; r < 6; r++) {
			rolls[r] = Math.floor(i / (6 ** r)) % 6 + 1 as roll
		}

		if (_1or5(rolls) || ofAKind(rolls, 4)) {
			canContinue++
		}

		tests.forEach(test => {
			const e = `${test}(rolls)`
			if (eval(e)) {
				results[test]++
			}
		})

		if (isFlush(rolls)) {
			flushCount++
		} else if (ofAKind(rolls, 6)) {
			sixOfAKind++
		} else if (ofAKind(rolls, 5)) {
			fiveOfAKind++
		} else if (isFullerHouse(rolls)) {
			fullerHouse++
		} else if (ofAKind(rolls, 4)) {
			fourOfAKind++
		} else if (ofAKind2(rolls) >= 2) {
			doubleThree++
		} else if (_1or5(rolls)) {
			has1or5++
		}


		if (isFlush(rolls) || ofAKind2(rolls) >= 2 || ofAKind(rolls, 5) && isFullerHouse(rolls)) {
			fifteenHundred++
		}
	}

	//console.log(results)

	console.log(`out of ${possibleRolls} possible rolls:`)
	console.log(` can continue: ${canContinue} (${(canContinue / possibleRolls * 100).toFixed(1)}%)`)
	console.log(` has 1 or 5: ${has1or5} (${(has1or5 / possibleRolls * 100).toFixed(1)}%)`)
	console.log(` flush: ${flushCount} (${(flushCount / possibleRolls * 100).toFixed(1)}%)`)
	console.log(` four of a kind: ${fourOfAKind} (${(fourOfAKind / possibleRolls * 100).toFixed(1)}%)`)
	console.log(` five of a kind: ${fiveOfAKind} (${(fiveOfAKind / possibleRolls * 100).toFixed(1)}%)`)
	console.log(` six of a kind: ${sixOfAKind} (${(sixOfAKind / possibleRolls * 100).toFixed(2)}%)`)
	console.log(` double three: ${doubleThree} (${(doubleThree / possibleRolls * 100).toFixed(1)}%)`)
	console.log(` fullerHouse: ${fullerHouse} (${(fullerHouse / possibleRolls * 100).toFixed(1)}%)`)
	console.log(` 1500 points: ${fifteenHundred} (${(fifteenHundred / possibleRolls * 100).toFixed(1)}%)`)
	//console.log(` four of a kind: ${fourOfAKind} (${(fourOfAKind / possibleRolls * 100).toFixed(1)}%)`)
}

export function isFlush(rolls: number[]) {
	for (let i = 0; i < 6; i++) {
		if (!rolls.includes(i + 1)) {
			return false
		}
	}
	return true
}

export function is6ofAKind(rolls: roll[]) {
	return ofAKind(rolls, 6)
}

export function is5ofAKind(rolls: roll[]) {
	return ofAKind(rolls, 5)
}

export function is4ofAKind(rolls: roll[]) {
	return ofAKind(rolls, 4)
}

export function isFullerHouse(rolls: roll[]) {
	const set = new Set()
	for (let i = 0; i < 6; i++) {
		set.add(rolls[i])
	}

	return ofAKind(rolls, 4) && set.size <= 2
}
isFullerHouse([1, 1, 1, 1, 2, 2])

export function ofAKind2(rolls: roll[]) {
	let c = 0
	for (let i: roll = 1; i <= 6; i++) {
		if (count(rolls, i) >= 3) {
			c++
		}
	}
	return c
}

export function ofAKind(rolls: roll[], c: number) {
	for (let i: roll = 1; i <= 6; i++) {
		if (count(rolls, i) >= c) {
			return true
		}
	}
	return false
}

export function count(rolls: roll[], roll: number) {
	return rolls.filter(r => r === roll).length
}

export function _1or5(rolls: number[]) {
	for (let i = 0; i < 6; i++) {
		if (rolls[i] === 1 || rolls[i] === 5) {
			return true
		}
	}
	return false
}