import { createContext } from "react";

import IErrorRecord from "./ErrorRecord";

import { ErrorMessageArrayFragment$data } from "@/components/graphql/__generated__/ErrorMessageArrayFragment.graphql";
import { ErrorMessageSingleFragment$data } from "@/components/graphql/__generated__/ErrorMessageSingleFragment.graphql";

export interface IErrorsContext {
    errors: ReadonlyArray<IErrorRecord>;
    addErrors: (
        errors:
            | ErrorMessageArrayFragment$data
            | ReadonlyArray<Error | ErrorMessageSingleFragment$data>
    ) => void;
    removeErrors: (keys?: ReadonlyArray<string>) => void;
}

const ErrorsContext = createContext<IErrorsContext>({
    errors: [],
    addErrors: () => {},
    removeErrors: () => {}
});

export default ErrorsContext;
