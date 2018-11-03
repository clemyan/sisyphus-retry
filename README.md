# sisyphus-retry

[![npm](https://img.shields.io/npm/v/sisyphus-retry.svg?longCache=true&style=flat-square)](https://www.npmjs.com/package/sisyphus-retry)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/sisyphus-retry.svg?longCache=true&style=flat-square&label=min%2Bgzip)](https://bundlephobia.com/result?p=sisyphus-retry)
[![GitHub](https://img.shields.io/github/license/clemyan/sisyphus-retry.svg?longCache=true&style=flat-square)](https://github.com/clemyan/sisyphus-retry/blob/master/LICENSE)

Lightweight library for retrying asynchronous tasks with fluent API.

Based on [this reddit comment](https://www.reddit.com/r/javascript/comments/922sei/async_retries/e32ydln/).

## Installation

### npm

```bash
$ npm install sisyphus-retry
# or
$ yarn add sisyphus-retry
# or
$ pnpm install sisyphus-retry
```

### UNPKG

```html
<script src="https://unpkg.com/sisyphus-retry"></script>
```

## Usage

```javascript
import sisyphus from 'sisyphus-retry'

// A task that never succeeds
const pushBoulder = () =>
	Promise.reject(new Error("Boulder rolls down again!"))

// A network request using axios
const fetchData = () => axios.get('/url/to/data')

sisyphus()
    .triesTo(pushBoulder) // Sets the task
    .indefinitely()       // Max # of attempts = Infinity
    .waiting(100).ms      // Wait 100 ms in between attempts
    .now()                // Go

sisyphus()
    .triesTo(fetchData)     // Sets the task
    .trying(5).times        // Max # of attempts = 5
    .backingOff()           // Exponential backoff
        .exponentially()
        .startingAt(100).ms
        .withFactor(2)
    .now()                  // Returns promise:
    .then(function(response) {
        // ...
    })
    .catch(function(err) {
        // ...
    })
```

## API

### `sisyphus()`

Creates a new Sisyphus instance. Do not use the `new` keyword.

----

### Fluent no-ops

The properties `.time`, `.times`, and `.ms` are references back to the Sisyphus instance. These are provided simply for fluency.

----

### Tasks

In Sisyphus, an async task is a function that returns a promise to relay success/failure. Sisyphus retries async tasks (by calling the function again) for you if the promise rejects.

Sisyphus instances defaults to a task that always succeeds immediately.

#### `.triesTo(task)`

*Alias: `.tries`*

Sets the task to be run by the Sisyphus instance

#### `.now()`

*Alias: `.$`*

Starts the initial attempt of the async task.

`.now()` returns a promise. If and when any attempt succeeds, the promise is resolved with the same value as the task. If the maximum number of attempts is reached without a successful attempt, the promise is rejected with the same reason as the last attempt.

----

### Max attempts

Sisyphus instances by default retry their tasks indefinitely, but they can also be configured to retry only up to a finite number of times.

#### `.trying(num)`

Sets the maximum number of attempt. This includes the initial attempt. If num is zero or negative, behavior is unspecified.

#### `.once()`, `.twice()`, `.thrice()`, `.indefinitely()`, `.infinte()`

These convenience methods set the maximum number of attempts to the corresponding value.

----

### Wait time / Backoff

Sisyphus instances can also be configured to wait a certain amount of time between an attempt failing and starting the next attempt, or even increase the wait time as it retries the task.

Sisyphus instances default to no wait time.

#### `.waiting(fn)`

This sets a function to calculate the wait time. The function is called with the attempt number that just failed, with the initial attempt being the 0<sup>th</sup> attempt, and should return the number of milliseconds to wait before the next attempt.

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

----

#### `.backingOff()`

This method returns a "backoff object" with methods to configure the wait time with some common backoff strategies.

Unless specified otherwise, this backoff object and the backoff strategy objects delegate properties and method calls back to the Sisyphus instance. This allows one to "escape" the backoff configuration and "go back" to the Sisyphus instance seamlessly.

#### `.backingOff().linearly([start, [increment]])`

Linear backoff. The wait time after the initial attempt is `start` milliseconds. Each subsequent attempt has wait time `increment` milliseconds more than the last.

`start` and `increment` both defaults to 0.

This method returns a "strategy object" that has `.startingAt(ms)` and `.incrementingBy(ms)` methods to reconfigure the linear backoff fluently. Both methods are chainable.

The `.ms` property of a linear backoff strategy object is a reference to the strategy object itself, rather than the Sisyphus instance.

#### `.backingOff().exponentially([start, [factor]])`

Exponential backoff. The wait time after the initial attempt is `start` milliseconds. Each subsequent attempt has wait time equal to the last one multiplied by `factor` .

`start` and `factor` defaults to 0 and 1, respectively.

This method returns a "strategy" object that has `.startingAt(ms)` and `.withFactor(factor)` methods to reconfigure the exponential backoff fluently. Both methods are chainable.

The `.ms` property of an exponential backoff strategy object is a reference to the strategy object itself, rather than the Sisyphus instance.

## Sisyphus?

Sisyphus is a greek mythology figure who is punished by Zeus to roll a boulder up a hill, but the boulder is enchanted to roll down every time it nears the top, trapping Sisyphus indefinitely.

## License

MIT
