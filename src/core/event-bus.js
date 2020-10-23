function EventBus() {
    this._subscriptions = {};
    this._getNextUniqueId = this._getIdGenerator();
}

EventBus.prototype.subscribe = function(eventType, callback) {
    const _id = this._getNextUniqueId();

    if (!this._subscriptions[eventType]) {
        this._subscriptions[eventType] = {};
    }

    this._subscriptions[eventType][id] = callback;

    return {
        unsubscribe: () => {
            delete this._subscriptions[eventType][id]
            if(Object.keys(this._subscriptions[eventType]).length === 0) delete this._subscriptions[eventType]
        }
    }
}

EventBus.prototype.publish = function(eventType, arg = null) {
    if (!this._subscriptions[eventType])
        return;
    Object.keys(this._subscriptions[eventType]).forEach(key => this._subscriptions[eventType][key](arg));
}

EventBus.prototype._getIdGenerator = function() {
    let lastId = 0;

    return function getNextUniqueId() {
        lastId += 1;
        return lastId;
    }
}

export default EventBus;