# sisyphus-retry

[![npm](https://img.shields.io/npm/v/sisyphus-retry.svg?style=flat-square)](https://www.npmjs.com/package/sisyphus-retry)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/sisyphus-retry.svg?style=flat-square&label=min%2Bgzip)](https://bundlephobia.com/result?p=sisyphus-retry)
[![GitHub](https://img.shields.io/github/license/clemyan/sisyphus-retry.svg?longCache=true&style=flat-square)](https://github.com/clemyan/sisyphus-retry/blob/master/LICENSE)

Lightweight library for retrying asynchronous tasks with fluent API.

Based on [this reddit comment](https://www.reddit.com/r/javascript/comments/922sei/async_retries/e32ydln/).

## Installation

### Formats

`sisyphus-retry` distributes in a number of formats.

|                                   | Format               | Minified?          | Main use case  |
| --------------------------------- | -------------------- |:------------------:| -------------- |
| [source](#source)                 | ES2015 module        | :x:                | Bundler        |
| [es](#es2015-module)              | ES2015 module        | :heavy_check_mark: | Modern browser |
| [cjs](#commonjs)                  | CommonJS             | :heavy_check_mark: | Node           |
| [global](#global-variable-export) | Global var export    | :heavy_check_mark: | Browser        |

#### Source

For being built by a ES2015-aware bundler since those work better using unminfied source. A bundler that respects the "module" package.json field (e.g. Webpack 2+, rollup) will use this distributable.

#### ES2015 module

Minified ES2015 module. This is for importing in the modern browsers that [support](https://caniuse.com/#feat=es6-module) `<script type=module>`. See the [Broswer](#modern-broswer) section.

#### CommonJS

Mainly for `require` from NodeJS, which uses this distributable because of the package.json "main" field.

#### Global variable export

This exports to the `sisyphus` global variable. Mainly for being used from a broswer via `<script>`.

### npm

```bash
$ npm install sisyphus-retry
# or
$ yarn add sisyphus-retry
# or
$ pnpm install sisyphus-retry
```

The npm package includes all formats

### Modern browsers

If you only target modern browsers that [support ES2015 modules](https://caniuse.com/#feat=es6-module).

```html
<script type="module">
import sisyphus from '//unpkg.com/sisyphus-retry/dist/sisyphus.es.js'
// Your code
</script>

<!-- or, for a specific version -->

<script type="module">
import sisyphus from '//unpkg.com/sisyphus-retry@0.2.0/dist/sisyphus.es.js'
// Your code
</script>
```

### Browsers

If you target browsers that don't support ES2015 modules, either use the global variable bundle

```html
<script src="//unpkg.com/sisyphus-retry"></script>
<!-- or, for a specific version -->
<script src="//unpkg.com/sisyphus-retry@0.2.0"></script>
```

or use a fallback

```html
<script type="module">
import sisyphus from '//unpkg.com/sisyphus-retry/dist/sisyphus.es.js'
window.sisyphus = sisyphus
</script>
<script src="//unpkg.com/sisyphus-retry" nomodule></script>
<script>
// Now sisyphus is defined as a global
</script>
```

Like above, you can use a specific version by adding specifiers

## Usage

### Example

```javascript
import sisyphus from 'sisyphus-retry'
import exponentially from 'sisyphus-retry/dist/wait/exponentially.es.js'

// A task that never succeeds
const pushBoulder = () =>
	Promise.reject(new Error("Boulder rolls down again!"))

// A network request using axios
const fetchData = () => axios.get('/url/to/data')

sisyphus()
	.triesTo(pushBoulder) // Sets the task
	.indefinitely()       // Max # of attempts = Infinity
	.every(100).ms        // Wait 100 ms in between attempts
	.now()                // Go

sisyphus()
	.triesTo(fetchData)         // Sets the task
	.trying(5).times            // Max # of attempts = 5
	.backingOff(exponentially() // Exponential backoff
		.startingAt(100).ms
		.withFactor(2))
	.now()                      // Returns promise:
	.then(function(response) {
		// ...
	})
	.catch(function(err) {
		// ...
	})
```

## Introduction

### Tasks

In Sisyphus, an **async task** (or simply task) is a function that, when called with no arguments, returns a promise. A call of a task is known as an **attempt**. If and when the promise fulfills with some value, the task is said to succeed with that value. On the other hand, if and when the promise rejects with some reason, the task is said to fail with that reason.

A Sisyphus instance attempts the given task until an attempt succeeds or until a configured maximum number of attempts is reached.

## API

### Creation

#### `sisyphus()`

Creates and returns a Sisyphus instance. Note that due to the fluent api, it is usually unnecessary to assign the instance to a variable.

### Properties

#### Fleunt no-ops

The `.ms`, `.time` and `.times` properties are references back to the instance. They are provided simply for fluency.

### Instance methods

All instance methods, except otherwise sepcified, returns the instance.

#### `.triesTo(task)`, `.tries(task)`

Sets the task to be run by the Sisyphus instance. The default task (the one set on instance creation) is one that succeeds with `undefined` immediately.

#### `.trying(num)`

Sets the maximum number of attempts. If num is zero or negative, behavior is unspecified. The default  maximum is infinite (no limit).

#### `.once()`, `.twice()`, `.thrice()`, `.indefinitely()`, `.infinte()`

These convenience methods set the maximum number of attempts to the corresponding value.

#### `.waiting(fn)`, `.backingOff(fn)`

This sets a function to calculate a wait time between attempts. The function is called with the attempt number that just failed, with the initial attempt being the 0<sup>th</sup> attempt, and should return the number of milliseconds to wait before the next attempt.

```javascript
// Constant wait time
sisyphus().waiting(n => 1000)

// Linear backoff
// Note that after the initial attempt fails, the next one will immediately start
sisyphus().waiting(n => 1000 * n)

// The world is your oyster
sisyphus().waiting(n => Math.floor(1000 * n * Math.random()))
```

#### `.every(ms)`

A convenience method for a constant wait time, given in milliseconds

#### `.now()`, `.$()`

Runs the task with retries. Returns a promise.

Since the `.now` takes no arguments (although it requires the Sisyphus instance as `this`) and returns a promise, it can itself be thought of as a task -- one that succeeds with the same value if and when any attempt of the inner task succeeds.

If the Sisyphus instance has no maximum attempt limit, then the outer task never fails. If the Sisyphus instance has a maximum attempt limit, then the outer task fails with the same reason if and when the last attempt of the inner task fails.

The high-level algorithm of the outer task is:

1. Attempt the inner task
2. If attempt succeeds, the outer task succeeds with the same value as this attempt. END
3. If attempt fails, and the number of attempts finished >= configured maximum, the outer task fails with the same reason as this attempt. END
4. Otherwise, call the wait function to get the wait time
5. Wait that many milliseconds
6. Go back to step 1

**Note on concurrency**: Between calling `.now`/`.$` and the return promise settles, do not change any configuration of that Sisyphus instance or call  `.now`/`.$` again. The behavior after doing so is unspecified.

## Wait time addons

Sisyphus includes some fluently-configurable wait functions.

|        | Linear Backoff              | Exponential Backoff              |
| ------ | --------------------------- | -------------------------------- |
| source | `src/wait/linearly.js`      | `src/wait/exponentially.js`      |
| es     | `dist/wait/linearly.es.js`  | `dist/wait/exponentially.es.js`  |
| cjs    | `dist/wait/linearly.cjs.js` | `dist/wait/exponentially.cjs.js` |
| extend | `dist/wait/linearly.js`     | `dist/wait/exponentially.js`     |

For the npm package, the above paths are relative to the package root. For UNPKG, the paths are relative to `//unpkg.com/sisyphus-retry`.

The "extend" format is to be used with the "global" main format. They find a `sisyphus` global variable and exports to `sisyphus.wait.linear` and `sisyphus.wait.exponentially` respectively.

### Linear Backoff

#### `linearly([start, [increment]])`

Returns a linear backoff function. The wait time after the initial attempt is `start` milliseconds. Each subsequent attempt has wait time `increment` milliseconds more than the last.

`start` and `increment` both defaults to 0.

#### Properties

The `.ms` property of a linear backoff function is a reference to the function itself

#### Instance methods

The linear backoff functions also have `.startingAt(ms)` and `.incrementingBy(ms)` methods to reconfigure the linear backoff fluently.

### Exponential Backoff

#### `exponentially([start, [factor]])`

Returns an exponential backoff function. The wait time after the initial attempt is `start` milliseconds. Each subsequent attempt has wait time equal to the last one multiplied by `factor`.

`start` and `factor` defaults to 0 and 1, respectively.

#### Properties

The `.ms` property of an exponential backoff function is a reference to the function itself

#### Instance methods

The exponential backoff functions also have  `.startingAt(ms)` and `.withFactor(factor)` methods to reconfigure the exponential backoff fluently.

## Sisyphus?

Sisyphus is a greek mythology figure who is punished by Zeus to roll a boulder up a hill, but the boulder is enchanted to roll down every time it nears the top, trapping Sisyphus indefinitely.

## License

MIT
