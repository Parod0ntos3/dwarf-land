class FSM {
 
    constructor() {
        this.stack = new Array();
        this.currentState = undefined;
        this.currentStatesOnEnterCalled = false;
    }
 
    update() {
        if (this.currentState !== undefined) {
            if(this.currentStatesOnEnterCalled === false) {
                this.callCurrentStatesOnEnter();
            }
            this.currentState.update();
        }
    }
 
    popState() {
        this.callCurrentStatesOnExit();

        if(this.stack.length > 0) {
            this.stack.splice(this.stack.length - 1, 1);
        }

        this.currentState = this.getCurrentState();
        this.currentStatesOnEnterCalled = false;
    }
 
    pushState(state) {
        if(this.currentState !== state) {
            this.callCurrentStatesOnExit();

            this.stack.push(state);

            this.currentState = this.getCurrentState();
            this.currentStatesOnEnterCalled = false;
        }
    }

    pushStateAndPopCurrentState(state) {
        if(this.currentState !== state) {
            this.callCurrentStatesOnExit();
            
            if(this.stack.length > 0) {
                this.stack.splice(this.stack.length - 1, 1);
            }

            this.stack.push(state);

            this.currentState = this.getCurrentState();
            this.currentStatesOnEnterCalled = false;
        }
    }
 
    getCurrentState() {
        if(this.stack.length > 0)
            return this.stack[this.stack.length - 1];
        else
            return undefined;
    }

    callCurrentStatesOnEnter() {
        if(this.currentState !== undefined) {
            this.currentStatesOnEnterCalled = true;
            this.currentState.onEnter();
        }
    }

    callCurrentStatesOnExit() {
        if(this.currentState !== undefined && this.currentStatesOnEnterCalled === true) {
            this.currentState.onExit();
        }
    }
}