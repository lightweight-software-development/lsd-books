const EventObserver = require('./EventObserver')

function bindEventFunctions(obj) {
    inputEvents(obj).concat(outputEvents(obj), inputValues(obj)).forEach( p => obj[p] = obj[p].bind(obj) )
    outputEvents(obj).forEach( p => new EventObserver(obj[p]) )
}

function inputValues(obj) {
    return Object.getPrototypeOf(obj)._inputValues
}

function inputEvents(obj) {
    return Object.getPrototypeOf(obj)._inputEvents
}

function outputEvents(obj) {
    return Object.getPrototypeOf(obj)._outputEvents
}

function resetInputEvents(obj) {
    inputEvents(obj).forEach( f => {
        obj[f].triggered = false
        obj[f].value = undefined
    })
}

function fireOutputEvents(obj) {
    outputEvents(obj).forEach( f => {
        obj[f]._observer.checkEvent()
    })
}

function makeInputValue(obj, propertyName) {
    const propDesc = Object.getOwnPropertyDescriptor(obj, propertyName)
    if (propDesc.value && typeof propDesc.value === "function") {
        const originalFunction = propDesc.value
        propDesc.value = function (data) {
            resetInputEvents(this)
            this[propertyName].value = data
            originalFunction.call(this, data)
            fireOutputEvents(this)
        }
        Object.defineProperty(obj, propertyName, propDesc)
    } else {
        throw new Error(`Cannot make input value with ${propertyName} of ${obj}: property is not a function`)
    }

    obj._inputValues = (obj._inputValues || []).concat(propertyName)
}

function makeInputEvent(obj, propertyName) {
    const propDesc = Object.getOwnPropertyDescriptor(obj, propertyName)
    if (propDesc.value && typeof propDesc.value === "function") {
        const originalFunction = propDesc.value
        propDesc.value = function (data) {
            resetInputEvents(this)
            this[propertyName].triggered = true
            this[propertyName].value = data
            originalFunction.call(this, data)
            fireOutputEvents(this)
        }
        Object.defineProperty(obj, propertyName, propDesc)
    } else {
        throw new Error(`Cannot make input event with ${propertyName} of ${obj}: property is not a function`)
    }

    obj._inputEvents = (obj._inputEvents || []).concat(propertyName)
}

function makeOutputEvent(obj, propertyName) {
    obj._outputEvents = (obj._outputEvents || []).concat(propertyName)
}

module.exports = {makeInputEvent, makeInputValue, makeOutputEvent, bindEventFunctions}