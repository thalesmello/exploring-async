// This uses experimental syntax.
// To run it, use `regenerator -r 07_async_await_example.js | node`

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
