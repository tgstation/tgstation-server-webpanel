import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faComment, faHashtag, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FormattedMessage, injectIntl, WrappedComponentProps } from "react-intl";

import ChatBotClient from "../../../../ApiClient/ChatBotClient";
import {
    ChatBotResponse,
    ChatBotRights,
    ChatChannel,
    ChatProvider
} from "../../../../ApiClient/generatedcode/generated";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../../ApiClient/models/InternalComms/InternalStatus";
import { InstanceEditContext } from "../../../../contexts/InstanceEditContext";
import { hasChatBotRight } from "../../../../utils/misc";
import ErrorAlert from "../../../utils/ErrorAlert";
import GenericAlert from "../../../utils/GenericAlert";
import InputField, { FieldType } from "../../../utils/InputField";
import InputForm, { InputFormField } from "../../../utils/InputForm";
import { DebugJsonViewer } from "../../../utils/JsonViewer";
import Loading from "../../../utils/Loading";

enum DiscordDMOutputDisplayType {
    Always = 0,
    OnError = 1,
    Never = 2
}

enum IrcPasswordType {
    Server = 0,
    SASL = 1,
    NickServ = 2
}

interface ChatBotConnectionBuilder {
    provider: ChatProvider;
    name: string;
    enabled: boolean;
    channelLimit: number;
    reconnectionInterval: number;
}

interface ChatBotUpdate extends ChatBotConnectionBuilder {
    connectionString: string;
}

interface DiscordConnectionBuilder extends ChatBotConnectionBuilder {
    botToken: string;
    basedMeme: boolean;
    deploymentBranding: boolean;
    dmOutputDisplay: DiscordDMOutputDisplayType;
}

interface IrcConnectionBuilder extends ChatBotConnectionBuilder {
    name: string;
    address: string;
    port: number;
    nickname: string;
    useSsl: boolean;
    passwordType: IrcPasswordType;
    password?: string;
}

interface ChatBot extends ChatBotResponse {
    loadedWithConnectionString?: boolean;
}

interface IProps extends WrappedComponentProps {}

interface IState {
    loading: boolean;
    errors: Array<InternalError<ErrorCode> | undefined>;
    chatBots: ChatBot[];
    selectedAddNode: boolean;
    selectedChatBot: ChatBot | null;
    selectedChannel: ChatChannel | null;
    addBotProvider: ChatProvider;
}

class ChatBots extends React.Component<IProps, IState> {
    public declare context: InstanceEditContext;

    public constructor(props: IProps) {
        super(props);

        this.state = {
            loading: true,
            errors: [],
            chatBots: [],
            selectedAddNode: false,
            selectedChatBot: null,
            selectedChannel: null,
            addBotProvider: ChatProvider.Discord
        };

        this.renderChatBotBrowser = this.renderChatBotBrowser.bind(this);
    }

    public async componentDidMount(): Promise<void> {
        if (hasChatBotRight(this.context.instancePermissionSet, ChatBotRights.Read))
            await this.refresh();
        else
            this.setState({
                loading: false
            });
    }

    private addError(error: InternalError<ErrorCode>): void {
        this.setState(prevState => {
            const errors = Array.from(prevState.errors);
            errors.push(error);
            return {
                errors
            };
        });
    }

    private async refresh(): Promise<void> {
        if (hasChatBotRight(this.context.instancePermissionSet, ChatBotRights.Read)) {
            this.setState({
                loading: true
            });

            let maxPages = 1;
            let chatBots: ChatBot[] = [];
            for (let page = 1; page <= maxPages; ++page) {
                const response = await ChatBotClient.listChatBots(this.context.instance.id, {
                    page
                });

                if (response.code === StatusCode.OK) {
                    maxPages = response.payload.totalPages;

                    chatBots = chatBots.concat(response.payload.content);
                } else {
                    this.addError(response.error);
                    break;
                }
            }

            // List endpoint does not pull connection string
            chatBots.forEach(chatBot => (chatBot.loadedWithConnectionString = false));

            this.setState({
                chatBots,
                loading: false
            });
        }
    }

    private async addChatBot(connectionBuilder: ChatBotConnectionBuilder): Promise<void> {
        let connectionString: string;
        let discordBuilder: DiscordConnectionBuilder;
        let ircBuilder: IrcConnectionBuilder;

        if (!connectionBuilder.name) {
            alert(
                this.props.intl.formatMessage({
                    id: "view.instance.chat.create.missing.name"
                })
            );
            return;
        }

        switch (connectionBuilder.provider) {
            case ChatProvider.Discord:
                discordBuilder = connectionBuilder as DiscordConnectionBuilder;
                if (!discordBuilder.botToken) {
                    alert(
                        this.props.intl.formatMessage({
                            id: "view.instance.chat.create.missing.token"
                        })
                    );
                    return;
                }

                connectionString = `${discordBuilder.botToken};${discordBuilder.dmOutputDisplay};${
                    discordBuilder.basedMeme ? "1" : "0"
                };${discordBuilder.deploymentBranding ? "1" : "0"}`;
                break;
            case ChatProvider.Irc:
                ircBuilder = connectionBuilder as IrcConnectionBuilder;
                if (!ircBuilder.address) {
                    alert(
                        this.props.intl.formatMessage({
                            id: "view.instance.chat.create.missing.address"
                        })
                    );
                    return;
                }
                if (!ircBuilder.nickname) {
                    alert(
                        this.props.intl.formatMessage({
                            id: "view.instance.chat.create.missing.nick"
                        })
                    );
                    return;
                }

                connectionString = `${ircBuilder.address};${ircBuilder.port};${
                    ircBuilder.nickname
                };${ircBuilder.useSsl ? "1" : "0"}`;
                if (ircBuilder.password)
                    connectionString += `;${ircBuilder.passwordType};${ircBuilder.password}`;
                break;
            default:
                throw new Error("Bad provider!");
        }

        this.setState({
            loading: true
        });

        const response = await ChatBotClient.createChatBot(this.context.instance.id, {
            provider: connectionBuilder.provider,
            name: connectionBuilder.name,
            enabled: connectionBuilder.enabled,
            connectionString,
            channelLimit: connectionBuilder.channelLimit,
            reconnectionInterval: connectionBuilder.reconnectionInterval
        });

        if (response.code === StatusCode.OK) {
            const newChatBot: ChatBot = response.payload;
            newChatBot.loadedWithConnectionString = true;
            const newChatBots = [...this.state.chatBots];
            newChatBots.push(newChatBot);
            this.setState({
                chatBots: newChatBots,
                selectedChatBot: newChatBot,
                selectedAddNode: false
            });
        } else {
            this.addError(response.error);
        }

        this.setState({
            loading: false
        });
    }

    private async reloadChatBot(chatBot: ChatBot): Promise<void> {
        this.setState({
            loading: true
        });

        const response = await ChatBotClient.getChatBot(this.context.instance.id, chatBot.id);
        if (response.code === StatusCode.OK) {
            chatBot = response.payload;
            chatBot.loadedWithConnectionString = true;

            const chatBots = [...this.state.chatBots];
            const index = chatBots.indexOf(chatBot);
            chatBots[index] = chatBot;

            this.setState({
                chatBots,
                selectedChatBot: chatBot
            });
        } else {
            this.addError(response.error);
        }

        this.setState({
            loading: false
        });
    }

    private async editChatBot(chatBotUpdate: ChatBotUpdate): Promise<void> {
        this.setState({
            loading: true
        });

        let chatBot = this.state.selectedChatBot!;

        const response = await ChatBotClient.updateChatBot(this.context.instance.id, {
            ...chatBotUpdate,
            id: chatBot.id
        });

        if (response.code === StatusCode.OK) {
            if (response.payload) {
                const chatBots = [...this.state.chatBots];
                const index = chatBots.indexOf(chatBot);

                chatBot = response.payload;
                chatBot.loadedWithConnectionString = true;

                chatBots[index] = chatBot;

                this.setState({
                    chatBots,
                    selectedChatBot: chatBot
                });
            }
        } else {
            this.addError(response.error);
        }

        this.setState({
            loading: false
        });
    }

    private async addChatChannel(chatBot: ChatBot, chatChannel: ChatChannel): Promise<void> {
        if (!chatChannel.ircChannel) {
            alert(
                this.props.intl.formatMessage({ id: "view.instance.chat.create.missing.channel" })
            );
            return;
        }

        // Uint64 hack
        if (chatBot.provider === ChatProvider.Discord) {
            const reg = new RegExp("^[0-9]+$");
            if (!reg.test(chatChannel.ircChannel)) {
                alert(
                    this.props.intl.formatMessage({
                        id: "view.instance.chat.create.invalid.discord"
                    })
                );
                return;
            }
            ((chatChannel.discordChannelId as unknown) as string) = chatChannel.ircChannel;
            chatChannel.ircChannel = null;
        }

        this.setState({
            loading: true
        });

        const newChannels = [...(chatBot.channels ?? [])];
        newChannels.push(chatChannel);

        const response = await ChatBotClient.updateChatBot(this.context.instance.id, {
            channels: newChannels,
            id: chatBot.id
        });

        if (response.code === StatusCode.OK) {
            if (response.payload) {
                const chatBots = [...this.state.chatBots];
                const index = chatBots.indexOf(chatBot);

                chatBot = response.payload;
                chatBot.loadedWithConnectionString = true;

                chatBots[index] = chatBot;

                this.setState({
                    chatBots,
                    selectedChatBot: chatBot,
                    selectedChannel: chatBot.channels[chatBot.channels.length - 1]
                });
            }
        } else {
            this.addError(response.error);
        }

        this.setState({
            loading: false
        });
    }

    private async editChatChannel(chatBot: ChatBot, chatChannel: ChatChannel): Promise<void> {
        this.setState({
            loading: true
        });

        const newChannels = [...(chatBot.channels ?? [])];
        const channelToEdit = newChannels[newChannels.indexOf(this.state.selectedChannel!)];

        Object.assign(channelToEdit, chatChannel);

        const response = await ChatBotClient.updateChatBot(this.context.instance.id, {
            channels: newChannels,
            id: chatBot.id
        });

        if (response.code === StatusCode.OK) {
            if (response.payload) {
                const chatBots = [...this.state.chatBots];
                const index = chatBots.indexOf(chatBot);

                chatBot = response.payload;
                chatBot.loadedWithConnectionString = true;

                chatBots[index] = chatBot;

                this.setState({
                    chatBots,
                    selectedChatBot: chatBot
                });
            }
        } else {
            this.addError(response.error);
        }

        this.setState({
            loading: false
        });
    }

    private async deleteChatChannel(chatBot: ChatBot, chatChannel: ChatChannel): Promise<void> {
        if (
            !confirm(
                this.props.intl.formatMessage(
                    { id: "view.instance.chat.delete.channel.confirm" },
                    {
                        channelName:
                            chatChannel.tag ??
                            chatChannel.ircChannel ??
                            chatChannel.discordChannelId
                    }
                )
            )
        )
            return;

        this.setState({
            loading: true
        });

        const newChannels = [...(chatBot.channels ?? [])];
        const index = newChannels.indexOf(chatChannel);
        newChannels.splice(index, 1);

        const response = await ChatBotClient.updateChatBot(this.context.instance.id, {
            channels: newChannels,
            id: chatBot.id
        });

        if (response.code === StatusCode.OK) {
            if (response.payload) {
                const chatBots = [...this.state.chatBots];
                const index = chatBots.indexOf(chatBot);

                chatBot = response.payload;
                chatBot.loadedWithConnectionString = true;

                chatBots[index] = chatBot;

                this.setState({
                    chatBots,
                    selectedChatBot: chatBot,

                    selectedChannel: null
                });
            }
        } else {
            this.addError(response.error);
        }

        this.setState({
            loading: false
        });
    }

    private async deleteChatBot(chatBot: ChatBot): Promise<void> {
        if (
            !confirm(
                this.props.intl.formatMessage(
                    { id: "view.instance.chat.delete.confirm" },
                    { botName: chatBot.name }
                )
            )
        )
            return;

        this.setState({
            loading: true
        });

        const response = await ChatBotClient.deleteChatBot(this.context.instance.id, chatBot.id);

        if (response.code === StatusCode.OK) {
            const newChatBots = [...this.state.chatBots];
            const index = newChatBots.indexOf(chatBot);
            newChatBots.splice(index, 1);

            this.setState({
                chatBots: newChatBots,
                selectedChatBot: null
            });
        } else {
            this.addError(response.error);
        }

        this.setState({
            loading: false
        });
    }

    public render(): React.ReactNode {
        if (this.state.loading) {
            return <Loading text="loading.chat" />;
        }

        const canRead = hasChatBotRight(this.context.instancePermissionSet, ChatBotRights.Read);
        const canCreate = hasChatBotRight(this.context.instancePermissionSet, ChatBotRights.Create);

        return (
            <div className="text-center">
                <DebugJsonViewer obj={this.state} />
                <h1>
                    <FormattedMessage id="view.instance.chat" />
                </h1>
                {this.state.errors.map((err, index) => {
                    if (!err) return;
                    return (
                        <ErrorAlert
                            key={index}
                            error={err}
                            onClose={() =>
                                this.setState(prev => {
                                    const newarr = Array.from(prev.errors);
                                    newarr[index] = undefined;
                                    return {
                                        errors: newarr
                                    };
                                })
                            }
                        />
                    );
                })}
                <div className="d-flex flex-row">
                    <div
                        className="text-left"
                        style={{
                            paddingRight: "16px",
                            maxHeight: "800px",
                            minWidth: "300px",
                            overflowY: "scroll"
                        }}>
                        <ul className="browser-ul">
                            {canRead ? (
                                this.state.chatBots.map(this.renderChatBotBrowser)
                            ) : (
                                <React.Fragment />
                            )}
                            {canCreate ? (
                                <li className="browser-li">
                                    <OverlayTrigger
                                        placement="top"
                                        show={
                                            this.state.chatBots.length <
                                            this.context.instance.chatBotLimit
                                                ? false
                                                : undefined
                                        }
                                        overlay={props => (
                                            <Tooltip id="too-many-chat-bots" {...props}>
                                                <FormattedMessage
                                                    id="view.instance.chat.limit"
                                                    values={{
                                                        max: this.context.instance.chatBotLimit
                                                    }}
                                                />
                                            </Tooltip>
                                        )}>
                                        <Button
                                            className="nowrap"
                                            disabled={
                                                this.state.chatBots.length >=
                                                this.context.instance.chatBotLimit
                                            }
                                            onClick={() =>
                                                this.setState({
                                                    selectedChatBot: null,
                                                    selectedChannel: null,
                                                    selectedAddNode: !!(
                                                        !this.state.selectedAddNode ||
                                                        this.state.selectedChatBot
                                                    )
                                                })
                                            }>
                                            <FontAwesomeIcon icon={faPlus} />
                                            &nbsp;
                                            <FormattedMessage id="view.instance.chat.create" />
                                        </Button>
                                    </OverlayTrigger>
                                </li>
                            ) : (
                                <React.Fragment />
                            )}
                        </ul>
                    </div>
                    <div
                        className="flex-fill flex-column text-center align-self-center"
                        style={{ padding: "16px" }}>
                        {this.state.selectedChannel ? (
                            this.renderAddEditChannel(false)
                        ) : this.state.selectedChatBot && !this.state.selectedAddNode ? (
                            this.renderAddEditChatBot(false)
                        ) : this.state.selectedAddNode ? (
                            this.state.selectedChatBot ? (
                                this.renderAddEditChannel(true)
                            ) : (
                                this.renderAddEditChatBot(true)
                            )
                        ) : (
                            <h4>
                                <FormattedMessage id="view.instance.chat.select_item" />
                            </h4>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    private renderChatBotBrowser(chatBot: ChatBotResponse): React.ReactNode {
        const selected = this.state.selectedChatBot === chatBot;
        const canWriteChannels = hasChatBotRight(
            this.context.instancePermissionSet,
            ChatBotRights.WriteChannels
        );
        return (
            <li key={chatBot.id} className="browser-li">
                <Button
                    variant={selected ? "secondary" : "primary"}
                    onClick={() =>
                        this.setState({
                            selectedChatBot:
                                selected &&
                                !this.state.selectedChannel &&
                                !this.state.selectedAddNode
                                    ? null
                                    : chatBot,
                            selectedChannel: null,
                            selectedAddNode: false
                        })
                    }
                    className="nowrap">
                    <FontAwesomeIcon
                        icon={chatBot.provider === ChatProvider.Discord ? faDiscord : faComment}
                    />
                    &nbsp;{chatBot.name}
                </Button>
                {canWriteChannels && selected ? (
                    <ul className="browser-ul">
                        {chatBot.channels.map(channel => {
                            const channelSelected = this.state.selectedChannel === channel;
                            return (
                                <li
                                    key={channel.discordChannelId ?? channel.ircChannel}
                                    className="browser-li">
                                    <Button
                                        variant={channelSelected ? "secondary" : "primary"}
                                        onClick={() =>
                                            this.setState({
                                                selectedChannel: channelSelected ? null : channel
                                            })
                                        }
                                        className="nowrap">
                                        <FontAwesomeIcon icon={faHashtag} />
                                        &nbsp;
                                        {channel.tag
                                            ? `(${channel.tag})`
                                            : channel.discordChannelId ?? channel.ircChannel}
                                    </Button>
                                </li>
                            );
                        })}
                        <li className="browser-li">
                            <OverlayTrigger
                                placement="top"
                                show={
                                    chatBot.channels.length < chatBot.channelLimit
                                        ? false
                                        : undefined
                                }
                                overlay={props => (
                                    <Tooltip id="too-many-chat-channels" {...props}>
                                        <FormattedMessage
                                            id="view.instance.chat.limit.channels"
                                            values={{ max: chatBot.channelLimit }}
                                        />
                                    </Tooltip>
                                )}>
                                <Button
                                    className="nowrap"
                                    disabled={chatBot.channels.length >= chatBot.channelLimit}
                                    onClick={() =>
                                        this.setState({
                                            selectedChannel: null,
                                            selectedAddNode: !!(
                                                !this.state.selectedAddNode ||
                                                this.state.selectedChannel
                                            )
                                        })
                                    }>
                                    <FontAwesomeIcon icon={faPlus} />
                                    &nbsp;
                                    <FormattedMessage id="view.instance.chat.create.channel" />
                                </Button>
                            </OverlayTrigger>
                        </li>
                    </ul>
                ) : (
                    <React.Fragment />
                )}
            </li>
        );
    }

    private renderAddEditChatBot(add: boolean): React.ReactNode {
        const providerFieldCommon = {
            type: FieldType.Enum as FieldType.Enum,
            name: "fields.instance.chat.provider",
            defaultValue: this.state.addBotProvider,
            enum: ChatProvider,
            noLocalize: true
        };

        const providerField = {
            ...providerFieldCommon,
            onChange: (newValue: ChatProvider) => {
                this.setState({ addBotProvider: newValue });
            }
        };

        const fieldsCommon = {
            provider: { ...providerFieldCommon },
            name: {
                type: FieldType.String as FieldType.String,
                name: "fields.instance.chat.name",
                tooltip: "fields.instance.chat.name.tip"
            },
            enabled: {
                type: FieldType.Boolean as FieldType.Boolean,
                name: "fields.instance.chat.enabled",
                tooltip: "fields.instance.chat.enabled.tip",
                defaultValue: true
            },
            channelLimit: {
                type: FieldType.Number as FieldType.Number,
                name: "fields.instance.chat.limit",
                tooltip: "fields.instance.chat.limit.tip",
                min: 0,
                max: 65535,
                defaultValue: 10
            },
            reconnectionInterval: {
                type: FieldType.Number as FieldType.Number,
                name: "fields.instance.chat.reconnect",
                tooltip: "fields.instance.chat.reconnect.tip",
                min: 0,
                defaultValue: 5
            }
        };

        if (add) {
            const fieldsDiscord = {
                ...fieldsCommon,
                botToken: {
                    type: FieldType.String as FieldType.String,
                    name: "fields.instance.chat.create.discord.token",
                    tooltip: "fields.instance.chat.create.discord.token.tip"
                },
                dmOutputDisplayType: {
                    type: FieldType.Enum as FieldType.Enum,
                    name: "fields.instance.chat.create.discord.output",
                    tooltip: "fields.instance.chat.create.discord.output.tip",
                    defaultValue: DiscordDMOutputDisplayType.Always,
                    enum: DiscordDMOutputDisplayType,
                    noLocalize: true
                },
                basedMeme: {
                    type: FieldType.Boolean as FieldType.Boolean,
                    name: "fields.instance.chat.create.discord.based",
                    tooltip: "fields.instance.chat.create.discord.based.tip",
                    defaultValue: true
                },
                deploymentBranding: {
                    type: FieldType.Boolean as FieldType.Boolean,
                    name: "fields.instance.chat.create.discord.branding",
                    tooltip: "fields.instance.chat.create.discord.branding.tip",
                    defaultValue: true
                }
            };

            const fieldsIrc = {
                ...fieldsCommon,
                address: {
                    type: FieldType.String as FieldType.String,
                    name: "fields.instance.chat.create.irc.address",
                    tooltip: "fields.instance.chat.create.irc.address.tip"
                },
                port: {
                    type: FieldType.Number as FieldType.Number,
                    name: "fields.instance.chat.create.irc.port",
                    min: 1,
                    max: 65535,
                    defaultValue: 6697 // RFC7194
                },
                nickname: {
                    type: FieldType.String as FieldType.String,
                    name: "fields.instance.chat.create.irc.nick"
                },
                password: {
                    type: FieldType.Password as FieldType.Password,
                    name: "fields.instance.chat.create.irc.pass",
                    tooltip: "fields.instance.chat.create.irc.pass.tip"
                },
                passwordType: {
                    type: FieldType.Enum as FieldType.Enum,
                    name: "fields.instance.chat.create.irc.passtype",
                    defaultValue: IrcPasswordType.SASL,
                    enum: IrcPasswordType,
                    noLocalize: true
                },
                useSsl: {
                    type: FieldType.Boolean as FieldType.Boolean,
                    name: "fields.instance.chat.create.irc.ssl",
                    tooltip: "fields.instance.chat.create.irc.ssl.tip"
                }
            };

            (fieldsCommon.provider as InputFormField).disabled = true;

            return (
                <React.Fragment>
                    <h5>
                        <FormattedMessage id="view.instance.chat.create" />
                    </h5>
                    <hr />
                    <InputField {...providerField} />
                    <hr />
                    <InputForm
                        key={`bot-create-form-${this.state.addBotProvider}`}
                        hideDisabled
                        includeAll
                        saveMessageId="fields.instance.chat.create.save"
                        fields={
                            this.state.addBotProvider === ChatProvider.Discord
                                ? fieldsDiscord
                                : fieldsIrc
                        }
                        onSave={(connectionBuilder: ChatBotConnectionBuilder) =>
                            void this.addChatBot(connectionBuilder)
                        }
                    />
                </React.Fragment>
            );
        }

        const chatBot = this.state.selectedChatBot!;
        const canReadConnectionString = hasChatBotRight(
            this.context.instancePermissionSet,
            ChatBotRights.ReadConnectionString
        );
        const canEditConnectionString = hasChatBotRight(
            this.context.instancePermissionSet,
            ChatBotRights.WriteConnectionString
        );

        const fieldsEdit = {
            ...fieldsCommon,
            connectionString: {
                type: FieldType.String as FieldType.String,
                name: "fields.instance.chat.edit.connection",
                tooltip: "fields.instance.chat.edit.connection.tip",
                defaultValue: canReadConnectionString
                    ? chatBot.loadedWithConnectionString
                        ? chatBot.connectionString
                        : this.props.intl.formatMessage({
                              id: "fields.instance.chat.edit.connection.unloaded"
                          })
                    : this.props.intl.formatMessage({
                          id: "fields.instance.chat.edit.connection.deny"
                      }),
                disabled: !canEditConnectionString
            }
        };

        (fieldsEdit.name as InputFormField).defaultValue = chatBot.name;
        (fieldsEdit.enabled as InputFormField).defaultValue = chatBot.enabled;
        (fieldsEdit.channelLimit as InputFormField).defaultValue = chatBot.channelLimit;
        (fieldsEdit.reconnectionInterval as InputFormField).defaultValue =
            chatBot.reconnectionInterval;

        (fieldsEdit.name as InputFormField).disabled = !hasChatBotRight(
            this.context.instancePermissionSet,
            ChatBotRights.WriteName
        );
        (fieldsEdit.enabled as InputFormField).disabled = !hasChatBotRight(
            this.context.instancePermissionSet,
            ChatBotRights.WriteEnabled
        );
        (fieldsEdit.channelLimit as InputFormField).disabled = !hasChatBotRight(
            this.context.instancePermissionSet,
            ChatBotRights.WriteChannelLimit
        );
        (fieldsEdit.reconnectionInterval as InputFormField).disabled = !hasChatBotRight(
            this.context.instancePermissionSet,
            ChatBotRights.WriteReconnectionInterval
        );

        const canDelete = hasChatBotRight(this.context.instancePermissionSet, ChatBotRights.Delete);

        return (
            <React.Fragment>
                <h5>
                    <FontAwesomeIcon
                        icon={chatBot.provider === ChatProvider.Discord ? faDiscord : faComment}
                    />
                    &nbsp;{chatBot.name}
                </h5>
                <hr />
                {!chatBot.loadedWithConnectionString ? (
                    <React.Fragment>
                        <OverlayTrigger
                            placement="top"
                            show={canReadConnectionString ? false : undefined}
                            overlay={props => (
                                <Tooltip id="chat-bot-read-conn-perm" {...props}>
                                    <FormattedMessage id="view.instance.chat.reload.deny" />
                                </Tooltip>
                            )}>
                            <Button
                                className="nowrap"
                                disabled={!canReadConnectionString}
                                onClick={() => void this.reloadChatBot(chatBot)}>
                                <FormattedMessage id="view.instance.chat.reload" />
                            </Button>
                        </OverlayTrigger>
                        <br />
                        <br />
                    </React.Fragment>
                ) : (
                    <React.Fragment />
                )}
                <InputForm
                    fields={fieldsEdit}
                    onSave={(chatBotUpdate: ChatBotUpdate) => void this.editChatBot(chatBotUpdate)}
                />
                <hr />
                <OverlayTrigger
                    placement="top"
                    show={canDelete ? false : undefined}
                    overlay={props => (
                        <Tooltip id="chat-bot-delete-perm" {...props}>
                            <FormattedMessage id="view.instance.chat.delete.deny" />
                        </Tooltip>
                    )}>
                    <Button
                        className="nowrap"
                        disabled={!canDelete}
                        variant="danger"
                        onClick={() => void this.deleteChatBot(chatBot)}>
                        <FormattedMessage id="view.instance.chat.delete" />
                    </Button>
                </OverlayTrigger>
            </React.Fragment>
        );
    }

    private renderAddEditChannel(add: boolean): React.ReactNode {
        const chatBot = this.state.selectedChatBot!;

        const fieldsCommon = {
            tag: {
                type: FieldType.String as FieldType.String,
                name: "fields.instance.chat.channel.tag",
                tooltip: "fields.instance.chat.channel.tag.tip"
            },
            isAdminChannel: {
                type: FieldType.Boolean as FieldType.Boolean,
                name: "fields.instance.chat.channel.admin",
                tooltip: "fields.instance.chat.channel.admin.tip"
            },
            isWatchdogChannel: {
                type: FieldType.Boolean as FieldType.Boolean,
                name: "fields.instance.chat.channel.watchdog",
                tooltip: "fields.instance.chat.channel.watchdog.tip"
            },
            isUpdatesChannel: {
                type: FieldType.Boolean as FieldType.Boolean,
                name: "fields.instance.chat.channel.updates",
                tooltip: "fields.instance.chat.channel.updates.tip"
            }
        };

        const canEditChannels = hasChatBotRight(
            this.context.instancePermissionSet,
            ChatBotRights.WriteChannels
        );

        if (add) {
            const fieldsDiscord = {
                // we remap this to discord later because of uint64 memes
                ircChannel: {
                    type: FieldType.String as FieldType.String,
                    name: "fields.instance.chat.channel.discord",
                    tooltip: "fields.instance.chat.channel.discord.tip"
                },
                ...fieldsCommon
            };
            const fieldsIrc = {
                ircChannel: {
                    type: FieldType.String as FieldType.String,
                    name: "fields.instance.chat.channel.irc",
                    tooltip: "fields.instance.chat.channel.irc.tip",
                    defaultValue: "#"
                },
                ...fieldsCommon
            };

            return (
                <React.Fragment>
                    <h5>
                        <FormattedMessage id="view.instance.chat.create.channel" />
                    </h5>
                    <hr />
                    <InputForm
                        key={`bot-channel-create-form-${chatBot.provider}`}
                        includeAll
                        saveMessageId="fields.instance.chat.create.channel"
                        fields={
                            chatBot.provider === ChatProvider.Discord ? fieldsDiscord : fieldsIrc
                        }
                        onSave={(chatChannel: ChatChannel) =>
                            void this.addChatChannel(chatBot, chatChannel)
                        }
                    />
                </React.Fragment>
            );
        }

        const channel = this.state.selectedChannel!;

        (fieldsCommon.isAdminChannel as InputFormField).defaultValue = channel.isAdminChannel;
        (fieldsCommon.isUpdatesChannel as InputFormField).defaultValue = channel.isUpdatesChannel;
        (fieldsCommon.isWatchdogChannel as InputFormField).defaultValue = channel.isWatchdogChannel;
        (fieldsCommon.tag as InputFormField).defaultValue = channel.tag;

        return (
            <React.Fragment key={chatBot.channels.indexOf(channel)}>
                {channel.discordChannelId ? (
                    <GenericAlert title="view.instance.chat.channel.wrong_id" />
                ) : (
                    <React.Fragment />
                )}
                <h5>
                    {channel.ircChannel ?? channel.discordChannelId}
                    {channel.tag ? ` (${channel.tag})` : ""}
                </h5>
                <hr />
                <InputForm
                    fields={fieldsCommon}
                    onSave={(chatChannel: ChatChannel) =>
                        void this.editChatChannel(chatBot, chatChannel)
                    }
                />
                <hr />
                <OverlayTrigger
                    placement="top"
                    show={canEditChannels ? false : undefined}
                    overlay={props => (
                        <Tooltip id="chat-bot-delete-perm" {...props}>
                            <FormattedMessage id="view.instance.chat.delete.channel.deny" />
                        </Tooltip>
                    )}>
                    <Button
                        className="nowrap"
                        disabled={!canEditChannels}
                        variant="danger"
                        onClick={() => void this.deleteChatChannel(chatBot, channel)}>
                        <FormattedMessage id="view.instance.chat.delete.channel" />
                    </Button>
                </OverlayTrigger>
            </React.Fragment>
        );
    }
}

ChatBots.contextType = InstanceEditContext;
export default injectIntl(ChatBots);
