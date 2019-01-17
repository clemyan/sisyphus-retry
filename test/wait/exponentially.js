import exponentially from 'src/wait/exponentially.js'
import { indices } from 'test/utils.js'

describe("Exponential backoff", () => {
	test(".ms should be fluent no-op", () => {
		const backoff = exponentially()
		expect(backoff.ms).toBe(backoff)
	})

	test.each(
		['startingAt', 'withFactor']
	)(".%s should be fluent", (method) => {
		const backoff = exponentially()
		expect(backoff[method](0)).toBe(backoff)
	})

	const make = (start, factor, factory) => ({
		backoff: factory(start, factor),
		start,
		factor
	})
	const fluently = (start, factor) => exponentially().startingAt(start).withFactor(factor)

	const random = [[7656, 1], [1309, 3], [2905, 2], [4783, 3], [6501, 2], [4506, 3]]

	describe.each([
		["on construct", random.map(args => make(...args, exponentially))],
		["fluently",     random.map(args => make(...args, fluently))]
	])("configured %s", (_, configs) => {
		it("should start at configured start", () => {
			for(const {backoff, start} of configs) {
				expect(backoff(0)).toBe(start)
			}
		})
		
		it("should grow by configured factor", () => {
			for(const {backoff, factor} of configs) {
				const values = indices(10).map(i => backoff(i))
				indices(9).map(i => values[i + 1] / values[i]).forEach(ratio => expect(ratio).toBe(factor))
			}
		})
	})
})
