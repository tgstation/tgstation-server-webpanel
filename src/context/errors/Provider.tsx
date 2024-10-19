import { ReactNode, useState } from "react";
import { v4 } from "uuid";

import ErrorBoundary from "@/components/utils/ErrorBoundary/ErrorBoundary";
import IErrorRecord from "./ErrorRecord";
import ErrorsContext, { IErrorsContext } from "./ErrorsContext";

interface IProps {
    children: ReactNode;
}

const ErrorsProvider = (props: IProps) => {
    const [errors, setErrors] = useState<ReadonlyArray<IErrorRecord>>([]);

    const errorsContext: IErrorsContext = {
        errors,
        addErrors: newErrors => {
            const newErrorRecords = [...errors];
            newErrors.forEach(error =>
                newErrorRecords.push({
                    key: v4(),
                    error:
                        error instanceof Error
                            ? error
                            : {
                                  ...error,
                                  " $fragmentType": "ErrorMessageSingleFragment"
                              }
                })
            );

            setErrors(newErrorRecords);
        },
        removeErrors: keys => {
            if (!keys) {
                setErrors([]);
                return;
            }

            const newErrorRecords = errors.filter(
                record => !keys.some(keyToRemove => keyToRemove === record.key)
            );
            setErrors(newErrorRecords);
        }
    };

    return (
        <ErrorsContext.Provider value={errorsContext}>
            <ErrorBoundary>{props.children}</ErrorBoundary>
        </ErrorsContext.Provider>
    );
};

export default ErrorsProvider;
