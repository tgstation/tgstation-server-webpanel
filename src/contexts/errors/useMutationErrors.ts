import { useEffect, useState } from "react";
import { useFragment } from "react-relay";
import { PayloadError } from "relay-runtime";

import useErrors from "./useErrors";

import { ErrorMessageArrayFragment$key } from "@/components/graphql/__generated__/ErrorMessageArrayFragment.graphql";
import ErrorMessageArray from "@/components/graphql/ErrorMessageArray";

const useMutationErrors = (): [
    (error: Error) => void,
    (payloadErrors: PayloadError[] | null) => boolean,
    (errors?: ErrorMessageArrayFragment$key | null) => boolean
] => {
    const errors = useErrors();

    const requestErrorHandler = (error: Error) => {
        errors.addErrors([error]);
    };

    const [errorsFragmentRef, setErrorsFragmentRef] = useState<ErrorMessageArrayFragment$key>();

    const errorsData = useFragment(ErrorMessageArray, errorsFragmentRef);
    useEffect(() => {
        if (errorsData) {
            setErrorsFragmentRef(undefined);
            errors.addErrors(errorsData);
        }
    }, [errorsData, errors]);

    const payloadErrorsHandler = (payloadErrors?: PayloadError[] | null) => {
        if (payloadErrors) {
            errors.addErrors(payloadErrors);
            return true;
        }

        return false;
    };

    const mutationErrorsHandler = (mutationErrors?: ErrorMessageArrayFragment$key | null) => {
        if (mutationErrors) {
            setErrorsFragmentRef(mutationErrors);
            return true;
        }

        return false;
    };

    return [requestErrorHandler, payloadErrorsHandler, mutationErrorsHandler];
};

export default useMutationErrors;
