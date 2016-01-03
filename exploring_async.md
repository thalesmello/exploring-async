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
var aBootTime = 1000,
    bBootTime = 1000,
    queueCallback = null,
    serverHandler = null;

console.log("A: Booting up system...")
setTimeout(() => {
    console.log("A: Checking network connection");
    setTimeout(() => {
        console.log("A: Request complex computation");

        sendRequest(value => {
            console.log("A: Computation returned " + value);
        });
    }, 500);
}, aBootTime);

console.log("B: Booting up system...")
setTimeout(() => {
    console.log("B: Server up and running");
    serverHandler = (callback) => {
        console.log("B: Starting heavy computation");
        setTimeout(() => callback(42), 2000)
    }
    if (queueCallback) {
        serverHandler(queueCallback);
        queueCallback = null;
    }
}, bBootTime);

function sendRequest(callback) {
    if(serverHandler) {
        serverHandler(callback);
    } else {
        queueCallback = callback;
    }
}
```

We can improve the situation here if we used named functions to control the flow.

```js
var aBootTime = 1000,
    bBootTime = 1000,
    queueCallback = null,
    serverHandler = null;

serverA();
serverB();

function serverA() {
    console.log("A: Booting up system...");
    setTimeout(checkNetwork, aBootTime);

    function checkNetwork() {
        console.log("A: Checking network connection");
        setTimeout(sendRequest, 500);
    }

    function sendRequest() {
        console.log("A: Request complex computation");
        sendNetworkRequest(callback);
    }

    function callback(value) {
        console.log("A: Computation returned " + value);
    }
}

function serverB() {
    console.log("B: Booting up system...")
    setTimeout(listenRequests, bBootTime);

    function listenRequests() {
        console.log("B: Server up and running");
        serverHandler = handler;

        if (queueCallback) {
            serverHandler(queueCallback);
            queueCallback = null;
        }
    }

    function handler(callback) {
        console.log("B: Starting heavy computation");
        setTimeout(() => callback(42), 2000)
    }
}

function sendNetworkRequest(callback) {
    if(serverHandler) {
        serverHandler(callback);
    } else {
        queueCallback = callback;
    }
}
```

It's now easier to follow what is happening in the code. The problem with it
is that, each `setTimeout()` call is now coupled with the callback functions.

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
var Promise = require("bluebird"),
    aBootTime = 1000,
    bBootTime = 1000,
    promiseB;

serverA();
promiseB = serverB();

function serverA() {
    console.log("A: Booting up system...");
    return Promise.delay(aBootTime)
        .then(checkNetwork)
        .delay(500)
        .then(sendRequest);

    setTimeout(checkNetwork, aBootTime);

    function checkNetwork() {
        console.log("A: Checking network connection");
    }

    function sendRequest() {
        console.log("A: Request complex computation");
        sendNetworkRequest(callback);
    }

    function callback(value) {
        console.log("A: Computation returned " + value);
    }
}

function serverB() {
    console.log("B: Booting up system...")

    return Promise.delay(bBootTime).then(listenRequests);

    function listenRequests() {
        console.log("B: Server up and running");
        return serverHandler;
    }

    function serverHandler(callback) {
        console.log("B: Starting heavy computation");
        Promise.delay(2000).then(answerRequest);

        function answerRequest() {
            callback(42);
        }
    }
}

function sendNetworkRequest(callback) {
    promiseB.then(serverHandler => serverHandler(callback));
}
```

## Coroutines

The coroutines technique is makes a smart use of the new generator feature
in the ES6 specification. Generators make it possible to suspend and resume
function execution. Some libraries such as Bluebird make use of it in order
to provide a convenient way to await the return of promises. Our previous
example become a lot simpler once we make use of the coroutine feature.

```js
var Promise = require("bluebird"),
    delay = Promise.delay,
    promisify = Promise.promisify,
    coroutine = Promise.coroutine,
    aBootTime = 1000,
    bBootTime = 1000,
    promiseB;

coroutine(serverA)();
promiseB = coroutine(serverB)();

function* serverA() {
    console.log("A: Booting up system...");
    yield delay(aBootTime);
    console.log("A: Checking network connection");
    yield delay(500);
    console.log("A: Request complex computation");
    var serverHandler = yield promiseB;
    var value = yield serverHandler();
    console.log("A: Computation returned " + value);
}

function* serverB() {
    console.log("B: Booting up system...")
    yield delay(bBootTime);
    console.log("B: Server up and running");
    return promisify(coroutine(serverHandler));

    function* serverHandler(callback) {
        console.log("B: Starting heavy computation");
        yield delay(2000);
        callback(null, 42);
    }
}
```

## Async & Await

```js
var Promise = require("bluebird"),
    delay = Promise.delay,
    promisify = Promise.promisify,
    coroutine = Promise.coroutine,
    aBootTime = 1000,
    bBootTime = 1000,
    promiseB;

serverA();
promiseB = serverB();

async function serverA() {
    console.log("A: Booting up system...");
    await delay(aBootTime);
    console.log("A: Checking network connection");
    await delay(500);
    console.log("A: Request complex computation");
    var serverHandler = await promiseB;
    var value = await serverHandler();
    console.log("A: Computation returned " + value);
}

async function serverB() {
    console.log("B: Booting up system...")
    await delay(bBootTime);
    console.log("B: Server up and running");
    return promisify(serverHandler);

    async function serverHandler(callback) {
        console.log("B: Starting heavy computation");
        await delay(2000);
        callback(null, 42);
    }
}
```

## Reactive Extensions

```js
var Rx = require("rx");

Rx.Observable
    .interval(500)
    .map(x => x + 1)
    .takeWhile(x => x <= 3)
    .concat(Rx.Observable.of("World"))
    .subscribe(x => console.log("Hello " + x + "!"));
```

```js
var Promise = require("bluebird"),
    Rx = require("rx"),
    aBootTime = 1000,
    bBootTime = 1000,
    observableB;

serverA();
observableB = serverB();

function serverA() {
    console.log("A: Booting up system...");
    return Rx.Observable.timer(aBootTime)
        .do(checkNetwork)
        .delay(500)
        .flatMap(sendRequest)
        .subscribe(observer);

    setTimeout(checkNetwork, aBootTime);

    function checkNetwork() {
        console.log("A: Checking network connection");
    }

    function sendRequest() {
        console.log("A: Request complex computation");
        return Rx.Observable.fromCallback(sendNetworkRequest)();
    }

    function observer(value) {
        console.log("A: Computation returned " + value);
    }
}

function serverB() {
    console.log("B: Booting up system...")
    var subject = new Rx.AsyncSubject();
    Rx.Observable.timer(bBootTime).map(listenRequests).subscribe(subject);
    return subject;

    function listenRequests() {
        console.log("B: Server up and running");
        return serverHandler;
    }

    function serverHandler(callback) {
        console.log("B: Starting heavy computation");
        Rx.Observable.timer(2000).subscribe(answerRequest);

        function answerRequest() {
            callback(42);
        }
    }
}

function sendNetworkRequest(callback) {
    observableB.subscribe(serverHandler => serverHandler(callback));
}
```

## Communicating Sequential Processes

```js
var aBootTime = 1000,
    bBootTime = 1000,
    csp = require("js-csp"),
    timeout = csp.timeout,
    network = csp.chan();

csp.go(serverA);
csp.go(serverB);

function* serverA() {
    console.log("A: Booting up system...");
    yield timeout(aBootTime);
    console.log("A: Checking network connection");
    yield timeout(500);
    console.log("A: Request complex computation");
    yield csp.put(network, "request");
    var value = yield csp.take(network);
    console.log("A: Computation returned " + value);
    network.close();
}

function* serverB() {
    console.log("B: Booting up system...")
    yield timeout(bBootTime);
    console.log("B: Server up and running");
    while(true) {
        var request = yield csp.take(network);
        if(request === csp.CLOSED) {
            break;
        }
        console.log("B: Starting heavy computation");
        yield timeout(2000);
        yield csp.put(network, 42);
    };
}
```

## Summary

<center>
    <table>
        <tr>
            <td></td>
            <td>One</td>
            <td>Multiple</td>
        </tr>
        <tr>
            <td>Functional</td>
            <td>
                Callbacks</br>
                Promises</br>
            </td>
            <td>
                Reactive</br>Extensions
            </td>
        </tr>
        <tr>
            <td>Imperative</td>
            <td>
                Coroutines</br>
                Async & Await</br>
            </td>
            <td>Communicating</br>Sequential</br>Processes</td>
        </tr>
    </table>
</center>
