import { ErrorInfo } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import Pkg from "@/../package.json";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface IProps {
    report: boolean;
    error: Error;
    errorInfo?: ErrorInfo;
}

const ErrorCard = (props: IProps) => {
    const intl = useIntl();
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
        : intl.formatMessage(
              {
                  id: "error.withoutstacktrace"
              },
              {
                  version: Pkg.version
              }
          );
    return (
        <Card className="bg-destructive text-destructive-foreground">
            <CardHeader>
                <CardTitle>
                    <FormattedMessage id="error.somethingwentwrong" />
                </CardTitle>
                {props.report ? (
                    <CardDescription>
                        <FormattedMessage id="error.pleasereport" />
                    </CardDescription>
                ) : null}
            </CardHeader>
            <CardContent className="grid gap-2">
                <Alert>
                    <AlertTitle>
                        {props.error.name}: {props.error.message}
                    </AlertTitle>
                    <AlertDescription>
                        <code className="block whitespace-pre-wrap">{formattedError}</code>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
};

export default ErrorCard;
