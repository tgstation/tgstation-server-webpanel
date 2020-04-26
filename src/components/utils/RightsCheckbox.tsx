import * as React from 'react';
import { FormattedMessage } from 'react-intl';

interface IProps<TRight> {
    descriptionId: string;
    rightToChange: TRight;
    currentRights: TRight;

    setRight: (right: TRight, enable: boolean) => void;
}

export default class RightsCheckbox<TRight> extends React.Component<
    IProps<TRight>
> {
    public constructor(props: IProps<TRight>) {
        super(props);

        this.handleCheck = this.handleCheck.bind(this);
    }

    public render(): React.ReactNode {
        return (
            <div className="RightsCheckbox">
                <FormattedMessage id={this.props.descriptionId} />
                <input
                    type="checkbox"
                    checked={
                        (((this.props.currentRights as any) as number) &
                            ((this.props.rightToChange as any) as number)) !=
                        0
                    }
                    onChange={this.handleCheck}
                />
            </div>
        );
    }

    private handleCheck(event: React.ChangeEvent<HTMLInputElement>) {
        const checked = event.target.checked;
        this.props.setRight(this.props.right, checked);
    }
}
