export const delegate = (props) => (obj, delegatee) => {
	for(const prop of props) {
		Object.defineProperty(obj, prop, {
			get: () => typeof delegatee[prop] === 'function'
				? Function.prototype.bind.call(delegatee[prop], delegatee)
				: delegatee[prop]
		})
	}
	return obj
}

export function delay(ms) {
	return new Promise(res => setTimeout(res, ms))
}
