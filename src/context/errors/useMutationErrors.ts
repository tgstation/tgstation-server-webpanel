import { useContext, useEffect, useState } from "react";
import { useFragment } from "react-relay";

import ErrorsContext from "./Context";

import { ErrorMessageArrayFragment$key } from "@/components/graphql/__generated__/ErrorMessageArrayFragment.graphql";
import ErrorMessageArray from "@/components/graphql/ErrorMessageArray";

const useMutationErrors = (): [
    (error: Error) => void,
    (errors?: ErrorMessageArrayFragment$key | null) => void
] => {
    const errors = useContext(ErrorsContext);

    const requestErrorHandler = (error: Error) => {
        errors.addErrors([error]);
    };

    const [errorsFragmentRef, setErrorsFragmentRef] = useState<ErrorMessageArrayFragment$key>();

    const errorsData = useFragment(ErrorMessageArray, errorsFragmentRef);
    useEffect(() => {
        if (errorsData) {
            setErrorsFragmentRef(undefined);
            errors.removeErrors();
            errors.addErrors(errorsData);
        }
    }, [errorsData, errors]);

    const payloadErrorsHandler = (errors?: ErrorMessageArrayFragment$key | null) => {
        if (errors) {
            setErrorsFragmentRef(errors);
        }
    };

    return [requestErrorHandler, payloadErrorsHandler];
};

export default useMutationErrors;
