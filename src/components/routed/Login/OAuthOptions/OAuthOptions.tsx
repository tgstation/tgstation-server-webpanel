import { faDiscord, faGithub, faInvision } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormattedMessage } from "react-intl";
import { useLazyLoadQuery } from "react-relay";

import { GetOAuthProvidersQuery } from "./graphql/__generated__/GetOAuthProvidersQuery.graphql";
import GetOAuthProviders from "./graphql/GetOAuthProviders";
import OAuthButton from "./OAuthButton/OAuthButton";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KeycloakLogo from "@/images/keycloak_icon_64px.png";
import TGLogo from "@/images/tglogo-white.svg";

const OAuthOptions = () => {
    const query = useLazyLoadQuery<GetOAuthProvidersQuery>(GetOAuthProviders, {});
    const data = query.swarm.currentNode.gateway.information.oAuthProviderInfos;

    const discord = data.discord;
    const github = data.gitHub;
    const invision = data.invisionCommunity;
    const keycloak = data.keycloak;
    const tgForums = data.tgForums;

    if (!(discord || github || invision || keycloak || tgForums)) {
        return null;
    }

    const e = encodeURIComponent;
    return (
        <>
            <hr className="my-4" />
            <Card>
                <CardHeader>
                    <CardTitle>
                        <FormattedMessage id="login.type.oauth" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                    {discord ? (
                        <OAuthButton
                            provider="discord"
                            backgroundColour="#7289da"
                            urlFactory={state =>
                                `https://discord.com/api/oauth2/authorize?response_type=code&client_id=${e(
                                    discord.clientID
                                )}&scope=identify&state=${e(state)}`
                            }>
                            <FontAwesomeIcon icon={faDiscord} style={{ width: "1.2em" }} />
                        </OAuthButton>
                    ) : null}
                    {github ? (
                        <OAuthButton
                            provider="github"
                            backgroundColour="#464b52"
                            urlFactory={state =>
                                `https://github.com/login/oauth/authorize?client_id=${e(
                                    github.clientID
                                )}&redirect_uri=${e(github.redirectUri)}&state=${e(
                                    state
                                )}&allow_signup=false`
                            }>
                            <FontAwesomeIcon icon={faGithub} style={{ width: "1.2em" }} />
                        </OAuthButton>
                    ) : null}
                    {tgForums ? (
                        <OAuthButton
                            provider="tgForums"
                            urlFactory={state =>
                                `https://tgstation13.org/phpBB/app.php/tgapi/oauth/auth?scope=user&client_id=${e(
                                    tgForums.clientID
                                )}&state=${e(state)}&redirect_uri=${e(tgForums.redirectUri)}`
                            }>
                            <img src={TGLogo} alt="tglogo" style={{ width: "1.2em" }} />
                        </OAuthButton>
                    ) : null}
                    {invision ? (
                        <OAuthButton
                            provider="invision"
                            urlFactory={state =>
                                `${
                                    invision.serverUrl
                                }/oauth/authorize/?response_type=code&client_id=${e(
                                    invision.clientID
                                )}&scope=profile&state=${e(state)}&redirect_uri=${e(
                                    invision.redirectUri
                                )}`
                            }>
                            <FontAwesomeIcon icon={faInvision} style={{ width: "1.2em" }} />
                        </OAuthButton>
                    ) : null}
                    {keycloak ? (
                        <OAuthButton
                            provider="keycloak"
                            urlFactory={state =>
                                `${
                                    keycloak.serverUrl
                                }/protocol/openid-connect/auth?response_type=code&client_id=${e(
                                    keycloak.clientID
                                )}&scope=openid&state=${e(state)}&redirect_uri=${e(
                                    keycloak.redirectUri
                                )}`
                            }>
                            <img src={KeycloakLogo} alt="keycloaklogo" style={{ width: "1.2em" }} />
                        </OAuthButton>
                    ) : null}
                </CardContent>
            </Card>
        </>
    );
};

export default OAuthOptions;
