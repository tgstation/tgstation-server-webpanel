import { ApiClient } from "./_base";
import type { InstancePermissionSetResponse } from "./generatedcode/generated";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";

interface IEvents {
    loadInstancePermissionSet: (
        user: InternalStatus<InstancePermissionSetResponse, GenericErrors>
    ) => void;
}

export type getCurrentInstancePermissionSetErrors = GenericErrors;

export default new (class InstancePermissionSetClient extends ApiClient<IEvents> {
    private _cachedInstancePermissionSet: Map<
        number,
        InternalStatus<InstancePermissionSetResponse, ErrorCode.OK>
    > = new Map<number, InternalStatus<InstancePermissionSetResponse, ErrorCode.OK>>();

    private loadingInstancePermissionSetInfo: Map<number, boolean> = new Map<number, boolean>();

    public constructor() {
        super();

        ServerClient.on("purgeCache", () => {
            this._cachedInstancePermissionSet.clear();
        });
    }

    public async getCurrentInstancePermissionSet(
        instanceid: number
    ): Promise<
        InternalStatus<InstancePermissionSetResponse, getCurrentInstancePermissionSetErrors>
    > {
        await ServerClient.wait4Init();

        if (this._cachedInstancePermissionSet.has(instanceid)) {
            return this._cachedInstancePermissionSet.get(instanceid)!;
        }

        if (this.loadingInstancePermissionSetInfo.get(instanceid)) {
            return await new Promise(resolve => {
                const resolver = (
                    user: InternalStatus<InstancePermissionSetResponse, GenericErrors>
                ) => {
                    resolve(user);
                    this.removeListener("loadInstancePermissionSet", resolver);
                };
                this.on("loadInstancePermissionSet", resolver);
            });
        }

        this.loadingInstancePermissionSetInfo.set(instanceid, true);

        let response;
        try {
            response =
                await ServerClient.apiClient!.instancePermissionSet.instancePermissionSetControllerRead(
                    {
                        headers: {
                            Instance: instanceid.toString()
                        }
                    }
                );
        } catch (stat) {
            const res = new InternalStatus<InstancePermissionSetResponse, GenericErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
            this.emit("loadInstancePermissionSet", res);
            this.loadingInstancePermissionSetInfo.set(instanceid, false);
            return res;
        }

        switch (response.status) {
            case 200: {
                const res = new InternalStatus<InstancePermissionSetResponse, ErrorCode.OK>({
                    code: StatusCode.OK,
                    payload: response.data as InstancePermissionSetResponse
                });

                this._cachedInstancePermissionSet.set(instanceid, res);
                this.emit("loadInstancePermissionSet", res);
                this.loadingInstancePermissionSetInfo.set(instanceid, false);
                return res;
            }
            default: {
                const res = new InternalStatus<InstancePermissionSetResponse, GenericErrors>({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
                this.emit("loadInstancePermissionSet", res);
                this.loadingInstancePermissionSetInfo.set(instanceid, false);
                return res;
            }
        }
    }
})();
