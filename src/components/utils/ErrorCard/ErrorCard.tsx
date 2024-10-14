import { X } from "lucide-react";
import { ErrorInfo } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import Pkg from "@/../package.json";
import { ErrorMessageSingleFragment$data } from "@/components/graphql/__generated__/ErrorMessageSingleFragment.graphql";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface IProps {
    report?: boolean;
    error: Error | ErrorMessageSingleFragment$data;
    errorInfo?: ErrorInfo;
    onClose?: () => void;
}

const ErrorCard = (props: IProps) => {
    const intl = useIntl();
    const isErrorMessage = !!props.error.message && !(props.error instanceof Error);
    const jsError = props.error as Error;
    const tgsError = props.error as ErrorMessageSingleFragment$data;

    const formattedError = props.errorInfo
        ? intl.formatMessage(
              {
                  id: "error.withstacktrace"
              },
              {
                  version: Pkg.version,
                  stackTrace: props.errorInfo?.componentStack
              }
          )
        : isErrorMessage
        ? tgsError.additionalData || null
        : intl.formatMessage(
              {
                  id: "error.withoutstacktrace"
              },
              {
                  version: Pkg.version
              }
          );

    const titleMessage = (
        <div className="text-lg">
            {isErrorMessage ? tgsError.message : <FormattedMessage id="error.somethingwentwrong" />}
        </div>
    );

    return (
        <Card className="bg-destructive text-destructive-foreground mb-4">
            <CardHeader>
                <CardTitle>
                    {props.onClose ? (
                        <div className="flex justify-between">
                            {titleMessage}
                            <Button
                                onClick={props.onClose}
                                variant="ghost"
                                size="icon"
                                data-testid="errorcard-close">
                                <X />
                            </Button>
                        </div>
                    ) : (
                        titleMessage
                    )}
                </CardTitle>
                {props.report ? (
                    <CardDescription>
                        <FormattedMessage id="error.pleasereport" />
                    </CardDescription>
                ) : null}
            </CardHeader>
            {formattedError ? (
                <CardContent className="grid gap-2">
                    <Alert>
                        {!isErrorMessage ? (
                            <AlertTitle>
                                {jsError.name}: {jsError.message}
                            </AlertTitle>
                        ) : null}
                        <AlertDescription>
                            <code className="block whitespace-pre-wrap">{formattedError}</code>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            ) : null}
        </Card>
    );
};

export default ErrorCard;
