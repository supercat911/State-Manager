import { compareObjects } from "./Utils.js";

class ComputedState {
    #value = null
    value = null
    #name = ''
    name = ""
    state_id = 0
    _alreadyComputed = false

    #getterFunction = null
    #listeners = []
    #previousValue = null
    stateManager = null

    constructor(name = null, getterFunction, stateManager) {
        this.#name = name;
        this.#value = null;
        this.#previousValue = null;
        this.#listeners = [];
        this.#getterFunction = getterFunction;
        this.stateManager = stateManager;

        let that = this;
        Object.defineProperty(this, "value", {
            get() {
                return that.getValue();
            },
            enumerable: true,
            configurable: true,
        });

        Object.defineProperty(this, "name", {
            value: that.getName(),
            writable: false,
            enumerable: true,
            configurable: true,
        });

        Object.defineProperty(this, "isComputed", {
            value: true,
            writable: false,
            enumerable: true,
            configurable: true,
        });

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

    hasSubscribers() {
        return this.#listeners.length!=0;
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

    getValue() {

        if (this._alreadyComputed == false) {
            this.recompute();
            this._alreadyComputed = true;
        }

        return this.#value;
    }

    getName() {
        return this.#name;
    }

    recompute() {
        let newValue = this.#getterFunction(this.#value);

        let updated = !compareObjects(this.#value, newValue);

        if (!updated) return false;

        this.#previousValue = this.#value;
        this.#value = Object.freeze(newValue);

        if (this.stateManager) {
            this.stateManager.addTask("update.computed", this.state_id);
            return;
        } else {
            this.runSubscribers();
        }

        return true; // updated
    }
}

export { ComputedState };