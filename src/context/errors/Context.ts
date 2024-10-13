import { createContext } from "react";

import IErrorRecord from "./ErrorRecord";

import { ErrorMessageFragment$data } from "@/components/graphql/__generated__/ErrorMessageFragment.graphql";

export interface IErrorsContext {
    errors: ReadonlyArray<IErrorRecord>;
    addErrors: (errors: ReadonlyArray<ErrorMessageFragment$data | Error>) => void;
    removeErrors: (keys: ReadonlyArray<string>) => void;
}

const ErrorsContext = createContext<IErrorsContext>({
    errors: [],
    addErrors: () => {},
    removeErrors: () => {}
});

export default ErrorsContext;
