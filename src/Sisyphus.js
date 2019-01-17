const retry = (task, times, wait, attempt) =>
	task().catch(err => {
		if(attempt + 1 >= times) {
			throw err
		}
		return new Promise(resolve => setTimeout(resolve, wait(attempt)))
			.then(() => retry(task, times, wait, attempt + 1))
	})

class Sisyphus {
	constructor() {
		this._task = Promise.resolve.bind(Promise)
		this._wait = () => 0
		this._times = Infinity
	}

	// Tasks
	triesTo(task) {
		this._task = task
		return this
	}
	get tries() { return this.triesTo }

	// Attempts
	trying(times) {
		this._times = times
		return this
	}
	get times() { return this }
	get time()  { return this }
	once()         { return this.trying(1) }
	twice()        { return this.trying(2) }
	thrice()       { return this.trying(3) }
	indefinitely() { return this.trying(Infinity) }
	get infinite() { return this.indefinitely }

	// Wait
	waiting(fn) {
		this._wait = fn
		return this
	}
	get ms() { return this }
	get backingOff() { return this.waiting }
	every(ms) { return this.waiting(() => ms) }

	now() { return retry(this._task, this._times, this._wait, 0) }
	get $() { return this.now }
}

export default Sisyphus
