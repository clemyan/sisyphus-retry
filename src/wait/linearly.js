export default (start = 0, increment = 0) => Object.defineProperties(
	attempt => start + increment * attempt,
	{
		startingAt: {
			value: function(value) { start = value; return this },
		},
		incrementingBy: {
			value: function(value) { increment = value; return this },
		},
		ms: {
			get: function() { return this }
		}
	}
)
