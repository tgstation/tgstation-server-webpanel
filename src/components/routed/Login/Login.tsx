import { Suspense } from "react";
import { FormattedMessage } from "react-intl";
import { useMutation } from "react-relay";

import LoginMutation from "./graphql/Login";
import OAuthOptions from "./OAuthOptions/OAuthOptions";
import PasswordForm from "./PasswordForm/PasswordForm";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/utils/Loading/Loading";

interface IProps {
    setTemporaryHeader: (headerValue: string) => void;
}

const Login = (props: IProps) => {
    const [commitLogin, isLoginInFlight] = useMutation(LoginMutation);

    const showCard = !isLoginInFlight;

    const LoginCard = () => (
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
                        <PasswordForm onSubmit={() => {}} />
                    </CardContent>
                </Card>
                <Suspense fallback={<Loading />}>
                    <OAuthOptions />
                </Suspense>
            </CardContent>
        </Card>
    );

    return (
        <div className="grid lg:grid-cols-11 md:grid-cols-8">{showCard ? LoginCard() : null}</div>
    );
};

export default Login;
