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
