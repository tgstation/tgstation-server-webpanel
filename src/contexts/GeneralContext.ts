import React from "react";

import { Components } from "../ApiClient/generatedcode/_generated";
import InternalError from "../ApiClient/models/InternalComms/InternalError";

export type GeneralContext = {
    deleteError: (error: InternalError) => void;
    errors: Set<InternalError>;
    user: Components.Schemas.UserResponse;
    serverInfo: Components.Schemas.ServerInformationResponse;
};

export const GeneralContext = React.createContext<GeneralContext>(
    (undefined as unknown) as GeneralContext
);
