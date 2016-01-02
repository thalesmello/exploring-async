// This uses experimental syntax.
// To run it, use `regenerator -r 07_async_await_example.js | node`

var timer = setInterval(intervalLoop, 500),
    areThingsComplicated = false;

complicatedBehaviour();

async function complicatedBehaviour() {
    await delay(2000);
    console.log("Things can get...");
    await delay(1000);
    areThingsComplicated = true;
    console.log("complicated.");
    await delay(1000);
    clearInterval(timer);
}

function intervalLoop() {
    if(areThingsComplicated) {
        console.log("Not much");
    } else {
        console.log("What?");
    }
}

function delay(time) {
    return new Promise(handle);

    function handle(resolve) {
        setTimeout(resolve, time);
    }
}
