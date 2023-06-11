## StateManager API 

### Methods
#### `stateManager.createState(value = null)`
> Creates new state and sets initial value. Returns state object.
> If state_name is null the name of state will be generated automatically

#### `stateManager.createNamedState(state_name, value = null)`
> Creates new state and sets initial value. Returns state object.
> If state_name is null the name of state will be generated automatically

```js
import { StateManager } from "./js/StateManager.js";
let sm = new StateManager();

let init_value  = "123";

let myState = sm.createState(init_value); 

// also you can state name and initial value
let state_name  = "myState2";
let myState2 = sm.createNamedState(state_name, init_value); 

```

#### `stateManager.createComputed(value = null, dependecies)`
> Creates new computed state, sets getter and state dependecies. Returns state object.
> State's name will be generated automatically

#### `stateManager.createNamedComputed(state_name = null, value = null, dependecies)`
> Creates new computed state with name. Returns state object.
> If state_name is null the name of state will be generated automatically

```js
import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();
window.sm = sm;

let a = sm.createState(1);
let b = sm.createState(2);

function compute_d() {
    console.log("compute value of d");
    return a.value + b.value;
}

let d = sm.createComputed(compute_d, [a, b]);

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

```


#### `stateManager.stateExists(state_name)`

> Check if a state exists. Returns true or false.

#### `stateManager.getState(state_name)`
> Returns the existing state object or false if not.

#### `stateManager.subscribe(state_name, callback)`
> Subscribes a callback to the data changes. Returns callback.

#### `stateManager.unsubscribe(state_name, callback)`
> Unsubscribes a callback.

```js
import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();

function callback(previousValue, newValue) {
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
}

sm.subscribe("a", callback);

let a = sm.getState("a");
a.value = 5;

await sm.waitForTasksToComplete();
console.log(a.value);

sm.unsubscribe("a", callback);

a.value = 6;
await sm.waitForTasksToComplete();
console.log(a.value);
```

#### `async sm.waitForTasksToComplete()`
> Waits for batch state update to complete.

```js
import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();
let a = sm.createState(1);
a.value = 2;
a.value = 3;
a.value = 4;
a.value = 5;

console.log(a.value);
// Outputs 1

await sm.waitForTasksToComplete();
console.log(a.value);
// Outputs 5
```

#### `stateManager.getProxy()`
> Gets proxy object of sm.
```js
import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();

let obj = sm.getProxy();

obj.a = 1;
obj.a = 2;
obj.a = 3;
obj.a = 4;
obj.a = 5;

console.log(obj.a);
// Outputs 1
await sm.waitForTasksToComplete();
console.log(obj.a);
// Outputs 5
```

### Properties
#### `stateManager.delayMs = 16`
> Interval time for batch state update. Default value is 16 ms.

### Events
#### `stateManager.on("batch", callback)`
> The event occurs after the state batch update is completed
```js
import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();

sm.on("batch", (updated_states) => {
    let output = updated_states.map(state => `${state.name} = ${state.value}`).join(", ");
    console.log(output);
});

let a = sm.createNamedState("a", 1);
let b = sm.createNamedState("b", 1);

a.value = 2;
b.value = 10;

await sm.waitForTasksToComplete();
a.value = 15;
b.value = 20;
```