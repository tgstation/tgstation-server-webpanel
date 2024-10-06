import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { z } from "zod";

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

interface IProps {
    onSubmit: (username: string, password: string) => void;
}

const PasswordForm = (props: IProps) => {
    const intl = useIntl();

    const passwordSchema = z.object({
        username: z
            .string()
            .min(1, intl.formatMessage({ id: "login.form.username.invalid.empty" }))
            .regex(/^[^:]*$/, intl.formatMessage({ id: "login.form.username.invalid.colon" })),
        password: z.string()
    });

    const form = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            username: "",
            password: ""
        }
    });

    const onSubmit = (result: z.infer<typeof passwordSchema>) =>
        props.onSubmit(result.username, result.password);

    const usernamePlaceholder = intl.formatMessage({ id: "login.form.username.placeholder" });
    const passwordPlaceholder = intl.formatMessage({ id: "login.form.password.placeholder" });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                <FormattedMessage id="login.form.username" />
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder={usernamePlaceholder}
                                    data-testid="login-username"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="mt-1">
                            <FormLabel>
                                <FormattedMessage id="login.form.password" />
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder={passwordPlaceholder}
                                    data-testid="login-password"
                                    type="password"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button className="w-full mt-4" type="submit" data-testid="login-submit">
                    <FormattedMessage id="login.form.submit" />
                </Button>
            </form>
        </Form>
    );
};

export default PasswordForm;
