import { TypedEmitter } from 'tiny-typed-emitter/lib';
import { Components } from './generatedcode/_generated';
import InternalStatus, { StatusCode } from './models/InternalComms/InternalStatus';
import InternalError, { ErrorCode, GenericErrors } from './models/InternalComms/InternalError';
import LoginHooks from './util/LoginHooks';
import ServerClient from './ServerClient';
interface IEvents {
    loadUserInfo: (user: InternalStatus<Components.Schemas.User, GenericErrors>) => void;
}

export default new (class UserClient extends TypedEmitter<IEvents> {
    private _cachedUser?: InternalStatus<Components.Schemas.User, ErrorCode.OK>;
    public get cachedUser() {
        return this._cachedUser;
    }
    private loadingUserInfo = false;

    public constructor() {
        super();
        this.getCurrentUser = this.getCurrentUser.bind(this);

        LoginHooks.addHook(this.getCurrentUser);
        ServerClient.on('purgeCache', () => {
            this._cachedUser = undefined;
        });
    }

    public async createUser(
        user: Components.Schemas.UserUpdate
    ): Promise<
        InternalStatus<Components.Schemas.User, GenericErrors | ErrorCode.USER_NO_SYS_IDENT>
    > {
        let response;
        try {
            response = await ServerClient.apiClient.UserController_Create(undefined, user);
        } catch (stat) {
            return new InternalStatus<Components.Schemas.User, GenericErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 200: {
                const thing = response.data as Components.Schemas.User;
                //process data
                return new InternalStatus<Components.Schemas.User, ErrorCode.OK>({
                    code: StatusCode.OK,
                    payload: thing
                });
            }
            case 410: {
                const errorMessage = response.data as Components.Schemas.ErrorMessage;
                return new InternalStatus<Components.Schemas.User, ErrorCode.USER_NO_SYS_IDENT>({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.USER_NO_SYS_IDENT,
                        { errorMessage },
                        response
                    )
                });
            }
            default: {
                return new InternalStatus<Components.Schemas.User, ErrorCode.UNHANDLED_RESPONSE>({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        {
                            axiosResponse: response
                        },
                        response
                    )
                });
            }
        }
    }

    public async updateUser(
        user: Components.Schemas.UserUpdate
    ): Promise<InternalStatus<Components.Schemas.User, GenericErrors | ErrorCode.USER_NOT_FOUND>> {
        let response;
        try {
            response = await ServerClient.apiClient.UserController_Update(undefined, user);
        } catch (stat) {
            return new InternalStatus<Components.Schemas.User, GenericErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 200: {
                const thing = response.data as Components.Schemas.User;
                return new InternalStatus<Components.Schemas.User, ErrorCode.OK>({
                    code: StatusCode.OK,
                    payload: thing
                });
            }
            case 404: {
                const errorMessage = response.data as Components.Schemas.ErrorMessage;
                return new InternalStatus<Components.Schemas.User, ErrorCode.USER_NOT_FOUND>({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.USER_NOT_FOUND, { errorMessage }, response)
                });
            }
            default: {
                return new InternalStatus<Components.Schemas.User, ErrorCode.UNHANDLED_RESPONSE>({
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

    public async getCurrentUser(): Promise<InternalStatus<Components.Schemas.User, GenericErrors>> {
        if (this._cachedUser) {
            return this._cachedUser;
        }

        if (this.loadingUserInfo) {
            return await new Promise(resolve => {
                this.on('loadUserInfo', user => {
                    resolve(user);
                });
            });
        }

        this.loadingUserInfo = true;

        let response;
        try {
            response = await ServerClient.apiClient.UserController_Read();
        } catch (stat) {
            const res = new InternalStatus<Components.Schemas.User, GenericErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
            this.emit('loadUserInfo', res);
            this.loadingUserInfo = false;
            return res;
        }

        switch (response.status) {
            case 200: {
                const thing = new InternalStatus<Components.Schemas.User, ErrorCode.OK>({
                    code: StatusCode.OK,
                    payload: response.data as Components.Schemas.User
                });

                this._cachedUser = thing;
                this.emit('loadUserInfo', thing);
                this.loadingUserInfo = false;
                return thing;
            }
            default: {
                const res = new InternalStatus<
                    Components.Schemas.User,
                    ErrorCode.UNHANDLED_RESPONSE
                >({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
                this.emit('loadUserInfo', res);
                this.loadingUserInfo = false;
                return res;
            }
        }
    }
    //TODO: implement all user endpoints
})();
