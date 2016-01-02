var areThingsComplicated = false,
    timer;

function timeout(time, callback) {
    return new Promise(resolve => setTimeout(() => resolve(callback()), time));
}

timeout(2000, () => console.log("Things can get..."))
    .then(() => timeout(1000, () => {
        console.log("complicated.");
        areThingsComplicated = true;
    }))
    .then(() => timeout(1000, () => clearInterval(timer)));

timer = setInterval(() => {
    if(areThingsComplicated) {
        console.log("Not much though.");
    } else {
        console.log("What?");
    }
}, 500);
