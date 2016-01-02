var areThingsComplicated = false,
    timer;

setTimeout(() => {
    console.log("Things can get...");
    setTimeout(() => {
        console.log("complicated.");
        areThingsComplicated = true;

        setTimeout(() => clearTimeout(timer), 1000);
    }, 1000);
}, 2000);

timer = setInterval(() => {
    if(areThingsComplicated) {
        console.log("Oh no!");
    } else {
        console.log("What?");
    }
}, 500);
