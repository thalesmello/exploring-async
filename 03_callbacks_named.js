var aBootTime = 1000;
    bBootTime = 1000;
    queueCallback = null,
    serverHandler = null;

serverA();
serverB();

function serverA() {
    console.log("A: Booting up system...")
    setTimeout(checkNetwork, aBootTime);

    function checkNetwork() {
        console.log("A: Checking network connection");
        setTimeout(sendRequest, 500);
    }

    function sendRequest() {
        console.log("A: Request complex computation");
        sendNetworkRequest(callback);

        function callback(value) {
            console.log("A: Computation returned " + value);
        }
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

        function handler(callback) {
            console.log("B: Starting heavy computation");
            setTimeout(() => callback(42), 2000)
        }
    }
}

function sendNetworkRequest(callback) {
    if(serverHandler) {
        serverHandler(callback);
    } else {
        queueCallback = callback;
    }
}
