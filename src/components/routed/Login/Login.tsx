import { Suspense } from "react";
import { FormattedMessage } from "react-intl";

import OAuthOptions from "./OAuthOptions/OAuthOptions";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/utils/Loading/Loading";

import "./Login.css";

interface IProps {
    setTemporaryHeader: (headerValue: string) => void;
}

const Login = (props: IProps) => {
    return (
        <div className="grid lg:grid-cols-11 md:grid-cols-8">
            <Card className="lg:col-start-4 lg:col-end-8 md:col-start-2 md:col-end-8">
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
        </div>
    );
};

export default Login;
