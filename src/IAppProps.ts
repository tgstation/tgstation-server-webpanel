import IHttpClient from './clients/IHttpClient';
import ITranslationFactory from './translations/ITranslationFactory';

interface IAppProps {
    readonly serverAddress: string;
    readonly locale: string;
    readonly translationFactory?: ITranslationFactory;
    readonly httpClient?: IHttpClient;
}

export default IAppProps;