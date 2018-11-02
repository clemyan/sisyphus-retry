import { delegate } from './utils'

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

	triesTo(task) {
		this._task = task
		return this
	}
	get tries() { return this.triesTo }

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

	waiting(fn) {
		this._wait = fn
		return this
	}
	every(ms) {
		this._wait = () => ms
		return this
	}
	get ms() { return this }
	backingOff() {
		return {
			linearly: (start = 0, increment = 0) => {
				this._wait = retry => start + retry * increment
				return _delegate({
					startingAt:     function(ms) { start     = ms; return this },
					incrementingBy: function(ms) { increment = ms; return this },
					get ms() { return this }
				}, this)
			},
			exponentially: (start = 0, factor = 1) => {
				this._wait = retry => start + Math.pow(factor, retry)
				return _delegate({
					startingAt: function(value) { start  = value; return this },
					withFactor: function(value) { factor = value; return this },
					get ms() { return this }
				}, this)
			}
		}
	} 

	now() { return retry(this._task, this._times, this._wait, 0) }
	get $() { return this.now }
}

const _delegate = delegate(Object.getOwnPropertyNames(Sisyphus.prototype))

export default Sisyphus
