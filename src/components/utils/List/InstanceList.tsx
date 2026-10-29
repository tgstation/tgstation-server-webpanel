// shut up eslint im replacing you with biome
/* eslint-disable import/no-cycle */
import { faEllipsis, faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";
import Badge from "react-bootstrap/esm/Badge";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/esm/Card";
import Dropdown from "react-bootstrap/esm/Dropdown";
import Modal from "react-bootstrap/esm/Modal";
import Table from "react-bootstrap/esm/Table";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router-dom";
import { satisfies } from "semver";

import {
    InstanceManagerRights,
    InstanceResponse
} from "../../../ApiClient/generatedcode/generated";
import InstanceClient from "../../../ApiClient/InstanceClient";
import InstancePermissionSetClient from "../../../ApiClient/InstancePermissionSetClient";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import { GeneralContext } from "../../../contexts/GeneralContext";
import { hasInstanceManagerRight, resolvePermissionSet } from "../../../utils/misc";
import { AppRoutes, RouteData } from "../../../utils/routes";
import { DropdownButtonWithAPortal } from "../DropdownButtonWithAPortal";
import { DebugJsonViewer } from "../JsonViewer";
import { Pagination, PaginationProps } from ".";

/// ctx provider for instances since we do inline mutations and need the parent to rerender :)
const InstanceListContext = createContext<{
    list: InstanceResponse[];
    setInstanceList: React.Dispatch<React.SetStateAction<InstanceResponse[]>>;
}>({
    list: [],
    setInstanceList: () => {
        throw new Error("Function not implemented.");
    }
});
InstanceListContext.displayName = "InstanceList Context";

export const useInstanceList = () => useContext(InstanceListContext);

export const InstanceContext = ({
    children,
    instances = []
}: PropsWithChildren<{ instances?: InstanceResponse[] }>) => {
    const [list, setInstanceList] = useState<InstanceResponse[]>(instances);

    useEffect(() => {
        setInstanceList(instances);
    }, [instances]);

    return (
        <InstanceListContext.Provider value={{ list, setInstanceList }}>
            {children}
        </InstanceListContext.Provider>
    );
};

/**
 * Component wrapper for instancecontext and instancelistraw
 *
 * Expects context `GeneralContext` to exist.
 */
export const InstanceList = (props: InstanceListRawProps & { instances: InstanceResponse[] }) => {
    return (
        <InstanceContext instances={props.instances}>
            <InstanceListRaw {...props} />
        </InstanceContext>
    );
};

/**
 * Fake instance list for your placeholder needs
 *
 * DOES NOT WORK! NO PLACEHOLDER ON BS4 (exists on bs5)
 */
export const InstanceListLoading = () => {
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
                                <FormattedMessage id="generic.path" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.configmode" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.status" />
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
                                <th>{k}</th>
                                <th>
                                    <FormattedMessage id="generic.name" />
                                </th>
                                <th>/home/user/tgstation-server/{k}</th>
                                <th>
                                    <FormattedMessage id={`view.instance.configmode.1`} />
                                </th>
                                <th>
                                    <Badge pill variant={"success"}>
                                        <FormattedMessage id={`generic.online`} />
                                    </Badge>
                                </th>
                                <th>
                                    <Button size="sm" variant="link">
                                        <FontAwesomeIcon icon={faEllipsis} />
                                    </Button>
                                </th>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
            <Pagination page={1} maxPage={1} pageSize={5} totalItems={5} />
        </div>
    );
};

export type InstanceListRawProps =
    | {
          pagination: false;
      }
    | ({
          pagination: true;
      } & PaginationProps);

/**
 * Expects context `GeneralContext` and `InstanceListContext` to exist.
 */
export const InstanceListRaw = (props: InstanceListRawProps) => {
    const { list } = useInstanceList();
    return (
        <div className="d-flex flex-column" style={{ gap: "1rem" }}>
            <DebugJsonViewer obj={list} />
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
                                <FormattedMessage id="generic.path" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.configmode" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.status" />
                            </th>
                            <th>
                                <div className="d-flex justify-content-center">
                                    <FontAwesomeIcon icon={faGear} />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map(instance => (
                            <InstanceItem instance={instance} key={instance.id} />
                        ))}
                    </tbody>
                </Table>
            </Card>
            {!!props.pagination && <Pagination {...props} />}
        </div>
    );
};

const InstanceItem = ({ instance }: { instance: InstanceResponse }) => {
    const { setInstanceList, list } = useInstanceList();
    const { user, serverInfo } = useContext(GeneralContext);
    const history = useHistory();

    const [isR, setisR] = useState<InstanceResponse>(instance); // inline instance response if not being nuked
    const [isTryingToDetatch, setIsTryingToDetatch] = useState(false);
    const [isDoingPowerOp, setIsDoingPowerOp] = useState(false);
    const [canAccess, setCanAccess] = useState(false);

    useEffect(() => {
        setisR(instance);
    }, [instance]);

    useEffect(() => {
        if (satisfies(serverInfo.apiVersion, "<9.1.0")) {
            setCanAccess(isR.online && isR.accessible);
            return;
        }
        InstancePermissionSetClient.getCurrentInstancePermissionSet(isR.id, true)
            .then(r => {
                setCanAccess(r.code === StatusCode.OK);
            })
            .catch(e => {
                console.log(e);
            });
    }, [isR, serverInfo]);

    const canOnline = useMemo(
        () =>
            !!(resolvePermissionSet(user).instanceManagerRights & InstanceManagerRights.SetOnline),
        [user]
    );

    const canGrant = useMemo(
        () =>
            hasInstanceManagerRight(
                resolvePermissionSet(user),
                InstanceManagerRights.GrantPermissions
            ),
        [user]
    );

    const canDetach = useMemo(
        () => hasInstanceManagerRight(resolvePermissionSet(user), InstanceManagerRights.Delete),
        [user]
    );

    return (
        <tr>
            <Modal
                show={isTryingToDetatch}
                onHide={() => {
                    setIsTryingToDetatch(false);
                }}>
                <Modal.Header>
                    <Modal.Title>
                        <FormattedMessage id="view.instance.list.detatch" />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        <FormattedMessage
                            id="view.instance.list.detatch.header"
                            values={{ name: isR.name }}
                        />
                    </p>
                    <small>
                        <FormattedMessage id="view.instance.list.detatch.footer" />
                    </small>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <Button
                        variant="outline-secondary"
                        onClick={() => {
                            setIsTryingToDetatch(false);
                        }}>
                        <FormattedMessage id="generic.cancel" />
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            setIsDoingPowerOp(true);
                            InstanceClient.detachInstance(isR.id)
                                .then(r => {
                                    if (r.code !== StatusCode.OK) {
                                        console.error(r);
                                        return;
                                    }
                                    setInstanceList(list.filter(r => r.id !== isR.id));
                                })
                                .catch(e => {
                                    console.error(e);
                                })
                                .finally(() => {
                                    // not needed probably since we are gone
                                    setIsDoingPowerOp(false);
                                    setIsTryingToDetatch(false);
                                });
                        }}>
                        <FormattedMessage id="generic.detatch" />
                    </Button>
                </Modal.Footer>
            </Modal>
            <th>{isR.id}</th>
            <th>
                <u>
                    <a
                        href={canAccess ? "#" : undefined}
                        aria-disabled={!canAccess}
                        onClick={() => {
                            if (!canAccess) return;
                            RouteData.selectedinstanceid = isR.id;
                            history.push(
                                AppRoutes.instanceedit.link ?? AppRoutes.instanceedit.route
                            );
                        }}>
                        {isR.name}
                    </a>
                </u>
            </th>
            <th>{isR.path}</th>
            <th>
                <FormattedMessage
                    id={`view.instance.configmode.${isR.configurationType.toString()}`}
                />
            </th>
            <th>
                <Badge pill variant={isR.moveJob ? "warning" : isR.online ? "success" : "danger"}>
                    {isR.moveJob ? (
                        <FormattedMessage id="view.instance.moving" />
                    ) : (
                        <FormattedMessage id={`generic.${isR.online ? "online" : "offline"}`} />
                    )}
                </Badge>
            </th>
            <th>
                <DropdownButtonWithAPortal
                    size="sm"
                    variant="link"
                    menuAlign={"left"}
                    role="menuitem"
                    title={<FontAwesomeIcon icon={faEllipsis} />}>
                    <Dropdown.Item
                        disabled={!canAccess}
                        onClick={() => {
                            RouteData.selectedinstanceid = isR.id;
                            history.push(
                                AppRoutes.instanceedit.link ?? AppRoutes.instanceedit.route
                            );
                        }}>
                        <FormattedMessage id="generic.access" />
                    </Dropdown.Item>
                    <Dropdown.Item
                        onClick={() => {
                            setIsDoingPowerOp(true);
                            InstanceClient.editInstance({
                                id: isR.id,
                                online: !isR.online
                            })
                                .then(r => {
                                    if (r.code !== StatusCode.OK) {
                                        return;
                                    }
                                    setisR(r.payload);
                                })
                                .catch(e => {
                                    // idgaf
                                    console.log(e);
                                })
                                .finally(() => {
                                    setIsDoingPowerOp(false);
                                });
                        }}
                        disabled={!canOnline || isDoingPowerOp}>
                        {isR.online ? (
                            <FormattedMessage id="generic.disable" />
                        ) : (
                            <FormattedMessage id="generic.enable" />
                        )}
                    </Dropdown.Item>
                    <Dropdown.Item
                        onClick={() => {
                            setIsDoingPowerOp(true);
                            InstanceClient.grantPermissions({
                                id: instance.id
                            })
                                .then(r => {
                                    if (r.code !== StatusCode.OK) {
                                        return;
                                    }
                                    setisR(r.payload);
                                })
                                .catch(e => {
                                    // idgaf
                                    console.log(e);
                                })
                                .finally(() => {
                                    setIsDoingPowerOp(false);
                                });
                        }}
                        disabled={!isR.online || canAccess || !canGrant || isDoingPowerOp}>
                        <FormattedMessage id="view.instance.list.all_access" />
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                        disabled={!canDetach || isDoingPowerOp}
                        onClick={() => {
                            setIsTryingToDetatch(true);
                        }}
                        style={{ color: "var(--red-ish)" }}>
                        <FormattedMessage id="generic.detatch" />
                    </Dropdown.Item>
                </DropdownButtonWithAPortal>
            </th>
        </tr>
    );
};
