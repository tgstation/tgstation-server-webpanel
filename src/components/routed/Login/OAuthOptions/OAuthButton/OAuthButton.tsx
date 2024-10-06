import { ReactNode } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { Button } from "@/components/ui/button";

interface IProps {
    children: ReactNode;
    provider: string;
    urlFactory: (state: string) => string;
    backgroundColour?: string;
}

const OAuthButton = (props: IProps) => {
    const startOAuth = () => {
        const stateArray = new Uint8Array(10);
        window.crypto.getRandomValues(stateArray);
        const state = Array.from(stateArray, dec => dec.toString(16).padStart(2, "0")).join("");

        const url = props.urlFactory(state);

        const oauthdata: Record<string, string> = {};
        oauthdata[state] = props.provider;

        window.sessionStorage.setItem("oauth", JSON.stringify(oauthdata));

        window.location.href = url;
    };

    const intl = useIntl();

    const providerName = intl.formatMessage({
        id: `login.oauth.provider.${props.provider.toLowerCase()}`
    });

    return (
        <Button
            style={props.backgroundColour ? { background: props.backgroundColour } : undefined}
            onClick={startOAuth}
            className="text-wrap h-auto w-full">
            {props.children}
            <span className="ml-1">
                <FormattedMessage id="login.oauth" values={{ providerName }} />
            </span>
        </Button>
    );
};

export default OAuthButton;
