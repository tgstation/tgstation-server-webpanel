import { ErrorMessage } from "../clients/generated/models";

import ITranslation from '../translations/ITranslation';

export default class ServerResponse<TModel> {
    constructor(private readonly translation: ITranslation, public readonly response?: Response, public readonly model?: TModel) {
    }

    public async getError(): Promise<string> {
        if (!this.response) {
            return this.translation.messages["fetch_api_error"];
        }

        try {
            const json = await this.response.json();
            const errorMessage = json as ErrorMessage;
            if (errorMessage.errorCode != null) {
                let message = `HTTP ${this.response.status}: ${errorMessage.errorCode} ${this.translation.forErrorCode(errorMessage.errorCode, errorMessage.message)}`;
                if (errorMessage.additionalData) {
                    message = `${message}\n${errorMessage.additionalData}`
                }

                return message;
            }

            return this.response.statusText;
        } catch (e) {
            return this.response.statusText;
        }
    }
}
