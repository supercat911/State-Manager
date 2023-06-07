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

// remembers only the last change of the state value
a.value = 2;
a.value = 3;
b.value = 10; //or you can use b.setValue(10);

await sm.waitForTasksToComplete();

a.value = 15;
b.value = 20;