export default (start = 0, factor = 1) => Object.defineProperties(
	attempt => start * Math.pow(factor, attempt),
	{
		startingAt: {
			value: function(value) { start  = value; return this },
		},
		withFactor: {
			value: function(value) { factor = value; return this },
		},
		ms: {
			get: function() { return this }
		}
	}
)
