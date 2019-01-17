import sisyphus from 'src/index.js'
import { createTask } from './utils.js'

describe("Fluent no-ops", () => {
	test.each(
		['time', 'times', 'ms']
	)(".%s should be fluent no-op", (prop) => {
		const instance = sisyphus()
		expect(instance[prop]).toBe(instance)
	})
})

describe("Tasks", () => {
	it("should not retry successful tasks", async () => {
		const task = createTask(Array(1))
		expect.assertions(1)

		await sisyphus().triesTo(task).now()
		expect(task).toBeCalledTimes(1)
	})
	
	it("should retry failed tasks", async () => {
		const task = createTask(Array(4))
		expect.assertions(1)

		await sisyphus().triesTo(task).now()
		expect(task).toBeCalledTimes(4)
	})

	it("resolves to same value as task success", async () => {
		const ref = {}
		const task = createTask([ref])
		expect.assertions(1)

		await expect(sisyphus().triesTo(task).now()).resolves.toBe(ref)
	})

	it("should reject with same reason as last task failure", async () => {
		const refs = [{index: 0}, {index: 1}, {index: 2}, {index: 3}]
		const task = createTask([...refs])
		expect.assertions(1)
		
		const promise = sisyphus()
			.triesTo(task)
			.thrice()
			.now()
		await expect(promise).rejects.toBe(refs[2])
	})
})

describe("Max attempts", () => {
	const testAttempts = async (sisyphus, attempts) => {
		const task = createTask(Array(100))
		await sisyphus.triesTo(task).now().catch(() => {})
		expect(task).toBeCalledTimes(Math.min(100, attempts))
	}

	it("should default to infinite retries", async () => {
		expect.assertions(1)

		await testAttempts(sisyphus(), Infinity)
	})

	it("should attempt the specified number of times", async () => {
		expect.assertions(10)

		await Promise.all([...Array(10).keys()]
			.map(i => i + 1)
			.map(attempts =>
				testAttempts(sisyphus().trying(attempts).times, attempts)))
	})

	test.each([
		['once', 1],
		['twice', 2],
		['thrice', 3],
		['indefinitely', Infinity],
		['infinite', Infinity]
	])(".%s() should set the number of attempts to %d", async (prop, attempts) => {
		expect.assertions(1)

		await testAttempts(sisyphus()[prop](), attempts)
	})
})

describe("Wait time / Backoff", () => {
	let _originalSetTimeout

	beforeAll(() => {
		_originalSetTimeout = global.setTimeout
		global.setTimeout = jest.fn(cb => setImmediate(cb))
	})

	afterAll(() => {
		global.setTimeout = _originalSetTimeout
	})

	beforeEach(() => setTimeout.mockClear())

	it("should default to no wait", async () => {
		const task = createTask(Array(4))
		expect.assertions(4)
		
		await sisyphus().triesTo(task).now()
		expect(setTimeout).toBeCalledTimes(3)
		for(let i = 1; i < 4; i++) {
			expect(setTimeout).toHaveBeenNthCalledWith(i, expect.anything(), 0)
		}
	})

	it("should wait according to function provided to .waiting", async () => {
		const task = createTask(Array(4))
		const times = [4123, 1235, 8915]
		let i = 0
		expect.assertions(4)
		
		await sisyphus().triesTo(task).waiting(() => times[i++]).now()
		expect(setTimeout).toBeCalledTimes(3)
		for(let i = 1; i < 4; i++) {
			expect(setTimeout).toHaveBeenNthCalledWith(i, expect.anything(), times[i-1])
		}
	})

	it("should wait a constant amount of time with .every", async () => {
		const task = createTask(Array(4))
		expect.assertions(4)
		
		await sisyphus().triesTo(task).every(3624).now()
		expect(setTimeout).toBeCalledTimes(3)
		for(let i = 1; i < 4; i++) {
			expect(setTimeout).toHaveBeenNthCalledWith(i, expect.anything(), 3624)
		}
	})
})
