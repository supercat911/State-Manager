## State API 

A state object can be created with a StateManager instance.
```js
import { StateManager } from "./js/StateManager.js";
let sm = new StateManager();
let myState = sm.createState();

// also you can state name and initial value
let state_name  = "myState2";
let init_value  = "123";
let myState2 = sm.createState(state_name, init_value); 

```

### Properties
#### `state.value`
> State's value. Uses the getter state.getValue and the setter state.setValue

#### `state.name`
> State's name (id). Readonly. The state's name can be set when creating the state.


### Methods
#### `state.setValue(newValue)`
> Sets state's value in asynchronous mode. 
> Returns true or false.

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

```js
import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();
let myState = sm.createState();

function callback(previousValue, newValue) {
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
}

myState.subscribe(callback);
myState.setValue(5);

await sm.waitForTasksToComplete();

myState.unsubscribe(callback);
myState.setValue(6);

await sm.waitForTasksToComplete();

console.log(myState.getValue());
```

#### `state.unsubscribeAll()`
> Unsubscribes all callbacks.

#### `state.setGetter(callback)`
> Sets getter for state.
```js
import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();

let a = sm.createState();
let b = sm.createState();
let c = sm.createState();

a.value = 3;
b.value = 2;

function getter() {
    return a.value + b.value;
}

c.setGetter(getter);

await sm.waitForTasksToComplete();
console.log(c.value);
// outputs 5;
```

#### `state.setGetter()`
> Deletes the getter for state.


#### `state.setGetter(setter)`
> Sets getter for state.

```js
import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();

let a = sm.createState();

a.value = 1;
a.value = 2;

function setter(value) {
    return value * 2;
}

a.setSetter(setter);

await sm.waitForTasksToComplete();
console.log(a.value);
// outputs 4;
```

#### `state.clearSetter()`
> Deletes the setter for state.