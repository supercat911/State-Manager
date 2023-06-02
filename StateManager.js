import { EventEmitter } from "./EventEmitter";

function compareObjects(a, b) {
    if (a === b) return true;

    if (typeof a != typeof b) return false;

    if (Array.isArray(a)) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    let a_json = JSON.stringify(a, Object.keys(a).sort());
    let b_json = JSON.stringify(b, Object.keys(b).sort());
    return a_json === b_json;
}

class State {

    #getter = null
    #value = null
    #name = ''
    #stateManager = null

    constructor(name = null, value = null, stateManager = null) {
        this.#name = name;
        this.#value = value;
        this.listeners = [];
        this.#stateManager = stateManager;
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return callback;
    }

    unsubscribe(callback) {
        for (let i = 0; i < this.listeners.length; i++) {
            if (this.listeners[i] === callback) {
                this.listeners.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    unsubscribeAll() {
        this.listeners = [];
    }

    setGetter(func) {
        this.#getter = func;
    }

    clearGetter() {
        this.#getter = null;
    }

    getValue() {
        if (this.#getter) {
            this.#value = this.#getter();
        }

        return this.#value;
    }

    getName() {
        return this.#name;
    }

    setValue(newValue, __force_write_flag = false) {
        let previousValue = this.#value;

        if (compareObjects(previousValue, newValue)) {
            return false;
        }

        if (!this.#stateManager) {

            this.#value = newValue;

            for (let i = 0; i < this.listeners.length; i++) {
                let listener = this.listeners[i];
                try {
                    listener(newValue, previousValue);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
        else {

            if (!__force_write_flag) {
                return this.#stateManager.setStateValue(this.#name, newValue);
            };

            this.#value = newValue;

            for (let i = 0; i < this.listeners.length; i++) {
                let listener = this.listeners[i];
                this.#stateManager.__callbacksToRun.push([listener, newValue, previousValue]);
            }
        }

        return true; // is changed
    }
}

class StateManager extends EventEmitter {
    delayMs = 16

    #states = {}
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

        delete this.#shouldered_tasks[state_name];
        return state.setValue(newValue, true);
    }

    setStateValue(state_name, newValue) {
        let state = this.getState(state_name);
        if (state == false) return false;

        this.#shouldered_tasks[state_name] = newValue;

        if (this.#setTimeoutId == 0) {
            let that = this;
            that.#setTimeoutId = setTimeout(function () {
                that.completeTasks();
            }, that.delayMs);
        }

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

    completeTasks() {
        let changed_state_names = [];

        for (let state_name in this.#shouldered_tasks) {
            let newValue = this.#shouldered_tasks[state_name];
            let is_changed = this.setStateValueImmediately(state_name, newValue);
            if (is_changed) {
                changed_state_names.push(state_name);
            }
        }

        this.#setTimeoutId = 0;
        this.#shouldered_tasks = {}

        if (changed_state_names.length > 0) {
            this.emit('batch', changed_state_names);
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

export { State, StateManager };
