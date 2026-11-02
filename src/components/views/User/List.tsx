/* eslint-disable react/react-in-jsx-scope */

import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useMemo, useState } from "react";
import { Alert } from "react-bootstrap";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/esm/Card";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";

import {
    AdministrationRights,
    PaginatedUserResponse
} from "../../../ApiClient/generatedcode/generated";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import UserClient from "../../../ApiClient/UserClient";
import { GeneralContext } from "../../../contexts/GeneralContext";
import { resolvePermissionSet } from "../../../utils/misc";
import { AppRoutes } from "../../../utils/routes";
import { UserList, UserListLoading } from "../../utils/List/UserList";

export const UserListNext = () => {
    const history = useHistory();
    const { user } = useContext(GeneralContext);

    const [userResponse, setUserResponse] = useState<PaginatedUserResponse | undefined>();
    const [userLoading, setUserLoading] = useState(true); // we dont have use for proper delay :(
    const [page, setPage] = useState(1);

    useEffect(() => {
        setUserLoading(true);
        UserClient.listUsers({ page })
            .then(r => {
                if (r.code !== StatusCode.OK) {
                    console.error(r);
                    setUserResponse({
                        content: [user],
                        pageSize: 1,
                        totalItems: 1,
                        totalPages: 1
                    });
                    return;
                }
                setUserResponse(r.payload);
            })
            .catch(e => {
                console.error(e);
                setUserResponse({
                    content: [user],
                    pageSize: 1,
                    totalItems: 1,
                    totalPages: 1
                });
            })
            .finally(() => {
                setUserLoading(false);
            });
    }, [page, user]);

    const canCreate = useMemo(
        () => !!(resolvePermissionSet(user).administrationRights & AdministrationRights.WriteUsers),
        [user]
    );

    const canRead = useMemo(
        () => !!(resolvePermissionSet(user).administrationRights & AdministrationRights.ReadUsers),
        [user]
    );

    return (
        <div className="d-flex flex-column" style={{ gap: "1rem" }}>
            {!canRead && (
                <Alert variant="warning">
                    <FormattedMessage id="view.user.list.cantlist" />
                </Alert>
            )}
            {/* break in case of emergency -> flex-column flex-sm-row */}
            <div className="d-flex justify-content-sm-between flex-row">
                <div>
                    <h2>
                        <FormattedMessage id="view.user.list.title" />
                    </h2>
                </div>
                <div className="d-flex align-items-center">
                    <Button
                        variant="success"
                        onClick={() => {
                            history.push(AppRoutes.usercreate.link ?? AppRoutes.usercreate.route);
                        }}
                        disabled={!canCreate}>
                        <div className="d-flex align-items-center" style={{ gap: "1rem" }}>
                            <FontAwesomeIcon icon={faUserPlus} />
                            <div className="d-none d-md-block">
                                <FormattedMessage id="routes.usercreate" />
                            </div>
                        </div>
                    </Button>
                </div>
            </div>
            <Card body>
                {!userLoading && userResponse ? (
                    <UserList
                        users={userResponse.content}
                        pagination
                        page={page}
                        onPageChange={setPage}
                        pageSize={userResponse.pageSize}
                        maxPage={userResponse.totalPages}
                        totalItems={userResponse.totalItems}
                    />
                ) : (
                    <UserListLoading />
                )}
            </Card>
        </div>
    );
};

export default UserListNext;
