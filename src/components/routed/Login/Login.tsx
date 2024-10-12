import { Suspense, useCallback, useContext, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useMutation } from "react-relay";

import { ServerLoginMutation } from "./graphql/__generated__/ServerLoginMutation.graphql";
import ServerLogin from "./graphql/ServerLogin";
import OAuthOptions from "./OAuthOptions/OAuthOptions";
import PasswordForm from "./PasswordForm/PasswordForm";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/utils/Loading/Loading";
import SessionContext from "@/context/session/Context";
import { ICredentials, UserPasswordCredentials } from "@/lib/Credentials";

interface IProps {
    setTemporaryCredentials: (credentials: ICredentials) => void;
}

const DefaultCredentials = new UserPasswordCredentials(
    "admin",
    "ISolemlySwearToDeleteTheDataDirectory"
);

const Login = (props: IProps) => {
    const [commitLogin, isLoginInFlight] = useMutation<ServerLoginMutation>(ServerLogin);
    const showCard = !isLoginInFlight;

    const session = useContext(SessionContext);

    const AttemptLogin = useCallback(
        (credentials: ICredentials) => {
            props.setTemporaryCredentials(credentials);
            commitLogin({
                variables: {},
                onCompleted: response => {
                    if (response.login.loginResult) {
                        session.setSession({
                            bearer: response.login.loginResult.bearer,
                            originalCredentials: credentials
                        });
                    } else {
                        // TODO
                    }
                },
                onError: error => {
                    console.log(error);
                }
            });
        },
        [props, commitLogin, session]
    );

    const KeydownEventHandler = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "L" && event.ctrlKey && event.shiftKey) {
                AttemptLogin(DefaultCredentials);
            }
        },
        [AttemptLogin]
    );

    useEffect(() => {
        window.addEventListener("keydown", KeydownEventHandler);
        return () => {
            window.removeEventListener("keydown", KeydownEventHandler);
        };
    }, [KeydownEventHandler]);

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
                        <PasswordForm
                            onSubmit={(username, password) =>
                                AttemptLogin(new UserPasswordCredentials(username, password))
                            }
                        />
                    </CardContent>
                </Card>
                <Suspense fallback={<Loading />}>
                    <OAuthOptions />
                </Suspense>
            </CardContent>
        </Card>
    );

    const AttemptingLoginSpinner = () => (
        <div className="lg:col-start-3 lg:col-end-9 md:col-start-2 md:col-end-8">
            <Loading message="loading.login" />
        </div>
    );

    return (
        <div className="grid lg:grid-cols-11 md:grid-cols-8">
            {showCard ? LoginCard() : AttemptingLoginSpinner()}
        </div>
    );
};

export default Login;
