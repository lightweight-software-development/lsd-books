const {makeInputEvent, makeInputValue, makeOutputValue, bindEventFunctions} = require('../util/Events')

class NewActionScheduler {

    constructor() {
        bindEventFunctions(this)
    }

    newAction() {
    }

    updateStored(update) {
    }

    storeAvailable(isAvailable) {
    }

    storeRequired() {
        // TODO do not trigger when store in progress
        // TODO trigger only after quiet for an interval
        const result = !!(this.storeAvailable.value && this.newAction.value);
        console.log('storeRequired', result)
        return result
    }

}

makeInputValue(NewActionScheduler.prototype, "newAction")
makeInputEvent(NewActionScheduler.prototype, "updateStored")

makeInputValue(NewActionScheduler.prototype, "storeAvailable")

makeOutputValue(NewActionScheduler.prototype, "storeRequired")

module.exports = NewActionScheduler