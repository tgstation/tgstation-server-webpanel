import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { PreloadedQuery, useMutation, usePreloadedQuery } from "react-relay";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { ChangePasswordPreflightQuery } from "./graphql/__generated__/ChangePasswordPreflightQuery.graphql";
import { ExecuteChangePasswordMutation } from "./graphql/__generated__/ExecuteChangePasswordMutation.graphql";
import ChangePasswordPreflight from "./graphql/ChangePasswordPreflight";
import ExecuteChangePassword from "./graphql/ExecuteChangePassword";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Loading from "@/components/utils/Loading/Loading";
import useMutationErrors from "@/context/errors/useMutationErrors";
import nameof from "@/lib/nameof";

interface IProps {
    queryRef: PreloadedQuery<ChangePasswordPreflightQuery>;
    submitCallback?: (newPassword: string) => void;
}

const ChangePassword = (props: IProps) => {
    const data = usePreloadedQuery<ChangePasswordPreflightQuery>(
        ChangePasswordPreflight,
        props.queryRef
    );

    const intl = useIntl();

    const minimumPasswordLength = data.swarm.currentNode.gateway.information.minimumPasswordLength;
    const canonicalName = data.swarm.users.current.canonicalName;

    const nameMatchRegex = new RegExp(`^((?!${canonicalName}).)*$`, "i");

    const passwordSchema = z
        .object({
            password: z
                .string()
                .min(
                    minimumPasswordLength,
                    intl.formatMessage(
                        { id: "changepassword.form.password.invalid.too_short" },
                        { minimumPasswordLength }
                    )
                )
                .regex(
                    nameMatchRegex,
                    intl.formatMessage({ id: "changepassword.form.password.invalid.matches_user" })
                ),
            passwordConfirm: z.string()
        })
        .superRefine((fields, context) => {
            if (fields.password !== fields.passwordConfirm) {
                const message = intl.formatMessage({
                    id: "changepassword.form.passwordConfirm.invalid.mismatch"
                });

                context.addIssue({
                    code: "custom",
                    path: [nameof<typeof fields>("passwordConfirm")],
                    message
                });
            }
        });

    const form = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            password: "",
            passwordConfirm: ""
        }
    });

    const [commitPasswordChange, isPasswordChangeInFlight] =
        useMutation<ExecuteChangePasswordMutation>(ExecuteChangePassword);
    const [requestErrorHandler, payloadErrorsHandler] = useMutationErrors();

    const navigate = useNavigate();

    const onSubmit = (result: z.infer<typeof passwordSchema>) => {
        if (props.submitCallback) {
            props.submitCallback(result.password);
        }

        commitPasswordChange({
            variables: {
                newPassword: result.password
            },
            onCompleted: response => {
                if (!payloadErrorsHandler(response.setCurrentUserPassword.errors)) {
                    navigate(-1);
                }
            },
            onError: requestErrorHandler
        });
    };

    const passwordPlaceholder = intl.formatMessage({
        id: "changepassword.form.password.placeholder"
    });
    const confirmPlaceholder = intl.formatMessage({
        id: "changepassword.form.passwordConfirm.placeholder"
    });

    if (isPasswordChangeInFlight) {
        return (
            <div className="lg:col-start-3 lg:col-end-9 md:col-start-2 md:col-end-8">
                <Loading message="changepassword.executing" />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="mt-1">
                            <FormLabel>
                                <FormattedMessage id="changepassword.form.password" />
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder={passwordPlaceholder}
                                    data-testid="changePassword-password"
                                    type="password"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="passwordConfirm"
                    render={({ field }) => (
                        <FormItem className="mt-1">
                            <FormLabel>
                                <FormattedMessage id="changepassword.form.passwordConfirm" />
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder={confirmPlaceholder}
                                    data-testid="changePassword-passwordConfirm"
                                    type="password"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button className="w-full mt-4" type="submit" data-testid="changePassword-submit">
                    <FormattedMessage id="changepassword.form.submit" />
                </Button>
            </form>
        </Form>
    );
};

export default ChangePassword;
