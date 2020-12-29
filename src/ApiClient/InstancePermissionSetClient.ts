import { TypedEmitter } from "tiny-typed-emitter";

import { Components } from "./generatedcode/_generated";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";

interface IEvents {
    loadInstancePermissionSet: (
        user: InternalStatus<Components.Schemas.InstancePermissionSet, GenericErrors>
    ) => void;
}

export type getCurrentInstancePermissionSetErrors = GenericErrors;

export default new (class InstancePermissionSetClient extends TypedEmitter<IEvents> {
    private _cachedInstancePermissionSet: Map<
        number,
        InternalStatus<Components.Schemas.InstancePermissionSet, ErrorCode.OK>
    > = new Map<number, InternalStatus<Components.Schemas.InstancePermissionSet, ErrorCode.OK>>();

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
        InternalStatus<
            Components.Schemas.InstancePermissionSet,
            getCurrentInstancePermissionSetErrors
        >
    > {
        await ServerClient.wait4Init();

        if (this._cachedInstancePermissionSet.has(instanceid)) {
            return this._cachedInstancePermissionSet.get(instanceid)!;
        }

        if (this.loadingInstancePermissionSetInfo.get(instanceid)) {
            return await new Promise(resolve => {
                const resolver = (
                    user: InternalStatus<Components.Schemas.InstancePermissionSet, GenericErrors>
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
            response = await ServerClient.apiClient!.InstancePermissionSetController_Read({
                Instance: instanceid
            });
        } catch (stat) {
            const res = new InternalStatus<Components.Schemas.InstancePermissionSet, GenericErrors>(
                {
                    code: StatusCode.ERROR,
                    error: stat as InternalError<GenericErrors>
                }
            );
            this.emit("loadInstancePermissionSet", res);
            this.loadingInstancePermissionSetInfo.set(instanceid, false);
            return res;
        }

        switch (response.status) {
            case 200: {
                const res = new InternalStatus<
                    Components.Schemas.InstancePermissionSet,
                    ErrorCode.OK
                >({
                    code: StatusCode.OK,
                    payload: response.data as Components.Schemas.InstancePermissionSet
                });

                this._cachedInstancePermissionSet.set(instanceid, res);
                this.emit("loadInstancePermissionSet", res);
                this.loadingInstancePermissionSetInfo.set(instanceid, false);
                return res;
            }
            default: {
                const res = new InternalStatus<
                    Components.Schemas.InstancePermissionSet,
                    GenericErrors
                >({
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
