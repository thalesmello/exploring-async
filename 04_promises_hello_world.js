new Promise(resolve => setTimeout(() => resolve("Hello World!"), 1000))
    .then(value => {
        console.log("Value!");
        return new Promise(resolve => setTimeout(() => resolve("I'll be back"), 1000));
    })
    .then(value => console.log(value));
