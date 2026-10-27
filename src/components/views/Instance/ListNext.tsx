import { faEllipsis, faGear, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Card, Dropdown, Modal, Pagination, Table } from "react-bootstrap";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Badge from "react-bootstrap/esm/Badge";
import Button from "react-bootstrap/esm/Button";
import { createPortal } from "react-dom";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router-dom";

import {
    InstanceManagerRights,
    InstanceResponse,
    PaginatedInstanceResponse
} from "../../../ApiClient/generatedcode/generated";
import InstanceClient from "../../../ApiClient/InstanceClient";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import { GeneralContext } from "../../../contexts/GeneralContext";
import { hasInstanceManagerRight, resolvePermissionSet } from "../../../utils/misc";
import { AppRoutes, RouteData } from "../../../utils/routes";
import DropdownButtonWithAPortal from "../../utils/DropdownButtonWithAPortal";
import { DebugJsonViewer } from "../../utils/JsonViewer";

export const InstanceListNext = () => {
    const history = useHistory();
    const { user } = useContext(GeneralContext);

    const canCreate = useMemo(
        () => !!(resolvePermissionSet(user).instanceManagerRights & InstanceManagerRights.Create),
        [user]
    );

    return (
        <Card body>
            <div className="d-flex justify-content-sm-between flex-column flex-sm-row">
                <div>
                    <h2>
                        <FormattedMessage id="view.instance.list.title" />
                    </h2>
                </div>
                <div className="d-flex align-items-center">
                    <Button
                        variant="success"
                        onClick={() => {
                            history.push(
                                AppRoutes.instancecreate.link ?? AppRoutes.instancecreate.route
                            );
                        }}
                        disabled={!canCreate}>
                        <div className="d-flex align-items-center" style={{ gap: "1rem" }}>
                            <FontAwesomeIcon icon={faPlus} />
                            <div className="d-none d-md-block">
                                <FormattedMessage id="routes.instancecreate" />
                            </div>
                        </div>
                    </Button>
                </div>
            </div>
            <InstanceListContent />
        </Card>
    );
};

const InstanceListContent = () => {
    // TODO context instance list so that it can be mutated by the child component!!!
    const [instanceList, setInstanceList] = useState<PaginatedInstanceResponse | undefined>();
    const [page, setPage] = useState(1);

    useEffect(() => {
        // is the err handler here really needed? axios error trigger blocks this already >:(
        InstanceClient.listInstances({ page })
            .then(r => {
                if (r.code !== StatusCode.OK) {
                    // TODO error handler
                    console.error(r);
                    return;
                }
                setInstanceList(r.payload);
            })
            .catch(e => {
                // TODO error handler
                console.error(e);
            });
    }, [page]);

    return (
        <div className="d-flex flex-column" style={{ gap: "1rem" }}>
            <DebugJsonViewer obj={instanceList} />
            {/* intentional no-body, i want the squircle border */}
            <Card>
                <Table striped hover responsive className="mb-0">
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
                                {/* <FormattedMessage id="generic.online" /> */}
                                Status
                            </th>
                            <th>
                                <div className="d-flex justify-content-center">
                                    <FontAwesomeIcon icon={faGear} />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* TODO fake instance item */}
                        {instanceList?.content.map(instance => (
                            <InstanceItem instance={instance} key={instance.id} />
                        ))}
                    </tbody>
                </Table>
            </Card>
            <div className="d-flex justify-content-between">
                <div className="d-flex align-items-end">
                    <p>
                        Showing {Math.max((page - 1) * (instanceList?.pageSize || 10) + 1, 1)}-
                        {Math.min(
                            page * (instanceList?.pageSize || 10),
                            instanceList?.totalItems || 100
                        )}{" "}
                        of {instanceList?.totalItems || 100}
                    </p>
                </div>
                <PaginationNext onPageChange={setPage} maxPage={instanceList?.totalPages} />
            </div>
        </div>
    );
};

const InstanceItem = ({ instance }: { instance: InstanceResponse }) => {
    const history = useHistory();
    const { user } = useContext(GeneralContext);
    const [isR, setisR] = useState<InstanceResponse>(instance);
    const [isTryingToDetatch, setIsTryingToDetatch] = useState(false);
    const [isDoingPowerOp, setIsDoingPowerOp] = useState(false);

    useEffect(() => {
        setisR(instance);
    }, [instance]);

    const canOnline = useMemo(
        () =>
            !!(resolvePermissionSet(user).instanceManagerRights & InstanceManagerRights.SetOnline),
        [user]
    );

    // const canGrant = useMemo(
    //     () =>
    //         hasInstanceManagerRight(
    //             resolvePermissionSet(user),
    //             InstanceManagerRights.GrantPermissions
    //         ),
    //     [user]
    // );

    const canDetach = useMemo(
        () => hasInstanceManagerRight(resolvePermissionSet(user), InstanceManagerRights.Delete),
        [user]
    );

    return (
        <tr>
            {/* i shouldnt do this :) */}
            {createPortal(
                <Modal
                    show={isTryingToDetatch}
                    onHide={() => {
                        setIsTryingToDetatch(false);
                    }}>
                    <Modal.Header>
                        <Modal.Title>Delete Instance</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete instance: <b>{isR.name}</b>?
                    </Modal.Body>
                    <Modal.Footer className="justify-content-between">
                        <Button
                            variant="outline-secondary"
                            onClick={() => {
                                setIsTryingToDetatch(false);
                            }}>
                            Cancel
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
                                        // somehow trigger this cmp parent to rerender :(
                                    })
                                    .catch(e => {
                                        console.error(e);
                                    })
                                    .finally(() => {
                                        setIsDoingPowerOp(false);
                                        setIsTryingToDetatch(false);
                                    });
                            }}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>,
                document.body,
                `${isR.id}-modal`
            )}
            <th>{isR.id}</th>
            <th>
                <a
                    href="#"
                    onClick={() => {
                        RouteData.selectedinstanceid = isR.id;
                        history.push(AppRoutes.instanceedit.link ?? AppRoutes.instanceedit.route);
                    }}>
                    {isR.name}
                </a>
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
                        onClick={() => {
                            RouteData.selectedinstanceid = isR.id;
                            history.push(
                                AppRoutes.instanceedit.link ?? AppRoutes.instanceedit.route
                            );
                        }}>
                        Access
                    </Dropdown.Item>
                    <Dropdown.Item
                        onClick={() => {
                            setIsDoingPowerOp(true);
                            InstanceClient.editInstance({
                                id: instance.id,
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
                        {isR.online ? "Disable" : "Enable"}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                        disabled={!canDetach || isDoingPowerOp}
                        onClick={() => {
                            setIsTryingToDetatch(true);
                        }}
                        style={{ color: "var(--red-ish)" }}>
                        Delete
                    </Dropdown.Item>
                </DropdownButtonWithAPortal>
            </th>
        </tr>
    );
};

type PaginationProps = {
    onPageChange?: React.Dispatch<React.SetStateAction<number>>;
    /// Current Page. Set with onPageChange to make this controlled
    page?: number;
    maxPage?: number;
};

/**
 * Pagination but better. (Will move to its on file once done)
 *
 * Creates skip-arrows when pages are more than 6
 *
 * Internally handles page counting, you can manually the state by setting page and listening to onPageChange.
 */
const PaginationNext = ({ onPageChange = () => {}, page = 1, maxPage = 1 }: PaginationProps) => {
    const [myPage, setMyPage] = useState(page);

    const setPage = useCallback(
        (newP: number) => {
            newP = Math.min(Math.max(newP, 1), maxPage);
            onPageChange(newP);
            setMyPage(newP);
        },
        [maxPage, onPageChange]
    );

    const isAValidSalad = (newP: number) => newP === Math.min(Math.max(newP, 1), maxPage);

    useEffect(() => {
        setPage(page);
    }, [page, setPage]);

    const shouldMakePointyArrows = maxPage > 6;
    return (
        <Pagination>
            {!!shouldMakePointyArrows && (
                <Pagination.First
                    onClick={() => {
                        setPage(1);
                    }}
                />
            )}
            <Pagination.Prev
                disabled={!isAValidSalad(myPage - 1)}
                onClick={() => {
                    setPage(myPage - 1);
                }}
            />
            {isAValidSalad(myPage - 2) && <Pagination.Item>{myPage - 2}</Pagination.Item>}
            {isAValidSalad(myPage - 1) && <Pagination.Item>{myPage - 1}</Pagination.Item>}
            <Pagination.Item active>{myPage}</Pagination.Item>
            {isAValidSalad(myPage + 1) && <Pagination.Item>{myPage + 1}</Pagination.Item>}
            {isAValidSalad(myPage + 2) && <Pagination.Item>{myPage + 2}</Pagination.Item>}
            <Pagination.Next
                disabled={!isAValidSalad(myPage + 1)}
                onClick={() => {
                    setPage(myPage + 1);
                }}
            />
            {!!shouldMakePointyArrows && (
                <Pagination.Last
                    onClick={() => {
                        setPage(maxPage);
                    }}
                />
            )}
        </Pagination>
    );
};
