import { DefaultListener, ListenerSignature, TypedEmitter } from "tiny-typed-emitter";

export abstract class ApiClient<
    L extends ListenerSignature<L> = DefaultListener
> extends TypedEmitter<L> {

    public constructor() {
        super();
        if (window.clients == undefined) {
            window.clients = {}
        }
        console.log(this.constructor.name, this);
        window.clients[this.constructor.name] = this;
    }
}
