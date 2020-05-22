import ITranslationFactory from './translations/ITranslationFactory';

interface IAppProps {
    readonly serverAddress: string;
    readonly locale: string;
    readonly translationFactory?: ITranslationFactory;
}

export default IAppProps;
