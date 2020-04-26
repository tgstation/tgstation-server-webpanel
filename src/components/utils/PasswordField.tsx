import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import ReactIsCapsLockActive from '@matsun/reactiscapslockactive';
import ColouredField, { ColourMode } from './ColouredField';

interface IOwnProps {
    value: string;
    placeholder: string;
    name: string;
    minumumLength?: number;

    onChange(event: React.ChangeEvent<HTMLInputElement>): void;
}

interface IState {
    focused: boolean;
}

type IProps = IOwnProps & InjectedIntlProps;

class PasswordField extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);

        this.state = {
            focused: false
        };
    }

    public render(): React.ReactNode {
        return (
            <ReactIsCapsLockActive>
                {(active: boolean) => {
                    const capsLockWarning = active && this.state.focused;
                    let placeholder = this.props.placeholder;
                    if (capsLockWarning)
                        placeholder = `${placeholder} (${this.props.intl.formatMessage(
                            { id: 'password.capslock' }
                        )})`;

                    const mode =
                        this.props.minumumLength == null ||
                        this.props.value.length >= this.props.minumumLength
                            ? capsLockWarning
                                ? ColourMode.Yellow
                                : ColourMode.Normal
                            : ColourMode.Red;
                    return (
                        <ColouredField
                            type="password"
                            mode={mode}
                            onBlur={this.onBlur}
                            onFocus={this.onFocus}
                            placeholder={placeholder}
                            value={this.props.value}
                            name={name}
                            onChange={this.props.onChange}
                        />
                    );
                }}
            </ReactIsCapsLockActive>
        );
    }

    private onBlur(): void {
        this.setState({ focused: false });
    }

    private onFocus(): void {
        this.setState({ focused: true });
    }
}

export default injectIntl(PasswordField);
