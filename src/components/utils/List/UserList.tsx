/* eslint-disable react/react-in-jsx-scope */
import { faEllipsis, faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dropdown } from "react-bootstrap";
import Badge from "react-bootstrap/esm/Badge";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/esm/Card";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Table from "react-bootstrap/esm/Table";
import Tooltip from "react-bootstrap/esm/Tooltip";
import { FormattedMessage, FormattedRelativeTime } from "react-intl";
import { useHistory } from "react-router";

import {
    ShallowUserResponse,
    UserGroup,
    UserResponse
} from "../../../ApiClient/generatedcode/generated";
import { AppRoutes, RouteData } from "../../../utils/routes";
import { DropdownButtonWithAPortal } from "../DropdownButtonWithAPortal";
import { DebugJsonViewer } from "../JsonViewer";
import { Pagination, PaginationProps } from "./Pagination";

export type UserListProps =
    | {
          pagination?: false;
      }
    | ({
          pagination: true;
      } & PaginationProps);

export const UserList = ({ users, ...rest }: { users: UserResponse[] } & UserListProps) => {
    const history = useHistory();

    return (
        <div className="d-flex flex-column" style={{ gap: "1rem" }}>
            <DebugJsonViewer obj={users} />
            {/* intentional no-body, i want the squircle border */}
            <Card>
                <Table hover responsive className="mb-0">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>
                                <FormattedMessage id="generic.name" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.group" />
                            </th>
                            <th>
                                <FormattedMessage id="user.list.identity" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.created" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.createdby" />
                            </th>
                            <th>
                                <div className="d-flex justify-content-center">
                                    <FontAwesomeIcon icon={faGear} />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* unlike instancelist theres no fancy side effects for these. */}
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <GroupTooltip group={user.group} />
                                <td>
                                    {user.systemIdentifier ? (
                                        <Badge variant="primary" className="mx-1">
                                            <FormattedMessage id="generic.system.short" />
                                        </Badge>
                                    ) : (
                                        <Badge variant="primary" className="mx-1">
                                            <FormattedMessage id="generic.tgs" />
                                        </Badge>
                                    )}
                                </td>
                                <DateTimeReadable createdDate={new Date(user.createdAt)} />
                                <NameTooltip user={user.createdBy} />
                                <td>
                                    <div className="d-flex justify-content-center">
                                        <DropdownButtonWithAPortal
                                            size="sm"
                                            variant="link"
                                            menuAlign={"left"}
                                            role="menuitem"
                                            title={<FontAwesomeIcon icon={faEllipsis} />}>
                                            <Dropdown.Item
                                                onClick={() => {
                                                    RouteData.selecteduserid = user.id;
                                                    history.push(
                                                        AppRoutes.useredit.link ??
                                                            AppRoutes.useredit.route
                                                    );
                                                }}>
                                                <FormattedMessage id="generic.edit" />
                                            </Dropdown.Item>
                                            {/* TBA */}
                                            {/* <Dropdown.Divider />
                                            <Dropdown.Item style={{ color: "var(--red-ish)" }}>
                                                <FormattedMessage id="generic.disable" />
                                            </Dropdown.Item> */}
                                        </DropdownButtonWithAPortal>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
            {rest.pagination && <Pagination {...rest} />}
        </div>
    );
};

export const UserListLoading = () => {
    return (
        <div className="d-flex flex-column" style={{ gap: "1rem" }}>
            <DebugJsonViewer obj={{ lol: "secret!!!" }} />
            {/* intentional no-body, i want the squircle border */}
            <Card>
                <Table hover responsive className="mb-0">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>
                                <FormattedMessage id="generic.name" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.group" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.details" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.created" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.createdby" />
                            </th>
                            <th>
                                <div className="d-flex justify-content-center">
                                    <FontAwesomeIcon icon={faGear} />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(5).keys()].map(k => (
                            <tr key={k}>
                                <td>{k + 1}</td>
                                <td>Test</td>
                                <td>the no group</td>
                                <td>tags or some shit</td>
                                <DateTimeReadable
                                    createdDate={new Date(Date.now() - 12 * 60 * 60 * 1000)}
                                />
                                <td>buh user</td>
                                <td>
                                    <Button size="sm" variant="link">
                                        <FontAwesomeIcon icon={faEllipsis} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
            <Pagination page={1} maxPage={1} pageSize={5} totalItems={5} />
        </div>
    );
};

const NameTooltip = ({ user }: { user: ShallowUserResponse }) => {
    return (
        <OverlayTrigger
            overlay={<Tooltip id={`name-${user.id}-tooltip`}>User ID: {user.id}</Tooltip>}>
            {({ ref, ...triggerHandler }) => (
                <td {...triggerHandler}>
                    <span ref={ref as React.Ref<HTMLSpanElement>}>{user.name}</span>
                </td>
            )}
        </OverlayTrigger>
    );
};

const GroupTooltip = ({ group }: { group?: UserGroup | null }) => {
    if (!group) {
        return (
            <td>
                <i>No group</i>
            </td>
        );
    }
    return (
        <OverlayTrigger
            overlay={<Tooltip id={`name-${group.id}-tooltip`}>User ID: {group.id}</Tooltip>}>
            {({ ref, ...triggerHandler }) => (
                <td {...triggerHandler}>
                    <span ref={ref as React.Ref<HTMLSpanElement>}>{group.name}</span>
                </td>
            )}
        </OverlayTrigger>
    );
};

/**
 * Disappointingly holds td since thats how it triggers >:(
 */
const DateTimeReadable = ({ createdDate }: { createdDate: Date }) => {
    const dt = (createdDate.getTime() - Date.now()) / 1000;
    return (
        <OverlayTrigger
            overlay={
                <Tooltip id={`date-${createdDate.getTime()}-tooltip`}>
                    {createdDate.toLocaleString()}
                </Tooltip>
            }>
            {({ ref, ...triggerHandler }) => (
                <td {...triggerHandler}>
                    <span ref={ref as React.Ref<HTMLSpanElement>}>
                        {/* render full locale string when above a day */}
                        {dt > -(60 * 60 * 24) ? (
                            <FormattedRelativeTime
                                value={dt}
                                numeric="auto"
                                updateIntervalInSeconds={1}
                            />
                        ) : (
                            createdDate.toLocaleString("en")
                        )}
                    </span>
                </td>
            )}
        </OverlayTrigger>
    );
};
