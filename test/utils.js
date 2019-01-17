export const createTask = results => jest.fn(() =>
	Promise.resolve(results.shift()).then(results.length ? value => { throw value } : value => value)
)

export const indices = num => Array(num).fill().map((_, i) => i)
