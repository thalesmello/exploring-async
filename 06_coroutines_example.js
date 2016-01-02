var Promise = require("bluebird"),
    delay = Promise.delay,
    timer = setInterval(intervalLoop, 500),
    areThingsComplicated = false;

Promise.coroutine(complicatedBehaviour)();

function* complicatedBehaviour() {
    var value;

    value = yield delay(2000, "First Return Value");
    logArgument(value);
    console.log("Things can get...");

    value = yield delay(1000, "Second Return Value");
    logArgument(value);
    areThingsComplicated = true;
    console.log("complicated.");

    value = yield delay(1000, "Third Return Value");
    logArgument(value);
    clearInterval(timer);
}

function logArgument(value) {
    console.log("ARGUMENT -> " + value);
}

function intervalLoop() {
    if(areThingsComplicated) {
        console.log("Not much");
    } else {
        console.log("What?");
    }
}
