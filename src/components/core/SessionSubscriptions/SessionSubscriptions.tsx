import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { useMutation, useSubscription } from "react-relay";
import { GraphQLSubscriptionConfig } from "relay-runtime";

import { ServerLoginMutation } from "@/components/graphql/__generated__/ServerLoginMutation.graphql";
import ServerLogin from "@/components/graphql/ServerLogin";
import useSetCredentials from "@/context/credentials/useSetCredentials";
import useMutationErrors from "@/context/errors/useMutationErrors";
import { CurrentUserUpdateSubscription } from "@/context/session/graphql/__generated__/CurrentUserUpdateSubscription.graphql";
import { SessionInvalidationSubscription } from "@/context/session/graphql/__generated__/SessionInvalidationSubscription.graphql";
import CurrentUserUpdate from "@/context/session/graphql/CurrentUserUpdate";
import SessionInvalidation from "@/context/session/graphql/SessionInvalidation";
import useSession from "@/context/session/useSession";
import { ICredentials } from "@/lib/Credentials";
import { useToast } from "@/lib/shadcn/hooks/use-toast";
import sleep from "@/lib/sleep";

interface IProps {
    blockRequests: (promise: Promise<unknown>) => void;
}

const SessionSubscriptions = (props: IProps) => {
    const intl = useIntl();
    const { toast } = useToast();
    const setCredentialsContext = useSetCredentials();
    const sessionContext = useSession();
    const [commitLogin] = useMutation<ServerLoginMutation>(ServerLogin);
    const [requestErrorHandler, payloadErrorsHandler] = useMutationErrors();

    const tryToRestablishSession = useCallback(
        async (delaySeconds: number, toastMessageId: string, originalCredentials: ICredentials) => {
            const title = intl.formatMessage({ id: toastMessageId });
            const description = intl.formatMessage({ id: `${toastMessageId}.desc` });
            const { id, update } = toast({
                title,
                description,
                variant: "warning",
                duration: (delaySeconds + 5) * 1000
            });

            const failUpdate = () => {
                sessionContext.setSession(null);
                update({
                    id,
                    duration: 5000,
                    variant: "destructive",
                    title: intl.formatMessage({ id: "toast.reauthfail" }),
                    description: intl.formatMessage({ id: "toast.reauthfail.desc" })
                });
            };

            props.blockRequests(
                new Promise<void>(resolve => {
                    void (async () => {
                        await sleep(delaySeconds * 1000);
                        setCredentialsContext.setCredentials(originalCredentials, true);
                        commitLogin({
                            variables: {},
                            onCompleted: response => {
                                if (response.login.loginResult) {
                                    sessionContext.setSession({
                                        bearer: response.login.loginResult.bearer,
                                        userID: response.login.loginResult.user.id,
                                        originalCredentials
                                    });

                                    update({
                                        id,
                                        duration: 5000,
                                        variant: "default",
                                        title: intl.formatMessage({ id: "toast.reauthsuccess" }),
                                        description: intl.formatMessage({
                                            id: "toast.reauthsuccess.desc"
                                        })
                                    });
                                }

                                if (payloadErrorsHandler(response.login.errors)) {
                                    failUpdate();
                                }

                                resolve();
                            },
                            onError: error => {
                                requestErrorHandler(error);
                                failUpdate();
                                resolve();
                            },
                            onUnsubscribe: resolve // HOW!!!!
                        });
                    })();
                })
            );
        },
        [
            intl,
            toast,
            setCredentialsContext,
            props,
            commitLogin,
            payloadErrorsHandler,
            sessionContext,
            requestErrorHandler
        ]
    );

    const currentUserUpdateConfig = useMemo(
        () => ({
            subscription: CurrentUserUpdate,
            variables: {}
        }),
        []
    );

    const sessionInvalidationConfig = useMemo(
        (): GraphQLSubscriptionConfig<SessionInvalidationSubscription> => ({
            subscription: SessionInvalidation,
            variables: {},
            onNext: response => {
                if (response && sessionContext.currentSession) {
                    switch (response.sessionInvalidated) {
                        case "SERVER_SHUTDOWN":
                            void tryToRestablishSession(
                                30,
                                "toast.serverrestart",
                                sessionContext.currentSession.originalCredentials
                            );
                            break;
                        case "TOKEN_EXPIRED":
                            void tryToRestablishSession(
                                0,
                                "toast.tokenexpired",
                                sessionContext.currentSession.originalCredentials
                            );
                            break;
                        case "USER_UPDATED":
                            sessionContext.setSession(null);
                            toast({
                                title: intl.formatMessage({ id: "toast.usermodified" }),
                                description: intl.formatMessage({ id: "toast.usermodified.desc" }),
                                variant: "warning"
                            });
                            break;
                    }
                }
            }
        }),
        [intl, sessionContext, toast, tryToRestablishSession]
    );

    useSubscription<SessionInvalidationSubscription>(sessionInvalidationConfig);
    useSubscription<CurrentUserUpdateSubscription>(currentUserUpdateConfig);

    return <></>;
};

export default SessionSubscriptions;
