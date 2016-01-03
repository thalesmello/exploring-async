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
