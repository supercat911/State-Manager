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
    value = null

    constructor(name = null, value = null, stateManager = null) {
        this.#name = name;
        this.#value = value;
        this.listeners = [];
        this.#stateManager = stateManager;

        let that = this;
        Object.defineProperty(this, "value", {
            get() {
                return that.getValue();
            },
            set(newValue) {
                return that.setValue(newValue);
            },
            enumerable: true,
            configurable: true,
        });

        Object.defineProperty(this, "name", {
            get() {
                return that.getName();
            },
            enumerable: true,
            configurable: true,
        });

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

export {State};
