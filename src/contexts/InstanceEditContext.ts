import React from "react";

import { Components } from "../ApiClient/generatedcode/_generated";
import InternalError from "../ApiClient/models/InternalComms/InternalError";

export type InstanceEditContext = {
    deleteError: (error: InternalError) => void;
    errors: Set<InternalError>;
    reloadInstance: () => void;
    instance: Components.Schemas.InstanceResponse;
    user: Components.Schemas.UserResponse;
    serverInfo: Components.Schemas.ServerInformationResponse;
};

//same as InstanceEditContext except used for components which arent loading under instanceedit so we cant guarentee that instance wont be null
export type UnsafeInstanceEditContext = {
    deleteError: (error: InternalError) => void;
    errors: Set<InternalError>;
    reloadInstance: () => void;
    instance: Components.Schemas.InstanceResponse | null;
    user: Components.Schemas.UserResponse;
    serverInfo: Components.Schemas.ServerInformationResponse;
};

export const InstanceEditContext = React.createContext<InstanceEditContext>(
    (undefined as unknown) as InstanceEditContext
);
