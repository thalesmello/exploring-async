var areThingsComplicated = false,
    timer = setInterval(intervalLoop, 500);

delay(2000, "First Return Value")
    .then(debug(thingsCanGet))
    .then(() => delay(1000, "Second Return Value"))
    .then(debug(complicated))
    .then(() => delay(1000, "Third Return Value"))
    .then(debug(breakLoop));

function thingsCanGet(value) {
    console.log("Things can get...");
}

function complicated(value) {
    console.log("complicated");
    areThingsComplicated = true;
}

function breakLoop(value) {
    clearInterval(timer);
}

function intervalLoop() {
    if(areThingsComplicated) {
        console.log("Not much though.");
    } else {
        console.log("What?");
    }
}

function debug(func) {
    return funcWithDebug;

    function funcWithDebug(value) {
        console.log("ARGUMENT -> " + value);
        func(value);
    }
}

function delay(time, value) {
    return new Promise(handle);

    function handle(resolve) {
        return setTimeout(() => resolve(value), time);
    }
}
