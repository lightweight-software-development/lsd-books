const {makeInputEvent, makeInputValueList, makeInputValue, makeOutputEvent, bindEventFunctions} = require('../util/Events')

const uuid = require('node-uuid')
const {List} = require('immutable')

const ObservableData = require('../util/ObservableData')
const UpdateRouter = require('./UpdateRouter')
const NewActionRouter = require('./NewActionRouter')
const NewActionScheduler = require('./NewActionScheduler')
const StartupRouter = require('./StartupRouter')

function newId() {
    return uuid.v4()
}

class PersistentStoreController {

    constructor() {
        bindEventFunctions(this)
        this._assembleComponents()

        this.actionsFromApp = new List()
    }

    init() {
        this.startupRouter.init()
    }

    actionFromApp(action) {
        return Object.assign({id: newId()}, action)
    }

    localStoredActions(actions) {
    }

    localStoredUpdates(actions) {
    }

    updateStoredRemote(update) {
    }

    remoteStoreAvailable(isAvailable) {
    }

    actionToStore() {
        const existingActions = new List(this.localStoredActions.value || [])
        return this.actionFromApp.values.filterNot( x => existingActions.find( y => y.id === x.id)).first()
    }

    updateToStoreRemote() {
        return this.newActionRouter.updateToStore()
    }

    updateToStoreLocal() {
        return this.updateStoredRemote.value
    }

    actionsToDelete() {
        return this.newActionRouter.actionsToDelete.value
    }

    actionToApply() {
        return this.updateRouter.action.value
    }

    _assembleComponents() {
        this.updateRouter = new UpdateRouter()
        this.newActionRouter = new NewActionRouter()
        this.newActionScheduler = new NewActionScheduler()
        this.startupRouter = new StartupRouter()

        this.actionFromApp.forwardTo(this.newActionScheduler.newAction)

        this.localStoredActions.forwardTo(this.newActionScheduler.newAction)
        this.localStoredActions.forwardTo(this.newActionRouter.newActions)
        this.localStoredActions.forwardTo(this.startupRouter.actions)
        this.localStoredUpdates.forwardTo(this.startupRouter.updates)

        this.startupRouter.update.sendTo(this.updateRouter.update)

        this.updateStoredRemote.forwardTo(this.newActionRouter.updateStored,
                                                this.newActionScheduler.updateStored)
        this.remoteStoreAvailable.forwardTo(this.newActionScheduler.storeAvailable)
        this.newActionScheduler.storeRequired.sendTo(this.newActionRouter.tryToStore)

    }
}

makeInputValueList(PersistentStoreController.prototype, "actionFromApp")
makeInputValue(PersistentStoreController.prototype, "localStoredActions")
makeInputEvent(PersistentStoreController.prototype, "localStoredUpdates")
makeInputEvent(PersistentStoreController.prototype, "updateStoredRemote")

makeInputValue(PersistentStoreController.prototype, "remoteStoreAvailable")

makeOutputEvent(PersistentStoreController.prototype, "actionToStore")
makeOutputEvent(PersistentStoreController.prototype, "updateToStoreRemote")
makeOutputEvent(PersistentStoreController.prototype, "updateToStoreLocal")
makeOutputEvent(PersistentStoreController.prototype, "actionsToDelete")
makeOutputEvent(PersistentStoreController.prototype, "actionToApply")

module.exports = PersistentStoreController
