import { delay, delegate } from './utils'

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

	$() {
		return (function retry(task, times, wait, attempt) {
			return task().catch(err => {
				if(attempt + 1 >= times) {
					throw err
				}
				return delay(wait(attempt)).then(() => retry(task, times, wait, attempt + 1))
			})
		})(this._task, this._times, this._wait, 0)
	}
}

const _delegate = delegate(Object.getOwnPropertyNames(Sisyphus.prototype))

export default Sisyphus
