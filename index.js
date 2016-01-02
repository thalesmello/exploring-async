// setTimeout(() => console.log("Hello world!"), 1000);


// var areThingsComplicated = false,
//     timer;

// setTimeout(() => {
//     console.log("Things can get...");
//     setTimeout(() => {
//         console.log("complicated.");
//         areThingsComplicated = true;

//         setTimeout(() => clearTimeout(timer), 1000);
//     }, 1000);
// }, 2000);

// timer = setInterval(() => {
//     if(areThingsComplicated) {
//         console.log("Oh no!");
//     } else {
//         console.log("What?");
//     }
// }, 500);

// new Promise(resolve => setTimeout(() => resolve("Hello World!"), 1000))
//     .then(value => {
//         console.log("Value!");
//         return new Promise(resolve => setTimeout(() => resolve("I'll be back"), 1000));
//     })
//     .then(value => console.log(value));

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