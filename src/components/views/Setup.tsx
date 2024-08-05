import React from "react";

import WIPNotice from "../utils/WIPNotice";

type IProps = object;
type IState = object;

export default class Setup extends React.Component<IProps, IState> {
    public render(): React.ReactNode {
        return <WIPNotice />;
    }
}
