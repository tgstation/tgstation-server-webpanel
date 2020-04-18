import ServerResponse from '../models/ServerResponse';

import ITranslation from './ITranslation';

interface ITranslationFactory {
    loadTranslation(locale: string): Promise<ServerResponse<ITranslation>>;
}

export default ITranslationFactory;
