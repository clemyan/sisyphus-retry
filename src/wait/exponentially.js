export default (start = 0, factor = 1) => Object.defineProperties(
	attempt => start * Math.pow(factor, attempt),
	Object.getOwnPropertyDescriptors({
		startingAt: function(value) { start  = value; return this },
		withFactor: function(value) { factor = value; return this },
		get ms() { return this }
	})
)
