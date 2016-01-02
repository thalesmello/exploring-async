# Exploring Async Techniques in JavaScript

## Callbacks

In the JavaScript world, this is the simplest form of asynchronous programming
and is used by almost all of the APIs in the language. It consists of passing
a callback function as an argument in a function call, so the callback function
is called when the desired behavior is supposed to happen.

```js
setTimeout(() => console.log("Hello world!"), 1000);
```

The problem with callbacks is that it can get messy really fast when you are
trying to make more complex programs, which leads to the frequently called
callback hell.

```js
var areThingsComplicated = false,
    timer;

setTimeout(() => {
    console.log("Things can get...");
    setTimeout(() => {
        console.log("complicated.");
        areThingsComplicated = true;

        setTimeout(() => clearTimeout(timer), 1000);
    }, 1000);
}, 2000);

timer = setInterval(() => {
    if(areThingsComplicated) {
        console.log("Oh no!");
    } else {
        console.log("What?");
    }
}, 500);
```

We can improve the situation here if 

## Promises

Promises are the solution preferred by the JavaScript community to avoid
callback hell. It defines an API that handles asynchronous events elegantly.
When you have a promise, you can pass a call `.then` passing in a callback
function. But the function returns another promise with the return value of
the previous callback. The advantage is that you can use it to chain callbacks,
making it really simple to compose complicated behaviors.

```js
new Promise(resolve => setTimeout(() => resolve("Hello World!"), 1000))
    .then(value => {
        console.log("Value!");
        return new Promise(resolve => setTimeout(() => resolve("I'll be back"), 1000));
    })
    .then(value => console.log(value));
```

The advantage of chaining callbacks this way is that it maintains a single
indentation level.

```js

```

## Coroutines


## Async & Await


## Reactive Extensions


## Communicating Sequential Processes
