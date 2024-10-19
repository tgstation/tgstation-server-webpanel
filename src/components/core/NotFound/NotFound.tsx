import Pkg from "@/../package.json";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormattedMessage } from "react-intl";

const NotFound = () => (
    <Card className="bg-transparent text-transparent-foreground mb-4">
        <CardHeader>
            <CardTitle>
                <FormattedMessage id="error.somethingwentwrong" />
            </CardTitle>
            <CardDescription>
                <FormattedMessage id="error.notfound" />
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="bg-transparent text-danger">
                <code className="block whitespace-pre-wrap">
                    {`Webpanel Version: ${Pkg.version}\nWebpanel Mode: ${
                        import.meta.env.VITE_DEV_MODE ? "DEV" : "PROD"
                    }\nCurrent route: ${window.location.toString()}`}
                </code>
            </div>
        </CardContent>
    </Card>
);

export default NotFound;
