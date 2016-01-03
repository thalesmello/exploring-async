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
