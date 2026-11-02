/* eslint-disable react/react-in-jsx-scope */
import { faEllipsis, faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useMemo, useState } from "react";
import Badge from "react-bootstrap/esm/Badge";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/esm/Card";
import Dropdown from "react-bootstrap/esm/Dropdown";
import Form from "react-bootstrap/esm/Form";
import Modal from "react-bootstrap/esm/Modal";
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
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import UserClient from "../../../ApiClient/UserClient";
import { GeneralContext } from "../../../contexts/GeneralContext";
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

const SHOW_DISABLE_USER_KEY = "config.userlist.show_disable_user";

export const UserList = ({ users, ...rest }: { users: UserResponse[] } & UserListProps) => {
    const [showDisableUser, setDisableUser] = useState(() => {
        if (!window.localStorage) return;
        return !!window.localStorage.getItem(SHOW_DISABLE_USER_KEY);
    });

    useEffect(() => {
        if (!window.localStorage) return;
        window.localStorage.setItem(SHOW_DISABLE_USER_KEY, `${showDisableUser ? 1 : 0}`);
    }, [showDisableUser]);

    return (
        <div className="d-flex flex-column" style={{ gap: "1rem" }}>
            <DebugJsonViewer obj={users} />
            <Form.Check // prettier-ignore
                type="switch"
                checked={showDisableUser}
                onChange={r => {
                    setDisableUser(r.currentTarget.checked);
                }}
                id="stupid-id-requirement-delete-when-we-are-at-bs5-or-other-ui-lib"
                label={<FormattedMessage id="view.user.list.showdisabled" />}
            />
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
                        {users
                            .filter(user => (!showDisableUser ? user.enabled : true))
                            .map(user => (
                                <UserRow key={user.id} user={user} />
                            ))}
                    </tbody>
                </Table>
            </Card>
            {rest.pagination && <Pagination {...rest} />}
        </div>
    );
};

const UserRow = ({ user }: { user: UserResponse }) => {
    const history = useHistory();
    const { user: currentUser } = useContext(GeneralContext);

    const [usR, setusR] = useState<UserResponse>(user);
    const [isDoingPowerOp, setIsDoingPowerOp] = useState(false);
    const [isTryingToDoSomethingStupid, setIsTryingToDoSomethingStupid] = useState(false);

    const userEqSrc = useMemo(() => currentUser.id === usR.id, [currentUser, usR]);

    return (
        <tr>
            <Modal
                show={isTryingToDoSomethingStupid}
                onHide={() => {
                    setIsTryingToDoSomethingStupid(false);
                }}>
                <Modal.Header>
                    <Modal.Title>
                        <FormattedMessage id="user.list.row.delete" />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        <FormattedMessage id="user.list.row.delete.desc" />
                    </p>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <Button
                        variant="outline-secondary"
                        onClick={() => {
                            setIsTryingToDoSomethingStupid(false);
                        }}>
                        <FormattedMessage id="generic.cancel" />
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            setIsDoingPowerOp(true);
                            void UserClient.editUser({
                                enabled: !usR.enabled,
                                id: usR.id
                            })
                                .then(r => {
                                    if (r.code !== StatusCode.OK) return;
                                    setusR(r.payload);
                                })
                                .finally(() => {
                                    setIsDoingPowerOp(false);
                                    setIsTryingToDoSomethingStupid(false);
                                });
                        }}>
                        <FormattedMessage id="generic.disable" />
                    </Button>
                </Modal.Footer>
            </Modal>
            <td>{usR.id}</td>
            <td>
                {!usR.enabled && (
                    <>
                        <Badge variant="danger">
                            <FormattedMessage id="generic.disabled" />
                        </Badge>
                        &nbsp;
                    </>
                )}
                {usR.name}
            </td>
            <GroupTooltip group={usR.group} />
            <td>
                {usR.systemIdentifier ? (
                    <Badge variant="primary" className="mx-1">
                        <FormattedMessage id="generic.system.short" />
                    </Badge>
                ) : (
                    <Badge variant="primary" className="mx-1">
                        <FormattedMessage id="generic.tgs" />
                    </Badge>
                )}
            </td>
            <DateTimeReadable createdDate={new Date(usR.createdAt)} />
            <NameTooltip user={usR.createdBy} />
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
                                RouteData.selecteduserid = usR.id;
                                history.push(AppRoutes.useredit.link ?? AppRoutes.useredit.route);
                            }}>
                            <FormattedMessage id="generic.edit" />
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item
                            disabled={isDoingPowerOp}
                            onClick={() => {
                                if (userEqSrc) {
                                    return setIsTryingToDoSomethingStupid(true);
                                }
                                setIsDoingPowerOp(true);
                                void UserClient.editUser({
                                    enabled: !usR.enabled,
                                    id: usR.id
                                })
                                    .then(r => {
                                        if (r.code !== StatusCode.OK) return;
                                        setusR(r.payload);
                                    })
                                    .finally(() => {
                                        setIsDoingPowerOp(false);
                                    });
                            }}
                            style={{
                                color: usR.enabled ? "var(--red-ish)" : "var(--success)"
                            }}>
                            <FormattedMessage
                                id={`generic.${usR.enabled ? "disable" : "enable"}`}
                            />
                        </Dropdown.Item>
                    </DropdownButtonWithAPortal>
                </div>
            </td>
        </tr>
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
