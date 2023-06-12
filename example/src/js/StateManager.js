import { EventEmitter } from "./EventEmitter.js";
import { State } from "./State.js";
import { ComputedState } from "./ComputedState.js";


function hasIntersection(arr1 = [], arr2 = []) {

    for (let i = 0; i < arr1.length; i++) {
        if (arr2.includes(arr1[i])) {
            return true;
        }
    }

    return false;
}

class StateManager extends EventEmitter {
    delayMs = 16

    #states = {}
    #stateMap = new Map // <state_id, state> 

    #states_to_update = new Map()
    #setTimeoutId = 0
    #proxyObject = null
    #statesIndex = 0;
    levels = [[]];
    levelsMap = new Map() // <state_id, level>
    #lastId = 0

    #dependencies = {}

    stateExists(state_name) {
        return !!this.#states[state_name];
    }

    #generateName() {
        let state_name = `state_${this.#statesIndex}`;
        this.#statesIndex++;

        return state_name;
    }

    #registerState(state, states_deps = []) {
        this.#lastId++;

        let state_id = this.#lastId;

        this.#stateMap.set(state_id, state);
        state.state_id = state_id;

        let state_name = state.getName();

        this.#states[state_name] = state;

        this.#setQueueOrder(state_id, states_deps);

        return state_id;
    }

    getStates() {
        return this.#states;
    }

    #setQueueOrder(state_id, states = []) {

        let level = 0;

        if (Array.isArray(states) && states.length > 0) {

            let deps_state_ids = states.map(state => state.state_id)

            deps_state_ids.forEach((state_id) => {
                level = Math.max(level, this.levelsMap.get(state_id));
                deps_state_ids.push(state_id);
            });

            this.#dependencies[state_id] = deps_state_ids;
            level++;
        }

        if (!this.levels[level]) {
            this.levels[level] = [];
        }

        this.levels[level].push(state_id);
        this.levelsMap.set(state_id, level);

    }

    createNamedState(state_name = null, value = null) {

        state_name = state_name || this.#generateName();

        if (this.stateExists(state_name)) {
            console.error(`State ${state_name} has been declarated already`);
            return false;
        }

        let state = new State(state_name, value, this);
        this.#registerState(state);

        return state;
    }

    createState(value = null) {
        return this.createNamedState(null, value);
    }

    createNamedComputed(state_name, getterFunction, dependencies = []) {

        state_name = state_name || this.#generateName();

        if (this.stateExists(state_name)) {
            console.error(`State ${state_name} has been declarated already`);
            return false;
        }

        let that = this;
        let states_deps = [];

        dependencies.forEach(function (item) {
            let state = item instanceof State || item instanceof ComputedState ? item : that.getState(item);

            if (state) {
                states_deps.push(state);
            }
            else {
                console.error(`Unknown state`, item);
            }
        });

        let state = new ComputedState(state_name, getterFunction);
        state.recompute();

        this.#registerState(state, states_deps);
        return state;
    }

    createComputed(getterFunction, dependencies = []) {
        return this.createNamedComputed(null, getterFunction, dependencies);
    }

    getState(state_name) {
        if (typeof state_name == "string") {
            return this.getStateByName(state_name);
        }

        return state_name;
    };

    getStateByName(state_name) {
        if (!this.stateExists(state_name)) {
            console.error(`Unknown state ${state_name}`);
            return false;
        }

        let state = this.#states[state_name];
        return state ? state : false;
    }

    getStateById(state_id) {
        return this.#stateMap.get(state_id);
    }

    addTask(method, state_id) {

        if (method == "update") {
            this.#states_to_update.set(state_id);
        }

        if (this.#setTimeoutId == 0) {
            let that = this;
            that.#setTimeoutId = setTimeout(function () {
                that.#completeTasks();
            }, that.delayMs);
        }
    }

    deleteTask(state_id) {
        this.#states_to_update.delete(state_id);
    }

    deleteAllTasks() {
        this.#states_to_update.clear();
        this.#setTimeoutId = 0;
    }

    #completeTasks() {
        let changed_state_ids = [];

        // operate writable states

        this.#states_to_update.forEach((value, state_id, map) => {

            let state = this.getStateById(state_id);

            let is_changed = state.forceUpdate();

            if (is_changed) {
                changed_state_ids.push(state_id);
            }

        });

        this.deleteAllTasks();

        if (changed_state_ids.length == 0) return;

        // operate computed states

        for (let index_level = 1; index_level < this.levels.length; index_level++) {

            let state_ids = this.levels[index_level];

            for (let computed_state_index in state_ids) {

                let state_id = state_ids[computed_state_index];

                let computed_state = this.getStateById(state_id);

                let recomputeFlag = hasIntersection(this.#dependencies[state_id], changed_state_ids);

                if (recomputeFlag) {

                    let updated = computed_state.recompute();

                    if (updated) {
                        changed_state_ids.push(computed_state.state_id);
                    }

                }

            }

        }

        let all_updated_states = changed_state_ids.map((state_id) => {
            return this.getStateById(state_id);
        });

        this.emit('batch', all_updated_states);

        for (let i = 0; i < all_updated_states.length; i++) {
            let state = all_updated_states[i];

            if (state) {
                state.runSubscribers();
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
        if (!state) state = this.createNamedState(state_name, null);

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
            get(target, state_name) {
                return that.getStateValue(state_name);
            },
            set(target, state_name, value) {
                if (!that.stateExists(state_name)) {
                    return that.createNamedState(state_name, value);
                }

                return that.setStateValue(state_name, value);
            },

        }

        return new Proxy(target, handler);
    }

}

export { State, StateManager, ComputedState };