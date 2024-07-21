import React, { Suspense } from "react";
import Spinner, { SpinnerProps } from "react-bootstrap/Spinner";
import { FormattedMessage } from "react-intl";

const CssTransitionGroup = React.lazy(() => import("./CssTransitionGroup"));

type IProps = SpinnerProps & {
    animation: "border" | "grow";
    center: boolean;
    width: number;
    widthUnit: string;
    className?: string;
    text?: string;
    noIntl?: boolean;
};

interface IState {}

export default class Loading extends React.Component<IProps, IState> {
    public static defaultProps = {
        animation: "border",
        width: "50",
        widthUnit: "vmin",
        center: true
    };

    public render(): React.ReactNode {
        return (
            <Suspense fallback={this.renderSpinner()}>
                <CssTransitionGroup>{this.renderSpinner()}</CssTransitionGroup>
            </Suspense>
        );
    }

    private renderSpinner(): NonNullable<React.ReactNode> {
        const {
            variant,
            animation,
            center,
            className,
            width,
            widthUnit,
            text,
            children,
            ...otherprops
        } = this.props;
        const styles: React.CSSProperties = {
            width: `${width}${widthUnit}`,
            height: `${width}${widthUnit}`
        } as React.CSSProperties;

        return (
            <div className={center ? "text-center" : ""}>
                <Spinner
                    variant={variant ? variant : "secondary"}
                    className={center ? `d-block mx-auto ${className ?? ""}` : className}
                    style={styles}
                    animation={animation ? animation : "border"}
                    {...otherprops}
                />
                {text ? this.props.noIntl ? text : <FormattedMessage id={text} /> : ""}
                {children}
            </div>
        );
    }
}
