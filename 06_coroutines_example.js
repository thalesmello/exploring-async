var Promise = require("bluebird"),
    delay = Promise.delay,
    timer = setInterval(intervalLoop, 500),
    areThingsComplicated = false;

Promise.coroutine(complicatedBehaviour)();

function* complicatedBehaviour() {
    yield delay(2000);
    console.log("Things can get...");
    yield delay(1000);
    areThingsComplicated = true;
    console.log("complicated.");
    yield delay(1000);
    clearInterval(timer);
}

function intervalLoop() {
    if(areThingsComplicated) {
        console.log("Not much");
    } else {
        console.log("What?");
    }
}
