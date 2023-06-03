import { EventEmitter } from "./EventEmitter.js";
import { State } from "./State.js";
import {ComputedState} from "./ComputedState.js";

class StateManager extends EventEmitter {
    delayMs = 16

    #states = {}
    #computed_states = {};
    #shouldered_tasks = {}
    #setTimeoutId = 0
    #proxyObject = null
    __callbacksToRun = []
    #statesIndex = 0;

    stateExists(state_name) {
        return !!this.#states[state_name];
    }

    createState(state_name = null, value = null) {

        if (state_name === null) {
            state_name = `unnamed_${this.#statesIndex}`;
            this.#statesIndex++;
        }

        if (this.stateExists(state_name)) {
            console.error(`State ${state_name} has been declarated already`);
            return false;
        }

        let state = new State(state_name, value, this);
        this.#states[state_name] = state;
        return state;
    }

    createComputed(state_name, setterFunction, dependencies) {

        if (state_name === null) {
            state_name = `unnamed_${this.#statesIndex}`;
            this.#statesIndex++;
        }

        if (this.stateExists(state_name)) {
            console.error(`State ${state_name} has been declarated already`);
            return false;
        }

        let state = new ComputedState(state_name, setterFunction, dependencies);
        this.#states[state_name] = state;
        this.#computed_states[state_name] = state;

        return state;
    }

    getState(state_name) {
        if (!this.stateExists(state_name)) {
            console.error(`Unknown state ${state_name}`);
            return false;
        }

        return this.#states[state_name];
    };

    getStateValue(state_name) {
        let state = this.getState(state_name);
        if (state == false) return false;

        return state.getValue();
    }

    setStateValueImmediately(state_name, newValue) {
        let state = this.getState(state_name);
        if (state == false) return false;

        if (state.isComputed) return false;

        delete this.#shouldered_tasks[state_name];
        return state.setValue(newValue, true);
    }

    #addTask(state_name, newValue){
        this.#shouldered_tasks[state_name] = newValue;

        if (this.#setTimeoutId == 0) {
            let that = this;
            that.#setTimeoutId = setTimeout(function () {
                that.#completeTasks();
            }, that.delayMs);
        }
    }

    setStateValue(state_name, newValue) {
        let state = this.getState(state_name);
        if (state == false) return false;
        if (state.isComputed) return false;

        this.#addTask(state_name, newValue);

        return true;
    }

    subscribe(state_name, callback) {
        let state = this.#states[state_name];
        if (!state) state = this.createState(state_name, null);

        return state.subscribe(callback);
    }

    unsubscribe(state_name, callback) {
        let state = this.getState(state_name);
        if (state == false) return false;

        return state.unsubscribe(callback);
    }

    unsubscribeAll(state_name) {
        let state = this.getState(state_name);
        if (state == false) return false;

        return state.unsubscribeAll();
    }

    #completeTasks() {
        let changed_state_names = [];

        // operate writable states

        for (let state_name in this.#shouldered_tasks) {
            let newValue = this.#shouldered_tasks[state_name];
            let is_changed = this.setStateValueImmediately(state_name, newValue);
            if (is_changed) {
                changed_state_names.push(state_name);
            }
        }

        this.#setTimeoutId = 0;
        this.#shouldered_tasks = {}

        // operate computed states
        if (changed_state_names.length > 0) {

            let updated_computed_states = [];

            for (let computed_state_name in this.#computed_states) {

                let computed_state = this.#computed_states[computed_state_name];
                
                let updated = computed_state.recompute(changed_state_names);

                if (updated) {
                    updated_computed_states.push(computed_state_name);
                }
            }

            this.emit('batch', updated_computed_states.concat(changed_state_names) );
        }

        for (let i = 0; i < this.__callbacksToRun.length; i++) {
            let callback_data = this.__callbacksToRun[i];
            try {
                callback_data[0](callback_data[1], callback_data[2]);
            }
            catch (e) {
                console.error(e);
            }
        }

        this.__callbacksToRun = [];

    }

    waitForTasksToComplete() {
        let that = this;

        return new Promise((resolve, reject) => {
            if (that.#setTimeoutId == 0) {
                resolve(true);
                return true;
            }

            let setIntervalId = setInterval(function () {
                if (that.#setTimeoutId == 0) {
                    clearInterval(setIntervalId);
                    resolve(true);
                    return true;
                }
            }, 10);

        });
    }

    getProxy() {
        if (!this.#proxyObject) {
            this.#proxyObject = this.#createProxy();
        }

        return this.#proxyObject;
    }

    #createProxy() {
        let target = {};
        let that = this;

        const handler = {
            get(target, property) {
                return that.getStateValue(property);
            },
            set(target, property, value) {
                if (!that.stateExists(property)) {
                    return that.createState(property, value);
                }

                return that.setStateValue(property, value);
            },

        }

        return new Proxy(target, handler);
    }

}

export { State, StateManager, ComputedState };