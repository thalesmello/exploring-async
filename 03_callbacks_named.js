var areThingsComplicated = false,
    timer = setInterval(intervalLoop, 500);

startTimeout();

function startTimeout() {
    setTimeout(firstTimeout, 2000);
}

function firstTimeout() {
    console.log("Things can get...");

    setTimeout(secondTimeout, 1000);
}

function secondTimeout() {
    console.log("complicated.");
    areThingsComplicated = true;

    setTimeout(clearTimerInterval, 1000);
}

function clearTimerInterval() {
    clearTimeout(timer);
}

function intervalLoop() {
    if(areThingsComplicated) {
        console.log("Oh no!");
    } else {
        console.log("What?");
    }
}
