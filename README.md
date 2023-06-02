# Supercat's StateManager
Lightweight state management javascript library 

- Tiny - Too much lightweight, no more large bundle sizes
- Automatic Batching

Here's the first example to get you started.
```js
import { StateManager } from './StateManager';

let stateManager = new StateManager();

stateManager.on("batch", (updated_state_names) => {
    console.log(`States are updated. a = ${a.getValue()}, b = ${b.getValue()}`);
});

let a = stateManager.createState();
let b = stateManager.createState();

a.subscribe((newValue, previousValue) => {
    console.log(
        `a is changed. Current value is ${newValue}, previous value was ${previousValue}
a = ${a.getValue()}, b = ${b.getValue()}`);

});

b.subscribe((newValue, previousValue) => {
    console.log(
        `b is changed. Current value is ${newValue}, previous value was ${previousValue}
a = ${a.getValue()}, b = ${b.getValue()}`);
});

a.setValue(2);
a.setValue(3);

b.setValue(10);

await stateManager.waitForTasksToComplete();
a.setValue(15);
b.setValue(20);

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

You can use StateManager to work with proxy objects
```js
import { StateManager } from './StateManager';

let stateManager = new StateManager();

// You can work with a proxy object of stateManager
let obj = stateManager.getProxy();

// Automatically create and set a value for a new state
obj.a = 1;

// Subscribe to the data changes.
stateManager.subscribe("a", (newValue, previousValue) => {
    console.log("Method 1");
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
});

stateManager.subscribe("a", (newValue, previousValue) => {
    console.log("Method 2");
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
});

// Set state's value in asynchronous mode
obj.a = 2;
obj.a = 3;
obj.a = 4;
obj.a = 5;

console.log(obj.a);
// Outputs 1
await stateManager.waitForTasksToComplete();
console.log(obj.a);
// Outputs 5
```

Also you can use native StateManager's API
```js
import { StateManager } from './StateManager';

let stateManager2 = new StateManager();

// Subscribe to the data changes.
stateManager2.subscribe("a", (newValue, previousValue) => {
    console.log("Method 1");
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
});

stateManager2.subscribe("a", (newValue, previousValue) => {
    console.log("Method 2");
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
});

// Create new state
stateManager2.createState("a", 1);
stateManager2.setStateValue("a", 2);
stateManager2.setStateValue("a", 3);
stateManager2.setStateValue("a", 4);
stateManager2.setStateValue("a", 5);

console.log(stateManager2.getStateValue("a"));
// Outputs 1

await stateManager2.waitForTasksToComplete();
console.log(stateManager2.getStateValue("a"));
// Outputs 5
```

## StateManager API 

### Methods
#### `stateManager.createState(state_name = null, value = null)`
> Creates new state and sets initial value. Returns state object.
> If state_name is null the name of state will be generated automatically

```js
let stateManager = new StateManager();
stateManager.createState("a", 1);
```

#### `stateManager.stateExists(state_name)`

> Check if a state exists. Returns true or false.

#### `stateManager.getState(state_name)`
> Returns the existing state object or false if not.

#### `stateManager.getStateValue(state_name)`
> Returns the value of existing state object or false if not.

#### `setStateValueImmediately(state_name, newValue)`
> Sets a value for the state immediately. 
> Returns true or false.

#### `setStateValue(state_name, newValue)`
> Sets state's value in asynchronous mode. 
> Returns true or false.

#### `stateManager.subscribe(state_name, callback)`
> Subscribes a callback to the data changes. Returns callback.

```js
let stateManager = new StateManager();

stateManager.subscribe("a", (newValue, previousValue) => {
    console.log("Method 1");
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
});
```

#### `stateManager.unsubscribe(state_name, callback)`
> Unsubscribes a callback.

```js
let stateManager = new StateManager();

function callback(newValue, previousValue) {
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
}

stateManager.subscribe("a", callback);
stateManager.setStateValue("a", 5);

await stateManager.waitForTasksToComplete();
console.log(stateManager.getStateValue("a"));

stateManager.unsubscribe("a", callback);

stateManager.setStateValue("a", 6);
await stateManager.waitForTasksToComplete();
console.log(stateManager.getStateValue("a"));
```

#### `stateManager.unsubscribeAll(state_name)`
> Unsubscribes all callbacks.

#### `async stateManager.waitForTasksToComplete()`
> Waits for batch state update to complete.

```js
import { StateManager } from './StateManager';

let stateManager = new StateManager();

stateManager.createState("a", 1);
stateManager.setStateValue("a", 2);
stateManager.setStateValue("a", 3);
stateManager.setStateValue("a", 4);
stateManager.setStateValue("a", 5);

console.log(stateManager.getStateValue("a"));
// Outputs 1

await stateManager.waitForTasksToComplete();
console.log(stateManager.getStateValue("a"));
// Outputs 5
```

#### `stateManager.getProxy()`
> Gets proxy object of stateManager.
```js
import { StateManager } from './StateManager';

let stateManager = new StateManager();

let obj = stateManager.getProxy();

obj.a = 1;
obj.a = 2;
obj.a = 3;
obj.a = 4;
obj.a = 5;

console.log(obj.a);
// Outputs 1
await stateManager.waitForTasksToComplete();
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
import { StateManager } from './StateManager';

let stateManager = new StateManager();

stateManager.on("batch", (updated_state_names) => {
    console.log(`States are updated. a = ${a.getValue()}, b = ${b.getValue()}`);
});

let a = stateManager.createState();
let b = stateManager.createState();

a.setValue(2);
a.setValue(3);
b.setValue(10);

await stateManager.waitForTasksToComplete();
a.setValue(15);
b.setValue(20);
```

## State API 

A state object can be created with a StateManager instance.
```js
import { StateManager } from './StateManager';
let stateManager = new StateManager();
let myState = stateManager.createState();
```

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
import { StateManager } from './StateManager';

let stateManager = new StateManager();
let myState = stateManager.createState();

myState.subscribe((newValue, previousValue) => {
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
});
```

#### `state.unsubscribe(callback)`
> Unsubscribes a callback.

```js
import { StateManager } from './StateManager';

let stateManager = new StateManager();
let myState = stateManager.createState();

function callback(newValue, previousValue) {
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
}

myState.subscribe(callback);
myState.setValue(5);

await stateManager.waitForTasksToComplete();

myState.unsubscribe(callback);
myState.setValue(6);

await stateManager.waitForTasksToComplete();

console.log(myState.getValue());
```

#### `state.unsubscribeAll()`
> Unsubscribes all callbacks.

#### `state.setGetter(callback)`
> Sets getter for state.
```js
import { StateManager } from './StateManager';

let stateManager = new StateManager();
let myState = stateManager.createState();

function callback(newValue, previousValue) {
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
}

function getter() {
    return 0;
}

myState.subscribe(callback);
myState.setGetter(getter);
myState.setValue(5);

await stateManager.waitForTasksToComplete();
console.log(myState.getValue());
// outputs 0;
```

#### `state.clearGetter()`
> Deletes the getter for state.
