import { ApiClient } from "./_base";
import {
    ChatBotCreateRequest,
    ChatBotResponse,
    ChatBotUpdateRequest,
    ErrorMessageResponse,
    PaginatedChatBotResponse
} from "./generatedcode/generated";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";
import configOptions from "./util/config";

type listChatBotsErrors = GenericErrors;
type createChatBotErrors = GenericErrors;
type getChatBotErrors = GenericErrors | ErrorCode.NO_DB_ENTITY;
type updateChatBotErrors = GenericErrors | ErrorCode.NO_DB_ENTITY;
type deleteChatBotErrors = GenericErrors | ErrorCode.NO_DB_ENTITY;

export default new (class ChatBotClient extends ApiClient {
    public async listChatBots(
        instance: number,
        { page = 1, pageSize = configOptions.itemsperpage.value as number }
    ): Promise<InternalStatus<PaginatedChatBotResponse, listChatBotsErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.api.chatControllerList(
                { page, pageSize },
                {
                    headers: {
                        Instance: instance.toString()
                    }
                }
            );
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 200: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as PaginatedChatBotResponse
                });
            }
            default: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
            }
        }
    }

    public async createChatBot(
        instance: number,
        chatBot: ChatBotCreateRequest
    ): Promise<InternalStatus<ChatBotResponse, createChatBotErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.api.chatControllerCreate(chatBot, {
                headers: {
                    Instance: instance.toString()
                }
            });
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 201: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as ChatBotResponse
                });
            }
            default: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
            }
        }
    }

    public async updateChatBot(
        instance: number,
        chatBot: ChatBotUpdateRequest
    ): Promise<InternalStatus<ChatBotResponse | null, updateChatBotErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.api.chatControllerUpdate(chatBot, {
                headers: {
                    Instance: instance.toString()
                }
            });
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 200: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as ChatBotResponse
                });
            }
            case 204: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: null
                });
            }
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.NO_DB_ENTITY,
                        {
                            errorMessage: response.data as ErrorMessageResponse
                        },
                        response
                    )
                });
            }
            default: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
            }
        }
    }

    public async getChatBot(
        instance: number,
        chatBotId: number
    ): Promise<InternalStatus<ChatBotResponse, getChatBotErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.api.chatControllerGetId(chatBotId, {
                headers: {
                    Instance: instance.toString()
                }
            });
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 200: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as ChatBotResponse
                });
            }
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.NO_DB_ENTITY,
                        {
                            errorMessage: response.data as ErrorMessageResponse
                        },
                        response
                    )
                });
            }
            default: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
            }
        }
    }

    public async deleteChatBot(
        instance: number,
        chatBotId: number
    ): Promise<InternalStatus<null, deleteChatBotErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.api.chatControllerDelete(chatBotId, {
                headers: {
                    Instance: instance.toString()
                }
            });
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 204: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: null
                });
            }
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.NO_DB_ENTITY,
                        {
                            errorMessage: response.data as ErrorMessageResponse
                        },
                        response
                    )
                });
            }
            default: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
            }
        }
    }
})();
