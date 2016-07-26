const ObservableData = require('../util/ObservableData')

class UpdateRouter {

    constructor() {
        this.actionsApplied = new Map()
        this.updateIdsApplied = new Set()
        this.action = new ObservableData()
        this.updateIdsWanted = new ObservableData()

        this.updatesAvailable = this.updatesAvailable.bind(this)
        this.update = this.update.bind(this)

    }

    updatesAvailable(newUpdateIds) {
        this.updateIdsWanted.value = newUpdateIds.filter( x => !this.updateIdsApplied.has(x))
    }

    update(update) {
        this._applyActions(update.actions)
        this.updateIdsApplied.add(update.id)
    }

    _applyActions(actions) {
        actions.filter( a => !this.actionsApplied.has(a.id))
                .forEach( a => {
                    this.actionsApplied.set(a.id, a)
                    this.action.set(a)
                } )
    }
}

module.exports = UpdateRouter