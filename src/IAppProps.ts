import IHttpClient from "./clients/IHttpClient";
import IServerClient from "./clients/IServerClient";

import ITranslationFactory from "./translations/ITranslationFactory";

interface IAppProps {
  readonly serverAddress: string;
  readonly locale: string;
  readonly translationFactory?: ITranslationFactory;
  readonly httpClient?: IHttpClient;
  readonly serverClient?: IServerClient;
}

export default IAppProps;
