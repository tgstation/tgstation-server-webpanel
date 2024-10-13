import { ReactNode, useState } from "react";
import { v4 } from "uuid";

import ErrorsContext, { IErrorsContext } from "./Context";
import IErrorRecord from "./ErrorRecord";

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
                    error
                })
            );
            setErrors(newErrorRecords);
        },
        removeErrors: keys => {
            const newErrorRecords = errors.filter(
                record => !keys.some(keyToRemove => keyToRemove === record.key)
            );
            setErrors(newErrorRecords);
        }
    };

    return <ErrorsContext.Provider value={errorsContext}>{props.children}</ErrorsContext.Provider>;
};

export default ErrorsProvider;
