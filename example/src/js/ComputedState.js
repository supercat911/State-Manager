class ComputedState {
    #value = null
    value = null
    #name = ''
    name = ""
    state_id = 0

    #getterFunction = null
    #listeners = []
    #previousValue = null

    constructor(name = null, getterFunction) {
        this.#name = name;
        this.#value = null;
        this.#previousValue = null;
        this.#listeners = [];
        this.#getterFunction = getterFunction;

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
        return this.#value;
    }

    getName() {
        return this.#name;
    }

    recompute() {
        let newValue = this.#getterFunction(this.#value);

        let updated = this.#value != newValue;
        if (!updated) return false;

        this.#previousValue = this.#value;
        this.#value = Object.freeze(newValue);

        return true; // updated
    }
}

export { ComputedState };