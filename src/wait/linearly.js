export default (start = 0, increment = 0) => Object.defineProperties(
	attempt => start + increment * attempt,
	Object.getOwnPropertyDescriptors({
		startingAt:     function(value) { start     = value; return this },
		incrementingBy: function(value) { increment = value; return this },
		get ms() { return this }
	})
)
