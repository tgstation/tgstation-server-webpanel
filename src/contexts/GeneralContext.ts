import React from "react";

import type { ServerInformationResponse, UserResponse } from "../ApiClient/generatedcode/generated";
import InternalError from "../ApiClient/models/InternalComms/InternalError";

export type GeneralContext = {
    deleteError: (error: InternalError) => void;
    errors: Set<InternalError>;
    user: UserResponse;
    serverInfo: ServerInformationResponse;
};

//same as GeneralContext except used for components which arent loading under the router so we cant guarentee that serverInfo and user wont be null
export type UnsafeGeneralContext = {
    deleteError: (error: InternalError) => void;
    errors: Set<InternalError>;
    user: UserResponse | null;
    serverInfo: ServerInformationResponse | null;
};

export const GeneralContext = React.createContext<GeneralContext>(
    undefined as unknown as GeneralContext
);
