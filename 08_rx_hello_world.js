var Rx = require("rx");

Rx.Observable
    .interval(500)
    .map(x => x + 1)
    .takeWhile(x => x <= 3)
    .concat(Rx.Observable.of("World"))
    .subscribe(x => console.log("Hello " + x + "!"));
