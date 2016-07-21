const ObservableData = require('../util/ObservableData')

class SynchronizingStore {

    constructor(reduxStore) {
        Object.assign(this, {reduxStore})
        this.dispatches = new ObservableData()
        this.dispatch = this.dispatch.bind(this)
        this.applyAction = this.applyAction.bind(this)
    }

    getState() {
        return this.reduxStore.getState()
    }

    dispatch(action) {
        this.applyAction(action)
        this.dispatches.value = action
    }

    subscribe(listener) {
        return this.reduxStore.subscribe(listener)
    }

    applySnapshot() {
    }

    applyAction(action) {
        return this.reduxStore.dispatch(action)
    }

}

module.exports = SynchronizingStore