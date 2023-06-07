import { EventEmitter } from "./EventEmitter.js";
import { State } from "./State.js";
import { ComputedState } from "./ComputedState.js";

class StateManager extends EventEmitter {
    delayMs = 16

    #states = {}
    #computed_states = {};
    #states_to_update = new Map()
    #setTimeoutId = 0
    #proxyObject = null
    #statesIndex = 0;

    stateExists(state_name) {
        return !!this.#states[state_name];
    }

    #generateName() {
        let state_name = `unnamed_${this.#statesIndex}`;
        this.#statesIndex++;

        return state_name;
    }

    getStates() {
        return this.#states;
    }

    createState(state_name = null, value = null) {

        state_name = state_name || this.#generateName();

        if (this.stateExists(state_name)) {
            console.error(`State ${state_name} has been declarated already`);
            return false;
        }

        let state = new State(state_name, value, this);
        this.#states[state_name] = state;
        return state;
    }

    createComputed(state_name, setterFunction, dependencies) {

        state_name = state_name || this.#generateName();

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

    addTask(method, state_name) {

        if (method == "update") {
            this.#states_to_update.set(state_name);
        }

        if (this.#setTimeoutId == 0) {
            let that = this;
            that.#setTimeoutId = setTimeout(function () {
                that.#completeTasks();
            }, that.delayMs);
        }
    }

    deleteTask(state_name) {
        this.#states_to_update.delete(state_name);
    }

    #completeTasks() {
        let changed_state_names = [];

        // operate writable states

        this.#states_to_update.forEach((value, state_name, map) => {

            let is_changed = this.#states[state_name].forceUpdate();
            this.deleteTask(state_name);

            if (is_changed) {
                changed_state_names.push(state_name);
            }

        });

        this.#setTimeoutId = 0;

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

            let all_updated_states = [].concat(updated_computed_states, changed_state_names);

            this.emit('batch', all_updated_states);

            for (let i = 0; i < all_updated_states.length; i++) {
                this.getState(all_updated_states[i]).runSubscribers();
            }

        }

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

    getStateValue(state_name) {
        let state = this.getState(state_name);
        if (state == false) return false;

        return state.getValue();
    }

    setStateValue(state_name, newValue) {
        let state = this.getState(state_name);
        if (state == false) return false;
        if (state.isComputed) return false;

        state.setValue(newValue);
        return true;
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