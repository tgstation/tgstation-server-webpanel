import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Card } from "react-bootstrap";
import Button from "react-bootstrap/esm/Button";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router-dom";

import {
    InstanceManagerRights,
    PaginatedInstanceResponse
} from "../../../ApiClient/generatedcode/generated";
import InstanceClient from "../../../ApiClient/InstanceClient";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import { GeneralContext } from "../../../contexts/GeneralContext";
import { resolvePermissionSet } from "../../../utils/misc";
import { AppRoutes } from "../../../utils/routes";
import { InstanceList, InstanceListLoading } from "../../utils/List";

export const InstanceListPage = () => {
    const history = useHistory();
    const { user } = useContext(GeneralContext);

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

    const canCreate = useMemo(
        () => !!(resolvePermissionSet(user).instanceManagerRights & InstanceManagerRights.Create),
        [user]
    );

    return (
        <div className="d-flex flex-column" style={{ gap: "1rem" }}>
            {/* break in case of emergency -> flex-column flex-sm-row */}
            <div className="d-flex justify-content-sm-between flex-row">
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
            <Card body>
                {instanceList ? (
                    <InstanceList
                        instances={instanceList?.content || []}
                        pagination
                        onPageChange={setPage}
                        maxPage={instanceList?.totalPages}
                        pageSize={instanceList?.pageSize}
                        totalItems={instanceList?.totalItems}
                    />
                ) : (
                    <InstanceListLoading />
                )}
            </Card>
        </div>
    );
};

export default InstanceListPage;
