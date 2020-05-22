import ITranslation from './ITranslation';
import ILocalization from './ILocalization';

export default class Translation implements ITranslation {
    public constructor(public readonly locale: string, public readonly messages: ILocalization) {}
}
