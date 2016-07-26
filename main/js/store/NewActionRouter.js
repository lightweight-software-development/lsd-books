const {makeInputEvent, makeOutputEvent, bindEventFunctions} = require('../util/Events')

class NewActionRouter {

    static newId() {
        const ensureUnique = Math.floor(Math.random() * 1000000)
        return Date.now() + '-' + ensureUnique
    }

    static newUpdate(actions) {
        return {
            id: NewActionRouter.newId(),
            actions: actions
        }
    }

    constructor() {
        bindEventFunctions(this)
    }

    // get newActions() {
    //     return this._newActions
    // }

    /*set */
    // input event
    newActions(actions) {
        this._newActions = actions.slice()
    }

    // input event
    tryToStore() {
    }

    // input event
    updateStored(update) {
    }

    // output event
    updateToStore() {
        const actions = this._newActions
        if (actions && actions.length && this.tryToStore.triggered) {
            return NewActionRouter.newUpdate(actions)
        }
    }

    // output event
    actionsToDelete() {
        if (this.updateStored.triggered) return this.updateStored.value.actions
    }

}

makeInputEvent(NewActionRouter.prototype, "newActions")
makeInputEvent(NewActionRouter.prototype, "tryToStore")
makeInputEvent(NewActionRouter.prototype, "updateStored")

makeOutputEvent(NewActionRouter.prototype, "updateToStore")
makeOutputEvent(NewActionRouter.prototype, "actionsToDelete")

module.exports = NewActionRouter