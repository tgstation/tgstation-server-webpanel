import { FormattedMessage } from "react-intl";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
    const anyOauth = true;

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
                {anyOauth ? (
                    <>
                        <hr className="my-4" />
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <FormattedMessage id="login.type.oauth" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Card Content</p>
                            </CardContent>
                        </Card>
                    </>
                ) : null}
            </CardContent>
        </Card>
    );
};

export default Login;
