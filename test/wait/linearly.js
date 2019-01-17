import linearly from 'src/wait/linearly.js'
import { indices } from 'test/utils.js'

describe("Linear backoff", () => {
	test(".ms should be fluent no-op", () => {
		const backoff = linearly()
		expect(backoff.ms).toBe(backoff)
	})

	test.each(
		['startingAt', 'incrementingBy']
	)(".%s should be fluent", (method) => {
		const backoff = linearly()
		expect(backoff[method](0)).toBe(backoff)
	})

	const make = (start, inc, factory) => ({
		backoff: factory(start, inc),
		start,
		inc
	})
	const fluently = (start, inc) => linearly().startingAt(start).incrementingBy(inc)

	const random = [[3191, 4218], [5051, 7840], [4551, 2750], [3860, 7232], [2740, 9891], [7562, 6525]]

	describe.each([
		["on construct", random.map(args => make(...args, linearly))],
		["fluently",     random.map(args => make(...args, fluently))]
	])("configured %s", (_, configs) => {
		it("should start at configured start", () => {
			for(const {backoff, start} of configs) {
				expect(backoff(0)).toBe(start)
			}
		})
		
		it("should increment by configured increment", () => {
			for(const {backoff, inc} of configs) {
				const values = indices(10).map(i => backoff(i))
				indices(9).map(i => values[i + 1] - values[i]).forEach(diff => expect(diff).toBe(inc))
			}
		})
	})
})
