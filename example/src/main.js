import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();
window.sm = sm;

let a = sm.createState();
let b = sm.createState();

function compute_d() {
    console.log("compute value of d");
    return a.value + b.value;
}

let d = sm.createComputed(null, compute_d, [a, b]);

function callback(previousValue, newValue) {
    console.log("d is changed", "newValue = " + newValue, "previousValue = " + previousValue);
}

d.subscribe(callback);


a.value = 3;
b.value = 2;

await sm.waitForTasksToComplete();

console.log("get value of d 3 times");
console.log(d.value);
console.log(d.value);
console.log(d.value);

b.value++; 

await sm.waitForTasksToComplete();
