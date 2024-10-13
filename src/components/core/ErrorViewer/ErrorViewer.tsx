import { useContext } from "react";

import ErrorCard from "@/components/utils/ErrorCard/ErrorCard";
import ErrorsContext from "@/context/errors/Context";

const ErrorViewer = () => {
    const context = useContext(ErrorsContext);

    return (
        <>
            {context.errors.map(record => (
                <ErrorCard
                    key={record.key}
                    error={record.error}
                    onClose={() => context.removeErrors([record.key])}
                />
            ))}
        </>
    );
};

export default ErrorViewer;
