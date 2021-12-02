import React from "react";

import type {
    InstancePermissionSetResponse,
    InstanceResponse,
    ServerInformationResponse,
    UserResponse
} from "../ApiClient/generatedcode/generated";
import InternalError from "../ApiClient/models/InternalComms/InternalError";

export type InstanceEditContext = {
    deleteError: (error: InternalError) => void;
    errors: Set<InternalError>;
    reloadInstance: () => void;
    instance: InstanceResponse;
    user: UserResponse;
    serverInfo: ServerInformationResponse;
    instancePermissionSet: InstancePermissionSetResponse;
};

//same as InstanceEditContext except used for components which arent loading under instanceedit so we cant guarentee that instance wont be null
export type UnsafeInstanceEditContext = {
    deleteError: (error: InternalError) => void;
    errors: Set<InternalError>;
    reloadInstance: () => void;
    instance: InstanceResponse | null;
    user: UserResponse;
    serverInfo: ServerInformationResponse;
    instancePermissionSet: InstancePermissionSetResponse | null;
};

export const InstanceEditContext = React.createContext<InstanceEditContext>(
    (undefined as unknown) as InstanceEditContext
);
