import ITranslation from './ITranslation';
import ILocalization from './ILocalization';

import { ErrorCode } from '../clients/generated';

export default class Translation implements ITranslation {
    constructor(
        public readonly locale: string,
        public readonly messages: ILocalization
    ) {}

    forErrorCode(errorCode: ErrorCode, serverMessage?: string): string {
        if (this.locale.startsWith('en')) {
            if (serverMessage) {
                return serverMessage;
            }

            return this.messages['error_code_missing_message'];
        }

        return this.messages[`error_code_${errorCode.valueOf()}`];
    }
}
