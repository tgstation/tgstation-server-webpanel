import React from "react";

import { Components } from "../ApiClient/generatedcode/_generated";
import InternalError from "../ApiClient/models/InternalComms/InternalError";

export type UserContext = {
    reloadUser: () => Promise<void>;
    deleteError: (error: InternalError) => void;
    errors: Set<InternalError>;
} & (
    | {
          user: Components.Schemas.UserResponse;
          loading: boolean;
      }
    | {
          user: null;
          loading: true;
      }
);

export const UserContext = React.createContext<UserContext>((undefined as unknown) as UserContext);
