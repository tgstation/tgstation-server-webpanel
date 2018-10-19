import ILocalization from "./ILocalization";
import ITranslation from "./ITranslation";
import Locales from './Locales';

// tslint:disable-next-line:class-name
class enCATranslation implements ITranslation {
    public readonly locale: string = Locales.enCA;
    public readonly messages: ILocalization;
    constructor() {
        this.messages = {
            "example.key": "sampleText"
        };
    }

    public Load(): Promise<void> {
        // TODO: load from web
        return Promise.resolve();
    }
}

export default enCATranslation;