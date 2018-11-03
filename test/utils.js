export const createTask = results => {
	return jest.fn(() => Promise.resolve(results.shift())
		.then(results.length ? value => { throw value } : value => value))
}
