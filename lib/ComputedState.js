class ComputedState {
    #value = null
    #name = ''
    value = null
    #setterFunction = null
    #dependencies = []
    #stateManager = null

    constructor(name = null, setterFunction, dependencies = [], stateManager) {
        this.#name = name;
        this.#value = null;
        this.listeners = [];
        this.#setterFunction = setterFunction;
        this.#stateManager = stateManager;
        this.#dependencies = dependencies.filter(state=>state.isComputed == false).map(state=>state.name);

        if (this.#dependencies.length != dependencies.length) {
            console.error(`Computed states are ignored`);
        }

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
        
        for (let i=0; i<deps.length; i++) {
            if (changed_state_names.indexOf(deps[i])!=-1) {
                recomputeFlag = true;
                break;
            }
        }

        let previousValue = this.#value;
        let newValue = previousValue; 
        let updated = false;

        if (recomputeFlag) {
            newValue = this.#setterFunction(previousValue);
            updated = previousValue != newValue;
        }

        if (!updated) return false;

        this.#value = newValue;

        if (!this.#stateManager) {

            for (let i = 0; i < this.listeners.length; i++) {
                let listener = this.listeners[i];
                try {
                    listener(previousValue, newValue);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
        else {
                
            for (let i = 0; i < this.listeners.length; i++) {
                let listener = this.listeners[i];
                this.#stateManager.__callbacksToRun.push([listener, previousValue, newValue]);
            }
        }
        
        return true; // updated
    }
}

export {ComputedState};