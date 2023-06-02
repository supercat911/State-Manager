# Supercat's StateManager
Lightweight state management library 

- Tiny (<2kb) – Too much lightweight, no more large bundle sizes
- No dependences
- Automatic Batching

Here's the first example to get you started.
```js
import { StateManager } from './StateManager';

let stateManager = new StateManager();

// you can work with a proxy object of stateManager
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

### `stateManager.createState(state_name, value)`
> Creates new state and sets initial value. Returns state object.

**Usage:**
```js
let stateManager = new StateManager();
stateManager.createState("a", 1);
```

### `stateManager.stateExists(state_name)`

> Check if a state exists. Returns true or false.

### `stateManager.getState(state_name)`
> Returns the existing state object or false if not.

### `stateManager.getStateValue(state_name)`
> Returns the value of existing state object or false if not.

### `setStateValueImmediately(state_name, newValue)`
> Sets a value for the state immediately. 
> Returns true or false.

### `setStateValue(state_name, newValue)`
> Sets state's value in asynchronous mode. 
> Returns true or false.

### `stateManager.subscribe(state_name, callback)`
> Subscribes a callback to the data changes. Returns callback.

**Usage:**
```js
let stateManager = new StateManager();

stateManager.subscribe("a", (newValue, previousValue) => {
    console.log("Method 1");
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
});
```

### `stateManager.unsubscribe(state_name, callback)`
> Unsubscribes a callback.

**Usage:**
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

### `stateManager.unsubscribeAll(state_name)`
> Unsubscribes all callbacks.

### `async stateManager.waitForTasksToComplete()`
> Waits for batch state update to complete.

**Usage:**
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

### `stateManager.getProxy()`
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
