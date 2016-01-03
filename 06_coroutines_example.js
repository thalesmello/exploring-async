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
