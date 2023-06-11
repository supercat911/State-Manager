# Supercat's StateManager
Lightweight state management javascript library 

- Tiny - Too much lightweight, no more large bundle sizes
- Automatic Batching
- Reactive states

Here's the first example to get you started.

```js
import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();

sm.on("batch", () => {
    console.log(`States are updated. a = ${a.value}, b = ${b.value}`);
});

let a = sm.createState(0);
let b = sm.createState(0);

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

// remembers only the last change of the state value
a.value = 2;
a.value = 3;
b.value = 10; //or you can use b.setValue(10);

await sm.waitForTasksToComplete();

a.value = 15;
b.value = 20;

```

Outputs:
```
> States are updated. a = 3, b = 10

> a is changed. Current value is 3, previous value was 0
a = 3, b = 10

> b is changed. Current value is 10, previous value was 0
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

let a = sm.createState(1);
let b = sm.createState(2);

function compute_d() {
    console.log("compute value of d");
    return a.value + b.value;
}

function callback(previousValue, newValue) {
    console.log("d is changed", "newValue = " + newValue, "previousValue = " + previousValue);
}

let d = sm.createComputed(compute_d, [a, b]);
d.subscribe(callback);

a.value = 3;
b.value = 2;

await sm.waitForTasksToComplete();

console.log("Get a value of d 3 times. The value of D is not recomputed.");
console.log(d.value);
console.log(d.value);
console.log(d.value);

b.value++; 

await sm.waitForTasksToComplete();
```

Outputs:
```
> compute value of d
> d is changed newValue = 5 previousValue = null
> Get a value of d 3 times. The value of D is not recomputed.
> 5
> 5
> 5
> compute value of d
> d is changed newValue = 6 previousValue = 5
```

You can use StateManager to work with proxy objects. 
```js
import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();

// You can work with a proxy object of sm
let states = sm.getProxy();

// Automatically create and set a value for a new state
states.a = 1;

// Subscribe to the data changes.
sm.subscribe("a", (previousValue, newValue, state) => {
    console.log("Method 1");
    console.log(`${state.name} is changed`, "newValue: " + newValue, "previousValue: " + previousValue);
});

sm.subscribe("a", (previousValue, newValue, state) => {
    console.log("Method 2");
    console.log(`${state.name} is changed`, "newValue: " + newValue, "previousValue: " + previousValue);
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

Also you can work with values in "dirty mode"
```js
import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();

sm.on("batch", () => {
    console.log(`States are updated. a = ${a.value}, b = ${b.value}`);
});

let initValue = 1;

// creates a state and sets a name (id) for the state 
let a = sm.createNamedState("a", initValue);
let b = sm.createNamedState("b", initValue);

a.subscribe((previousValue, newValue, state) => {
    console.log(`${state.name} is changed. Current value is ${newValue}, previous value was ${previousValue}`);
});

b.subscribe((previousValue, newValue, state) => {
    console.log(`${state.name} is changed. Current value is ${newValue}, previous value was ${previousValue}`);
});

// sets to "dirty value" only the last change of the state value
a.value++;
// console.log(a.value); // outputs "1"
a.value++;
// console.log(a.value); // outputs "1"
a.value++;
// console.log(a.value); // outputs "1"

b.dirtyMode = true;  

// now state value changes in intermediate calculations
b.value++;
// console.log(a.value); // outputs "2"
b.value++;
// console.log(a.value); // outputs "3"
b.value++;
// console.log(a.value); // outputs "4"

console.log(`Values: ${a.value}, ${b.value}`);
```

Outputs
```
> Values: 1, 4
> States are updated. a = 2, b = 4
> a is changed. Current value is 2, previous value was 1
> b is changed. Current value is 4, previous value was 1
```

Docs and examples you can find in "docs" folder. 