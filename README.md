# Supercat's StateManager
Lightweight state management javascript library 

- Tiny - Too much lightweight, no more large bundle sizes
- Automatic Batching
- Reactive states

Here's the first example to get you started.

```js
import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();

sm.on("batch", (updated_state_names) => {
    console.log(`States are updated. a = ${a.value}, b = ${b.value}`);
});

let a = sm.createState();
let b = sm.createState();

a.subscribe((previousValue, newValue) => {
    console.log(
        `a is changed. Current value is ${newValue}, previous value was ${previousValue}
a = ${a.value}, b = ${b.value}`);

});

b.subscribe((previousValue, newValue) => {
    console.log(
        `b is changed. Current value is ${newValue}, previous value was ${previousValue}
a = ${a.value}, b = ${b.value}`);
});

a.value = 2;
a.value = 3;
b.value = 10; //or use b.setValue(10);

await sm.waitForTasksToComplete();

a.value = 15;
b.value = 20;

```

Outputs:
```
> States are updated. a = 3, b = 10

> a is changed. Current value is 3, previous value was null
a = 3, b = 10

> b is changed. Current value is 10, previous value was null
a = 3, b = 10

> States are updated. a = 15, b = 20

> a is changed. Current value is 15, previous value was 3
a = 15, b = 20

> b is changed. Current value is 20, previous value was 10
a = 15, b = 20

```

Another example with computed states
```js
import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();

let a = sm.createState();
let b = sm.createState();

function compute_d() {
    console.log("compute value of d");
    return a.value + b.value;
}

function callback(previousValue, newValue) {
    console.log("d is changed", "newValue = " + newValue, "previousValue = " + previousValue);
}

let d = sm.createComputed(null, compute_d, [a, b]);
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

```

You can use StateManager to work with proxy objects
```js
import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();

// You can work with a proxy object of sm
let states = sm.getProxy();

// Automatically create and set a value for a new state
states.a = 1;

// Subscribe to the data changes.
sm.subscribe("a", (previousValue, newValue) => {
    console.log("Method 1");
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
});

sm.subscribe("a", (previousValue, newValue) => {
    console.log("Method 2");
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
});

// Set state's value in asynchronous mode
states.a = 2;
states.a = 3;
states.a = 4;
states.a = 5;

console.log(states.a);
// Outputs 1
await sm.waitForTasksToComplete();
console.log(states.a);
// Outputs 5
```

Also you can use native StateManager's API
```js
import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();

// Subscribe to the data changes.
sm.subscribe("a", (previousValue, newValue) => {
    console.log("Method 1");
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
});

sm.subscribe("a", (previousValue, newValue) => {
    console.log("Method 2");
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
});

// Create new state
sm.createState("a", 1);
sm.setStateValue("a", 2);
sm.setStateValue("a", 3);
sm.setStateValue("a", 4);
sm.setStateValue("a", 5);

console.log(sm.getStateValue("a"));
// Outputs 1

await sm.waitForTasksToComplete();
console.log(sm.getStateValue("a"));
// Outputs 5
```

Docs and examples you can find in "docs" folder. 