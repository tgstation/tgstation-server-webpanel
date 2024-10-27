import { Suspense, useCallback, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useMutation } from "react-relay";
import { Location, Navigate, useLocation } from "react-router-dom";

import ServerLogin from "../../graphql/ServerLogin";

import ILocationState from "./LocationState";
import OAuthOptions from "./OAuthOptions/OAuthOptions";
import PasswordForm from "./PasswordForm/PasswordForm";

import { ServerLoginMutation } from "@/components/graphql/__generated__/ServerLoginMutation.graphql";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/utils/Loading/Loading";
import useSetCredentials from "@/contexts/credentials/useSetCredentials";
import useMutationErrors from "@/contexts/errors/useMutationErrors";
import useSession from "@/contexts/session/useSession";
import {
    DefaultUserPasswordCredentials,
    ICredentials,
    UserPasswordCredentials
} from "@/lib/Credentials";

const Login = () => {
    const session = useSession();
    const location = useLocation() as Location<ILocationState>;
    const setCredentialsContext = useSetCredentials();

    const [commitLogin, isLoginInFlight] = useMutation<ServerLoginMutation>(ServerLogin);
    const [requestErrorHandler, payloadErrorsHandler, mutationErrorsHandler] = useMutationErrors();

    const showCard = !isLoginInFlight;

    const AttemptLogin = useCallback(
        (credentials: ICredentials) => {
            setCredentialsContext.setCredentials(credentials, true);
            commitLogin({
                variables: {},
                onCompleted: (response, errors) => {
                    if (response.login.loginResult) {
                        session.setSession({
                            bearer: response.login.loginResult.bearer,
                            userID: response.login.loginResult.user.id,
                            originalCredentials: credentials
                        });
                    }

                    payloadErrorsHandler(errors);
                    mutationErrorsHandler(response.login.errors);
                },
                onError: requestErrorHandler
            });
        },
        [
            commitLogin,
            session,
            requestErrorHandler,
            payloadErrorsHandler,
            setCredentialsContext,
            mutationErrorsHandler
        ]
    );

    const KeydownEventHandler = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "L" && event.ctrlKey && event.shiftKey) {
                AttemptLogin(new DefaultUserPasswordCredentials());
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
        <Card className="lg:col-start-4 lg:col-end-9 md:col-start-2 md:col-end-8">
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
                <Suspense>
                    <OAuthOptions />
                </Suspense>
            </CardContent>
        </Card>
    );

    // Can happen if we login with no history
    if (session.currentSession) {
        return <Navigate to={location.state?.from ?? "/home"} replace />;
    }

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
