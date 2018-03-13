class FSM {
 
    constructor() {
        this._stack = new Array();
        this._currentState = undefined;
        this._currentStateOnEnterCalled = false;
    }

    // Public methods:
 
    update() {
        if (this._currentState !== undefined) {
            if(this._currentStateOnEnterCalled === false) {
                this.callCurrentStatesOnEnter();
            }
            this._currentState.update();
        }
    }
 
    popState() {
        this.callCurrentStatesOnExit();

        if(this._stack.length > 0) {
            this._stack.splice(this._stack.length - 1, 1);
        }

        this._currentState = this.getCurrentState();
        this._currentStateOnEnterCalled = false;
    }
 
    pushState(state) {
        if(this._currentState !== state) {
            this.callCurrentStatesOnExit();

            this._stack.push(state);

            this._currentState = this.getCurrentState();
            this._currentStateOnEnterCalled = false;
        }
    }

    pushStateAndPopCurrentState(state) {
        if(this._currentState !== state) {
            this.callCurrentStatesOnExit();
            
            if(this._stack.length > 0) {
                this._stack.splice(this._stack.length - 1, 1);
            }

            this._stack.push(state);

            this._currentState = this.getCurrentState();
            this._currentStateOnEnterCalled = false;
        }
    }
 
    getCurrentState() {
        if(this._stack.length > 0)
            return this._stack[this._stack.length - 1];
        else
            return undefined;
    }

    getCurrentStateName() {
        return this._currentState.getStateName();
    }

    callCurrentStatesOnEnter() {
        if(this._currentState !== undefined) {
            this._currentStateOnEnterCalled = true;
            this._currentState.onEnter();
        }
    }

    callCurrentStatesOnExit() {
        if(this._currentState !== undefined && this._currentStateOnEnterCalled === true) {
            this._currentState.onExit();
        }
    }
}