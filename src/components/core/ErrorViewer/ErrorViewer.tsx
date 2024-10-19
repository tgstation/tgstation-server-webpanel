import ErrorCard from "@/components/utils/ErrorCard/ErrorCard";
import useErrors from "@/context/errors/useErrors";

const ErrorViewer = () => {
    const context = useErrors();

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
