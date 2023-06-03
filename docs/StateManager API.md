## StateManager API 

### Methods
#### `stateManager.createState(state_name = null, value = null)`
> Creates new state and sets initial value. Returns state object.
> If state_name is null the name of state will be generated automatically

```js
let sm = new StateManager();
sm.createState("a", 1);
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
let sm = new StateManager();

sm.subscribe("a", (previousValue, newValue) => {
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
});

sm.setStateValue("a", 5);
```

#### `stateManager.unsubscribe(state_name, callback)`
> Unsubscribes a callback.

```js
let sm = new StateManager();

function callback(previousValue, newValue) {
    console.log("newValue: " + newValue, "previousValue: " + previousValue);
}

sm.subscribe("a", callback);
sm.setStateValue("a", 5);

await sm.waitForTasksToComplete();
console.log(sm.getStateValue("a"));

sm.unsubscribe("a", callback);

sm.setStateValue("a", 6);
await sm.waitForTasksToComplete();
console.log(sm.getStateValue("a"));
```

#### `stateManager.unsubscribeAll(state_name)`
> Unsubscribes all callbacks.

#### `async sm.waitForTasksToComplete()`
> Waits for batch state update to complete.

```js
import { StateManager } from "./js/StateManager.js";

let sm = new StateManager();

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

sm.on("batch", (updated_state_names) => {
    console.log(`States are updated. a = ${a.getValue()}, b = ${b.getValue()}`);
});

let a = sm.createState();
let b = sm.createState();

a.setValue(2);
a.setValue(3);
b.setValue(10);

await sm.waitForTasksToComplete();
a.setValue(15);
b.setValue(20);
```