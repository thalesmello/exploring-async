# Exploring Async Techniques in JavaScript

During the past few months, I've been exploring a few different techniques that
can be use to write asynchronous programs. I'd like to share my experience via this essay.

Even though we are using JavaScript for this, many of these techniques can be used
in other languages with equivalent manners.

## Callbacks

In the JavaScript world, this is the simplest form of asynchronous programming
and is used by almost all of the APIs in the language. It consists of passing
a callback function as an argument in a function call, so the callback function
is called when the desired behavior is supposed to happen.

```js
setTimeout(() => console.log("Hello world!"), 1000);
// Hello world!
```

The problem here is that it can get messy really fast when you are
trying to make more complex programs, which leads to the frequent problem
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
// A: Booting up system...
// B: Booting up system...
// A: Checking network connection
// B: Server up and running
// A: Request complex computation
// B: Starting heavy computation
// A: Computation returned 42
```

In the snippet above, we have servers A and B. As soon as server A boots up and
checks its network connection, it sends a computation request to server B. Once
the computation is done, server B responds to server A. Finally, server A prints
the response to the screen. Because of the necessity for two different parts
of the code to communicate with each other, we have global variables to share
state among the two different servers. That, in turn, make it really complicated
to follow up what's going on in the code, hence the callback hell.

One possible way we can improve the code above is to improve the code is
to name the callbacks and reduce the indentation level of the named functions.

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
// A: Booting up system...
// B: Booting up system...
// A: Checking network connection
// B: Server up and running
// A: Request complex computation
// B: Starting heavy computation
// A: Computation returned 42
```

Even though it's now easier to follow, there's a lot of room for improvement.
For that, let's go ahead to the next technique in our agenda.

## Promises

Promises are the solution preferred by the JavaScript community to avoid
callback hell. It defines an API that handles asynchronous events elegantly.
When you have a promise, you can pass a call `.then` passing in a callback
function for when the Promise is done with our computation.

The key point here is that, in every `.then` function call, a new Promise is
returned when the previous callback is done. That allows us to chain Promises
together, so we can compose really complex behaviors.

```js
new Promise(resolve => setTimeout(() => resolve("Hello World!"), 1000))
    .then(value => {
        console.log("Value!");
        return new Promise(resolve => setTimeout(() => resolve("I'll be back"), 1000));
    })
    .then(value => console.log(value));
// Value!
// I'll be back
```

With this new trick up our sleeves, let's try to rewrite our previous server
example, but making use of the [Bluebird][1] library, which is an efficient
implementation of Promises that has several support methods which we are going
to use in these examples.

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
// A: Booting up system...
// B: Booting up system...
// A: Checking network connection
// B: Server up and running
// A: Request complex computation
// B: Starting heavy computation
// A: Computation returned 42
```

Notice that, in the snippet above, we've removed the shared state between
the servers. Previously, it was used to keep track of which server was up and
running. Because Promises can simple callback once it's done with its
computation, the need for shared state went away.

## Generator Coroutines

The generator coroutines technique makes a smart use of the new generator feature
of the ES6 specification. Generators make it possible to suspend and resume
function execution. [Bluebird][1] uses it to provide a convenient way to
await the return of promises, almost as if it was a synchronous function call.
Our previous example become a lot simpler once we make use of the coroutine
feature.

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
// A: Booting up system...
// B: Booting up system...
// A: Checking network connection
// B: Server up and running
// A: Request complex computation
// B: Starting heavy computation
// A: Computation returned 42
```

In the snippet above, the `coroutine` function takes in a generator `function*`,
which makes it possible to `yield` promises, get their response, and resume
the function from where it left off. Notice that it manages to describe our
problem with a greater simplicity, almost as if we were writing a synchronous
program.

## Async & Await

Inspired by C#, the Async & Await is currently a proposal for the ES7
specification, and it's syntax is experimental. It might change upon final
release. Nevertheless, it consists of the same idea of the Generator Coroutines method.
Inside an function marked with the `async` keyword, you're able to `await` the
result of Promises, such that you have a very similar structure to the
previous technique.

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
// A: Booting up system...
// B: Booting up system...
// A: Checking network connection
// B: Server up and running
// A: Request complex computation
// B: Starting heavy computation
// A: Computation returned 42
```

When you compare the snippet above with the previous example, you notice the
syntax is a little cleaner, which is to be expected as that's the use case for
which `async` and `await` were designed, whereas Generators were originally
designed to generate enumerable values in a lazy manner. However, because this
feature is currently experimental, you are better off using the Generator Coroutines
technique in your projects, as you only require generators, which are already
very well supported in the JavaScript world.

## Reactive Extensions

Also influenced by the C# community, Reactive Extensions (Rx), made available in
JavaScript through [Rx.js][2], it makes it possible to use enumerable higher
order functions (such as map, filter and reduce) over streams of asynchronous
events. It makes it a more appropriate tool for when you have to manipulate
several asynchronous events at once.  

```js
var Rx = require("rx");

Rx.Observable
    .interval(500)
    .map(x => x + 1)
    .takeWhile(x => x <= 3)
    .concat(Rx.Observable.of("World"))
    .subscribe(x => console.log("Hello " + x + "!"));
// Hello 1!
// Hello 2!
// Hello 3!
// Hello World!
```

In the snippet above, we make use of `map`, `takeWhile` and `concat` just as
if we were working with an array. The difference here is that the events
happen over time.

Now, we are going to try to make use of Reactive Extensions to implement our
server communication example.

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
// A: Booting up system...
// B: Booting up system...
// A: Checking network connection
// B: Server up and running
// A: Request complex computation
// B: Starting heavy computation
// A: Computation returned 42
```

In the snippet above, we make use of an AsyncSubject in order for the Observable
result to be readily available when we subscribe to it. If you want to learn
more about it, please read about [Hot and Cold observables][3].

From the snippet above, we notice the implementation is a lot more complicated
than the Generator Coroutine version, and slightly more complicated than the
Promises version. It happens because this isn't the most appropriate technique
to solve our problem, as we are dealing with with several types of non repeating
asynchronous events, as opposed to fewer types of repeating events.

So, it might be worth it to learn Reactive Extensions because there will be
situations in which your problem will be more easily solved by Promises,
whereas others will have simpler solutions with Reactive Extensions. Another
advantage of learning Reactive Extensions is that it has a relatively uniform
API implementations across [many different languages][4], such as [Ruby][5], [Lua][6].

## Communicating Sequential Processes

Made popular by Go, this technique, CSP for short, has the concept of processes
independent of each other which communicate solely by channels. The idea here is that,
if a process tries to write to a channel and there is no other process reading from it,
it blocks. If a process tries to read from a channel, but there is no other process to write
to it, it blocks.

The [js-csp][7] library manages to implement it in JavaScript by also making a smart use of
generators. Let's see how our servers example looks like with it.

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
// A: Booting up system...
// B: Booting up system...
// A: Checking network connection
// B: Server up and running
// A: Request complex computation
// B: Starting heavy computation
// A: Computation returned 42
```

In the snippet above, each time we have a `yield csp.put`, we write to the channel.
Each time we have a `yield csp.take`, we block execution until there is a value to
read from. Differently than the Generator Coroutines method, here we have a direct
communication channel between the two servers. CSP makes the code looks like as if
we are writing two completely different sequential programs.

Another advantage to this technique is that, because a channel is also a sequence
of asynchronous data, you can also make use of enumerable higher order functions
(map, filter, reduce, etc), albeit fewer higher order functions when compared to
Reactive Extensions.


## Summary

In this essay, we explored several different asynchronous programming techniques
which can be used in JavaScript. Some of them tend to be more functional, making
heavier use of functions in order to abstract the code, whereas in others you
you think more in an imperative manner. I guess a nice way to put it is in the table
below.

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
                Generator Coroutines</br>
                Async & Await</br>
            </td>
            <td>Communicating</br>Sequential</br>Processes</td>
        </tr>
    </table>
</center>

Please take notice these techniques aren't mutually exclusive.

In my use cases, I'd probably adopt the following strategies:

* In simple function calls, I'm are probably better off with callbacks

* When I have to deal with many different asynchronous returns, maybe
  the way to go is to use Promises and tie them together with a Generator Coroutine

* When I have sequences of events, be it a stream of positions of
  the cursor on the screen, that's probably more easily handled with Reactive Extensions.

* In any situation I would have to deal with mutable state, I'd probably
  be better off with CSP.

[1]: http://bluebirdjs.com/
[2]: https://github.com/Reactive-Extensions/RxJS
[3]: http://www.introtorx.com/content/v1.0.10621.0/14_HotAndColdObservables.html
[4]: http://reactivex.io/
[5]: https://github.com/ReactiveX/RxRuby
[6]: https://github.com/bjornbytes/RxLua
[7]: https://github.com/ubolonton/js-csp
