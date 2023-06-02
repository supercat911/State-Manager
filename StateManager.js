class State {

    #getter = null
    #value = null
    #name =  ''

    constructor(name, value) {
        this.#name = name;
        this.#value = value;
        this.listeners = [];
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

    setGetter(func){
        this.#getter = func;
    }

    clearGetter(){
        this.#getter = null;
    }

    getValue() {
        if (this.#getter) {
            this.#value = this.#getter();
        }

        return this.#value;
    }

    setValue(newValue) {
        let previousValue = this.#value;

        if (previousValue == newValue) {
            return false;
        }

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
}

class StateManager {
    #states = {}
    #shouldered_tasks = {}
    #setTimeoutId = 0
    delayMs = 16
    #proxyObject = null

    completeTasks() {
        for (let state_name in this.#shouldered_tasks) {
            let newValue = this.#shouldered_tasks[state_name];
            this.setStateValueImmediately(state_name, newValue);
        }

        this.#setTimeoutId = 0;
        this.#shouldered_tasks = {}
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

    stateExists(state_name) {
        return !!this.#states[state_name];
    }

    createState(state_name, value) {
        if (this.stateExists(state_name)) {
            console.error(`State ${state_name} has been declarated already`);
            return false;
        }

        let state = new State(state_name, value);
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
        return state.setValue(newValue);
    }

    setStateValue(state_name, newValue) {
        let state = this.getState(state_name);
        if (state == false) return false;

        this.#shouldered_tasks[state_name] = newValue;

        if (this.#setTimeoutId == 0) {
            let that = this;
            this.#setTimeoutId = setTimeout(function () {
                that.completeTasks();
            }, this.delayMs);
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

    getProxy() {
        if (!this.#proxyObject) {
            this.#proxyObject = this.#createProxy();
        }

        return this.#proxyObject;
    }
}

export {StateManager};
