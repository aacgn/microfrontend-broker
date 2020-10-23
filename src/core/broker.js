import EventBus from "./event-bus";
import { WINDOW_VARIABLE, SHARED_ATTRIBUTE } from "../shared/constants";

function Broker(config) {
    const { refState } = config;
    
    this.bus = new EventBus();
    this.refState = refState;

    this._init();
}

Broker.prototype._init = function() {
    window[WINDOW_VARIABLE.BROKER] = {
        [SHARED_ATTRIBUTE.STATE]: this.refState,
        [SHARED_ATTRIBUTE.BUS]: this.bus
    };
}

export default Broker;