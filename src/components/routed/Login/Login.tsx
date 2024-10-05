import { Suspense } from "react";
import { FormattedMessage } from "react-intl";

import OAuthOptions from "./OAuthOptions/OAuthOptions";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/utils/Loading/Loading";

interface IProps {
    setTemporaryHeader: (headerValue: string) => void;
}

const Login = (props: IProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <FormattedMessage id="login.title" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <FormattedMessage id="login.type.generic" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Card Content</p>
                    </CardContent>
                </Card>
                <Suspense fallback={<Loading />}>
                    <OAuthOptions />
                </Suspense>
            </CardContent>
        </Card>
    );
};

export default Login;
