import InternalStatus, { StatusCode } from '../models/InternalComms/InternalStatus';
import { Components } from './_generated';
import InternalError, { ErrorCode, GenericErrors } from '../models/InternalComms/InternalError';
import { TypedEmitter } from 'tiny-typed-emitter/lib';
import ServerClient from './ServerClient';

interface IEvents {
    loadAdminInfo: (
        user: InternalStatus<Components.Schemas.Administration, AdminInfoErrors>
    ) => void;
}

export type AdminInfoErrors =
    | GenericErrors
    | ErrorCode.ADMIN_GITHUB_RATE
    | ErrorCode.ADMIN_GITHUB_ERROR;

class UserClient extends TypedEmitter<IEvents> {
    private _cachedAdminInfo?: InternalStatus<Components.Schemas.Administration, ErrorCode.OK>;
    public get cachedAdminInfo() {
        return this._cachedAdminInfo;
    }
    private loadingAdminInfo = false;

    public async getAdminInfo(): Promise<
        InternalStatus<Components.Schemas.Administration, AdminInfoErrors>
    > {
        if (this._cachedAdminInfo) {
            return this._cachedAdminInfo;
        }

        if (this.loadingAdminInfo) {
            return await new Promise(resolve => {
                this.on('loadAdminInfo', info => {
                    resolve(info);
                });
            });
        }

        this.loadingAdminInfo = true;

        let response;
        try {
            response = await ServerClient.apiClient.AdministrationController_Read();
        } catch (stat) {
            const res = new InternalStatus<Components.Schemas.Administration, AdminInfoErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<AdminInfoErrors>
            });
            this.emit('loadAdminInfo', res);
            this.loadingAdminInfo = false;
            return res;
        }

        switch (response.status) {
            case 200: {
                const thing = new InternalStatus<Components.Schemas.Administration, ErrorCode.OK>({
                    code: StatusCode.OK,
                    payload: response.data as Components.Schemas.Administration
                });

                this._cachedAdminInfo = thing;
                this.emit('loadAdminInfo', thing);
                this.loadingAdminInfo = false;
                return thing;
            }
            case 424: {
                const errorMessage = response.data as Components.Schemas.ErrorMessage;
                const thing = new InternalStatus<
                    Components.Schemas.Administration,
                    ErrorCode.ADMIN_GITHUB_RATE
                >({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.ADMIN_GITHUB_RATE,
                        { errorMessage },
                        response
                    )
                });
                this.emit('loadAdminInfo', thing);
                this.loadingAdminInfo = false;
                return thing;
            }
            case 429: {
                const errorMessage = response.data as Components.Schemas.ErrorMessage;
                const thing = new InternalStatus<
                    Components.Schemas.Administration,
                    ErrorCode.ADMIN_GITHUB_ERROR
                >({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.ADMIN_GITHUB_ERROR,
                        { errorMessage },
                        response
                    )
                });
                this.emit('loadAdminInfo', thing);
                this.loadingAdminInfo = false;
                return thing;
            }
            default: {
                const res = new InternalStatus<
                    Components.Schemas.Administration,
                    ErrorCode.UNHANDLED_RESPONSE
                >({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
                this.emit('loadAdminInfo', res);
                this.loadingAdminInfo = false;
                return res;
            }
        }
    }
}

export default new UserClient();
