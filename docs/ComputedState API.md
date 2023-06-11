## ComputedState API 

A computed state can be created with a StateManager instance.

Basic example

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

Also you can create a state with a name. 
```js
let d = sm.createNamedComputed(state_name, compute_d, [a, b]);
```


### Properties
#### `state.value`
> State's value. Readonly. Uses the getter state.getValue.

#### `state.name`
> State's name. Readonly. The state's name can be set when creating the state.


### Methods

#### `state.getValue()`
> Returns the value of state. 

#### `state.getName()`
> Returns the name of state. 

#### `state.subscribe(callback)`
> Subscribes a callback to the data changes. Returns callback.

```js
import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();
let myState = sm.createState();

myState.subscribe((previousValue, newValue) => {
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
});
```

#### `state.unsubscribe(callback)`
> Unsubscribes a callback.

#### `state.unsubscribeAll()`
> Unsubscribes all callbacks.

#### `state.recompute()`
> Recompute state's value.


### Example using computed states with proxy object

```js
import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();
let states = sm.getProxy();

sm.createNamedState("a", 1);
sm.createNamedState("b", 2);

function compute_d() {
    console.log("compute a value of d");
    return states.a + states.b;
}

sm.createNamedComputed("d", compute_d, ["a", "b"]);

function callback(previousValue, newValue) {
    console.log("d is changed", "newValue = " + newValue, "previousValue = " + previousValue);
}

sm.subscribe("d", callback);

console.log(` a = `, states.a, ` b = `, states.b, ` d = `, states.d);

states.a = 3;
states.b = 2;

await sm.waitForTasksToComplete();

console.log("get value of d 3 times");
console.log(states.d);
console.log(states.d);
console.log(states.d);

states.b++; 

await sm.waitForTasksToComplete();
```
