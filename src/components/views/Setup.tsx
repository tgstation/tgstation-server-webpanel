import React from "react";

import { WIPNotice } from "../utils";

interface IProps {}
interface IState {}

export default class Setup extends React.Component<IProps, IState> {
    public render(): React.ReactNode {
        return <WIPNotice />;
    }
}
