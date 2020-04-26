import { ErrorMessage } from '../clients/generated/models';

import ITranslation from '../translations/ITranslation';

export default class ServerResponse<TModel> {
    public readonly response?: Response;
    public readonly model?: TModel;

    public constructor(
        private readonly translation: ITranslation | null,
        response?: Response | null,
        model?: TModel | null,
        private readonly errorMessage?: string
    ) {
        if (response) this.response = response;
        if (model) this.model = model;
    }

    public async getError(): Promise<string> {
        if (this.errorMessage) return this.errorMessage;

        if (this.model) throw new Error('model is set!');

        if (!this.response) {
            return (
                this.translation?.messages['fetch_api_error'] || 'Unknown Error'
            );
        }

        if (this.translation) {
            try {
                const json = await this.response.json();
                const errorMessage = json as ErrorMessage;
                if (errorMessage.errorCode != null) {
                    let message = `HTTP ${this.response.status}: Code ${
                        errorMessage.errorCode
                    }: ${this.translation.forErrorCode(
                        errorMessage.errorCode,
                        errorMessage.message
                    )}`;
                    if (errorMessage.additionalData) {
                        message = `${message}\n${errorMessage.additionalData}`;
                    }

                    return message;
                }
            } catch (e) {
                return (
                    this.translation.messages['server_response.exception'] +
                    e.toString()
                );
            }
        }

        return this.response.statusText;
    }
}
