import { WINDOW_VARIABLE, SHARED_ATTRIBUTE, PUBLISH_CODE } from "../shared/constants";

class Microfrontend extends HTMLElement {
    constructor() {
        super();

        // attributes
        this.name = this.getAttribute("name");
        this.url = this.getAttribute("url");

        // strictly internal
        const brokerSharedAttributes = window[WINDOW_VARIABLE.BROKER];

        if (brokerSharedAttributes === undefined || brokerSharedAttributes === null)
            throw new Error();

        this._bus =  brokerSharedAttributes[SHARED_ATTRIBUTE.BUS];
    }

    connectedCallback() {
        this._bus.publish(PUBLISH_CODE.INITIALIZED);
        requestAnimationFrame(() => this._fetchHtml());
    }

    disconnectedCallback() {
        this._bus.publish(PUBLISH_CODE.DESTROYED);
    }

    _fetchHtml() {
        const frameElement = document.createElement('iframe');
        frameElement.sandbox.add("allow-same-origin");
        frameElement.sandbox.add("allow-scripts");
        frameElement.sandbox.add("allow-popups");
        frameElement.sandbox.add("allow-forms");
        frameElement.frameBorder = 0;
        this.appendChild(frameElement);
        const { contentWindow, contentDocument } = frameElement;
        if (!contentDocument || !contentWindow) 
            return;
        const containerHTMLDocument = document.implementation.createHTMLDocument();
        
        this._bus.publish(PUBLISH_CODE.STARTED_FETCH);
        fetch(this.url, { mode: "cors", referrerPolicy: "origin-when-cross-origin"})
        .then(async (response) => {
            const containerHTML = await response.text();

            if (containerHTML) {
                containerHTMLDocument.documentElement.innerHTML = containerHTML;
                const containerBase = document.createElement("base");
                containerBase.href = this.url;
                containerHTMLDocument.head.insertAdjacentElement("afterbegin", containerBase);
                if (contentWindow) {
                    Object.defineProperty(contentWindow, WINDOW_VARIABLE.ROLL_CAKE, { value: mainAttributes });
                }
                if (contentDocument) {
                    contentDocument.write(containerHTMLDocument.documentElement.innerHTML);
                    contentDocument.close();
                }
            }
            return;
        })
        .catch(() => {
            return;
        })
        .finally(() => {
            this._bus.publish(PUBLISH_CODE.FINISHED_FETCH);
            return;
        });
    }
}

customElements.define('microfrontend', Microfrontend);