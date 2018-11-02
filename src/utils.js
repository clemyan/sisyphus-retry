export const delegate = (props) => (obj, delegatee) => {
	for(const prop of props) {
		if(!Object.prototype.hasOwnProperty.call(obj, prop)) {
			Object.defineProperty(obj, prop, {
				get: () => typeof delegatee[prop] === 'function'
					? Function.prototype.bind.call(delegatee[prop], delegatee)
					: delegatee[prop]
			})
		}
	}
	return obj
}
