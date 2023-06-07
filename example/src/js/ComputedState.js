class ComputedState {
    #value = null
    value = null
    #name = ''
    name = ""

    #setterFunction = null
    #dependencies = []
    stateManager = null
    #listeners = []
    #previousValue = null

    constructor(name = null, setterFunction, dependencies = [], stateManager) {
        this.#name = name;
        this.#value = null;
        this.#previousValue = null;
        this.#listeners = [];
        this.#setterFunction = setterFunction;
        this.stateManager = stateManager;

        this.#loadDependencies(dependencies);

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

    #loadDependencies(dependencies = []) {
        let result = [];

        for (let i = 0; i < dependencies.length; i++) {
                
                let state = typeof dependencies[i] == "string"? this.stateManager.getState(dependencies[i]): dependencies[i];
                
                if (state.isComputed == false) {
                    result.push(state.getName());
                }
                else {
                    console.error(`Computed state has been ignored: ${state.getName()}`);
                }
        }

        this.#dependencies = result;
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

    recompute(changed_state_names) {

        if (changed_state_names.length == 0) return false;

        let deps = this.#dependencies;
        let recomputeFlag = false;

        for (let i = 0; i < deps.length; i++) {
            if (changed_state_names.indexOf(deps[i]) != -1) {
                recomputeFlag = true;
                break;
            }
        }

        let updated = false;
        let newValue = this.#value;

        if (recomputeFlag) {
            newValue = this.#setterFunction(this.#value);
        }

        updated = this.#value != newValue;

        if (!updated) return false;

        this.#previousValue = this.#value;
        this.#value = Object.freeze(newValue);

        return true; // updated
    }
}

export { ComputedState };