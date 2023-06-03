import { StateManager } from "./js/StateManager.js";

let stateManager = new StateManager();
window.stateManager = stateManager;

let a = stateManager.createState();
let b = stateManager.createState();
let c = stateManager.createState();
let d = stateManager.createComputed(null, func2, [a, b]);

function callback(previousValue, newValue) {
    console.log("d is changed", "newValue = " + newValue, "previousValue = " + previousValue);
}

d.subscribe(callback);

function func1() {
    console.log("compute value of c");
    return a.value + b.value;
}

function func2() {
    console.log("compute value of d");
    return a.value + b.value;
}

a.value = 3;
b.value = 2;
c.setGetter(func1);

await stateManager.waitForTasksToComplete();

console.log("get value of c 3 times");
console.log(c.value);
console.log(c.value);
console.log(c.value);

console.log("");
console.log("get value of d 3 times");
console.log(d.value);
console.log(d.value);
console.log(d.value);

b.value++; 

await stateManager.waitForTasksToComplete();