import * as React from 'react';

import { User, AdministrationRights } from '../../clients/generated';

import Glyphicon from '@strongdm/glyphicon';

import './UserBadge.css';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { PropagateLoader } from 'react-spinners';

interface IOwnProps {
    user: User;
    own: boolean;
    editAction?: (user: User) => void;

    refreshAction(user: User): Promise<boolean>;
}

interface IState {
    refreshing: boolean;
    refreshError?: boolean;
}

type IProps = IOwnProps & InjectedIntlProps;

class UserBadge extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.refresh = this.refresh.bind(this);
        this.edit = this.edit.bind(this);

        this.state = {
            refreshing: false
        };
    }

    public render(): React.ReactNode {
        if (this.state.refreshing)
            return (
                <div className="UserBadge">
                    <div className="UserBadge-refreshing">
                        <PropagateLoader loading={true} color="honeydew" />
                    </div>
                </div>
            );

        const createdAt = this.props.user.createdAt;
        if (createdAt == null)
            throw new Error('props.user.createdAt should be set!');

        let createdBy = this.props.user.createdBy?.name;
        if (!createdBy) createdBy = 'TGS';

        const enabledGlyph = this.props.user.enabled ? 'check' : 'cross';
        const enabledClass = this.props.user.enabled ? 'enabled' : 'disabled';

        const editSection = [
            <button
                className="UserBadge-refresh"
                onClick={this.refresh}
                key={1}>
                <FormattedMessage id="user_badge.refresh" />
            </button>
        ];

        const adminRights = this.props.user.administrationRights;
        if (adminRights == null)
            throw new Error('props.user.administrationRights should be set!');

        const canWrite = (adminRights & AdministrationRights.WriteUsers) !== 0;

        if (canWrite && this.props.editAction)
            editSection.unshift(
                <button className="UserBadge-edit" onClick={this.edit}>
                    <FormattedMessage
                        id={
                            canWrite
                                ? 'user_badge.edit'
                                : 'user_badge.change_password'
                        }
                    />
                </button>
            );

        return (
            <div
                className={
                    this.state.refreshError
                        ? 'UserBadge UserBadge-error'
                        : !this.props.editAction
                        ? 'UserBadge-editor'
                        : 'UserBadge'
                }>
                <div
                    className="UserBadge-glyph"
                    style={{ color: this.getUserColor() }}>
                    <Glyphicon glyph="user" />
                </div>
                <p className="UserBadge-name">{this.renderName()}</p>
                <p className="UserBadge-id">
                    <FormattedMessage
                        id="user_badge.id"
                        values={{ id: this.props.user.id }}
                    />
                </p>
                <p className="UserBadge-created-on">
                    <FormattedMessage
                        id="user_badge.created_on"
                        values={{
                            createdOn: this.props.intl.formatDate(createdAt)
                        }}
                    />
                </p>
                <p className="UserBadge-created-by">
                    <FormattedMessage
                        id="user_badge.created_by"
                        values={{ name: createdBy }}
                    />
                </p>
                <div className={'UserBadge-state user-' + enabledClass}>
                    <Glyphicon glyph={enabledGlyph} />
                </div>
                {editSection}
            </div>
        );
    }

    private getUserColor(): string {
        function hashCode(str: string) {
            // java String#hashCode
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            return hash;
        }

        function intToRGB(i: number) {
            const c = (i & 0x00ffffff).toString(16).toUpperCase();

            return '00000'.substring(0, 6 - c.length) + c;
        }

        const userId = this.props.user.id;
        if (userId == null)
            throw new Error('props.user.id should be set here!');

        const col = intToRGB(hashCode((753 * userId).toString()));
        return `#${col}`;
    }

    private renderName(): React.ReactNode {
        if (this.props.user.systemIdentifier)
            return (
                <React.Fragment>
                    <FormattedMessage
                        id="user_badge.system_id"
                        values={{ name: this.props.user.systemIdentifier }}
                    />
                    <span> ({this.props.user.name})</span>
                </React.Fragment>
            );

        return (
            <FormattedMessage
                id="user_badge.name"
                values={{ name: this.props.user.name }}
            />
        );
    }

    private edit(): void {
        if (!this.props.editAction)
            throw new Error('props.editAction should be set here!');
        this.props.editAction(this.props.user);
    }

    private async refresh(): Promise<void> {
        if (this.state.refreshing) return;

        const refreshPromise = this.props.refreshAction(this.props.user);
        this.setState({
            refreshing: true
        });

        const refreshError = await refreshPromise;
        this.setState({
            refreshing: false,
            refreshError
        });
    }
}

export default injectIntl(UserBadge);
