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
