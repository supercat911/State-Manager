
import { compareObjects, isObject, isArray, clone } from "./Utils.js";

function observe(obj, state) {

    var proxy = new Proxy(obj, {
        deleteProperty: function (target, property) {
            delete target[property];
            state.stateManager.addTask("update", state.state_id);

            return true;
        },
        set: function (target, property, value, receiver) {
            target[property] = value;
            state.stateManager.addTask("update", state.state_id);

            return true;
        },
        get: function (target, property) {
            return target[property];
        },

    });

    return proxy;
}

class State {

    #getter = null
    #setter = null
    #value = null
    #dirtyValue = null
    #previousValue = null
    #name = ''
    #listeners = []
    dirtyMode = false
    stateManager = null
    name = null
    isComputed = false
    state_id = 0

    constructor(name = null, value = null, stateManager = null) {
        this.#name = name;

        this.#previousValue = value;
        this.#value = value;

        this.dirtyMode = false;

        this.#setValueForce(value);

        this.#listeners = [];
        this.stateManager = stateManager;

        let that = this;

        Object.defineProperty(this, "value", {
            get() {
                return that.getValue();
            },
            set(value) {

                return that.setValue(value);
            },
        });

        Object.defineProperty(this, "name", {
            value: that.getName(),
            writable: false,

        });

        Object.defineProperty(this, "isComputed", {
            value: false,
            writable: false,
        });

    }

    forceUpdate() {

        if (compareObjects(this.#value, this.#dirtyValue)) {
            return false;
        }

        this.#setValueForce(this.#dirtyValue);
        return true;
    }

    #setValueForce(value) {

        this.#previousValue = this.#value;
        this.#value = Object.freeze(clone(value));
        this.#dirtyValue = isArray(value) || isObject(value) ? observe(clone(value), this) : value;

        //console.log("setValueForce:", 'this.#previousValue', this.#previousValue, 'this.#value', this.#value, 'this.#dirtyValue', this.#dirtyValue);    }
    }

    subscribe(callback) {
        this.#listeners.push(callback);
        return callback;
    }

    unsubscribe(callback) {
        for (let i = 0; i < this.#listeners.length; i++) {
            if (this.#listeners[i] === callback) {
                this.#listeners.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    unsubscribeAll() {
        this.#listeners = [];
    }

    runSubscribers() {
        for (let i = 0; i < this.#listeners.length; i++) {
            let listener = this.#listeners[i];
            try {
                listener(this.#previousValue, this.#value, this);
            }
            catch (e) {
                console.error(e);
            }
        }
    }

    setGetter(func) {
        this.#getter = func;
    }

    clearGetter() {
        this.#getter = null;
    }

    setSetter(func) {
        this.#setter = func;
    }

    clearSetter() {
        this.#setter = null;
    }

    getValue() {

        if (this.dirtyMode) {
            return this.#dirtyValue;
        }

        if (this.#getter) {
            this.#value = this.#getter();
        }

        return this.#value;
    }

    getDirtyValue() {
        return this.#dirtyValue;
    }

    getName() {
        return this.#name;
    }

    setValue(value) {
        if (this.#setter) value = this.#setter(value);

        this.#dirtyValue = value;

        if (this.stateManager) {
            this.stateManager.addTask("update", this.state_id);
            return;
        }

        let updated = this.forceUpdate();

        if (updated) {
            this.runSubscribers();
        }

        return updated; // is changed
    }
}

export { State };