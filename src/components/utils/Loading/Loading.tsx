import { Loader2 } from "lucide-react";
import { FormattedMessage } from "react-intl";

interface IProps {
    message?: string;
    noIntl?: boolean;
}

const Loading = function (props: IProps) {
    return (
        <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-1/2 h-1/2 animate-spin text-primary" />
            {props.message ? (
                <p className="text-sm font-medium text-muted-foreground">
                    {props.noIntl ? (
                        props.message
                    ) : (
                        <FormattedMessage id={props.message} />
                    )}
                </p>
            ) : null}
        </div>
    );
};

export default Loading;
