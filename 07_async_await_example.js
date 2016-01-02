// This uses experimental syntax.
// To run it, use `regenerator -r 07_async_await_example.js | node`

var timer = setInterval(intervalLoop, 500),
    areThingsComplicated = false;

complicatedBehaviour();

async function complicatedBehaviour() {
    let value;

    value = await delay(2000, "First Return Value");
    logArgument(value);
    console.log("Things can get...");

    value = await delay(1000, "Second Return Value");
    logArgument(value);
    areThingsComplicated = true;
    console.log("complicated.");

    value = await delay(1000, "Third Return Value");
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

function delay(time, value) {
    return new Promise(handle);

    function handle(resolve) {
        return setTimeout(() => resolve(value), time);
    }
}
