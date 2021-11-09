import React from "react";
import ReactJson from "react-json-view";

import configOptions from "../../ApiClient/util/config";

export default function JsonViewer(props: { obj: unknown }): JSX.Element {
    return (
        <ReactJson
            src={props.obj as Record<string, unknown>}
            name={"JSON"}
            theme="tube"
            iconStyle="triangle"
            collapsed
            displayDataTypes={false}
        />
    );
}

export function DebugJsonViewer(props: { obj: unknown }): JSX.Element {
    if (!configOptions.showjson.value) {
        return <></>;
    }
    return (
        <div className="text-left">
            <JsonViewer obj={props.obj} />
        </div>
    );
}
