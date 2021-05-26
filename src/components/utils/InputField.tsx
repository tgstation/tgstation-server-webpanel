import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage } from "react-intl";

interface IState {
    currentValue: string | boolean | number;
}

type IProps = {
    name: string;
    disabled?: boolean;
    setEditLock?: (value: boolean) => void;
    editLock?: boolean;
    tooltip?: string;
    instantCommit?: boolean;
} & (
    | {
          name: string;
          defaultValue: boolean;
          onChange: (newvalue: boolean) => void;
          type: "bool";
      }
    | {
          name: string;
          defaultValue: number;
          onChange: (newvalue: number) => void;
          type: "num";
      }
    | {
          name: string;
          defaultValue: string;
          onChange: (newvalue: string) => void;
          type: "str";
      }
    | {
          name: string;
          defaultValue: string | number;
          onChange: (newvalue: string) => void;
          type: "enum";
          enum: Record<string, string | number>;
      }
);

export default class InputField extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.state = {
            currentValue: props.defaultValue
        };
    }

    public render(): React.ReactNode {
        const random = Math.random().toString();
        const changed = this.state.currentValue !== this.props.defaultValue;

        const commit = (_value?: string | number | boolean) => {
            const value = _value ?? this.state.currentValue;

            switch (this.props.type) {
                case "str":
                    this.props.onChange(value as string);
                    break;
                case "num":
                    this.props.onChange(value as number);
                    break;
                case "bool":
                    this.props.onChange(value as boolean);
                    break;
                case "enum":
                    this.props.onChange(value as string);
                    break;
            }
        };

        const tooltip = (innerid?: string) => {
            if (!innerid) return <React.Fragment />;

            return (
                <Tooltip id={innerid}>
                    <FormattedMessage id={innerid} />
                </Tooltip>
            );
        };

        return (
            <InputGroup>
                <InputGroup.Prepend className="w-40 flex-grow-1 flex-xl-grow-0 overflow-auto mb-2 mb-xl-0">
                    <OverlayTrigger
                        overlay={tooltip(this.props.tooltip)}
                        show={this.props.tooltip ? undefined : false}>
                        {({ ref, ...triggerHandler }) => (
                            <InputGroup.Text
                                className={`flex-fill ${changed ? "font-weight-bold" : ""}`}
                                {...triggerHandler}>
                                <FormattedMessage id={`fields.${this.props.name}`} />
                                {this.props.tooltip ? (
                                    <div
                                        className={"ml-auto"}
                                        ref={ref as React.Ref<HTMLDivElement>}>
                                        <FontAwesomeIcon fixedWidth icon="info" />
                                    </div>
                                ) : null}
                            </InputGroup.Text>
                        )}
                    </OverlayTrigger>
                </InputGroup.Prepend>
                <div className="flex-grow-1 w-100 w-xl-auto d-flex mb-3 mb-xl-0">
                    {this.props.type === "enum" ? (
                        <select
                            className={`flex-fill mb-0 ${changed ? "font-weight-bold" : ""}`}
                            onChange={event => {
                                if (this.props.setEditLock && !this.props.instantCommit) {
                                    if (
                                        changed &&
                                        event.target.selectedOptions[0].value ===
                                            this.props.defaultValue
                                    ) {
                                        this.props.setEditLock(false);
                                    } else if (
                                        !changed &&
                                        event.target.selectedOptions[0].value !==
                                            this.props.defaultValue
                                    ) {
                                        this.props.setEditLock(true);
                                    }
                                }

                                if (this.props.instantCommit) {
                                    commit(event.target.selectedOptions[0].value);
                                } else {
                                    this.setState({
                                        currentValue: event.target.selectedOptions[0].value
                                    });
                                }
                            }}
                            disabled={this.props.disabled || (!changed && this.props.editLock)}
                            defaultValue={this.props.defaultValue}>
                            {Object.values(this.props.enum)
                                .filter(val => isNaN(parseInt(val as string)))
                                .map(possiblevalue => (
                                    <FormattedMessage
                                        key={possiblevalue}
                                        id={`fields.${this.props.name}.${possiblevalue}`}>
                                        {message => (
                                            <option value={possiblevalue}>{message}</option>
                                        )}
                                    </FormattedMessage>
                                ))}
                        </select>
                    ) : this.props.type === "bool" ? (
                        <label
                            htmlFor={random}
                            className="d-flex justify-content-center align-content-center flex-grow-1 w-100 w-xl-auto mb-0">
                            <Form.Check
                                inline
                                type="switch"
                                custom
                                id={random}
                                className="m-auto"
                                label=""
                                onChange={event => {
                                    if (this.props.setEditLock && !this.props.instantCommit) {
                                        if (
                                            changed &&
                                            event.currentTarget.checked === this.props.defaultValue
                                        ) {
                                            this.props.setEditLock(false);
                                        } else if (
                                            !changed &&
                                            event.currentTarget.checked !== this.props.defaultValue
                                        ) {
                                            this.props.setEditLock(true);
                                        }
                                    }

                                    if (this.props.instantCommit) {
                                        commit(event.currentTarget.checked);
                                    } else {
                                        this.setState({
                                            currentValue: event.currentTarget.checked
                                        });
                                    }
                                }}
                                checked={this.state.currentValue as boolean}
                                disabled={this.props.disabled || (!changed && this.props.editLock)}
                            />
                        </label>
                    ) : (
                        <FormControl
                            custom
                            type={this.props.type === "num" ? "number" : "text"}
                            className={`flex-fill mb-0 ${changed ? "font-weight-bold" : ""}`}
                            onChange={event => {
                                const newValue =
                                    this.props.type == "num"
                                        ? parseInt(event.currentTarget.value)
                                        : event.currentTarget.value;

                                if (this.props.setEditLock && !this.props.instantCommit) {
                                    if (changed && newValue === this.props.defaultValue) {
                                        this.props.setEditLock(false);
                                    } else if (!changed && newValue !== this.props.defaultValue) {
                                        this.props.setEditLock(true);
                                    }
                                }

                                if (this.props.instantCommit) {
                                    commit(newValue);
                                } else {
                                    this.setState({
                                        currentValue: newValue
                                    });
                                }
                            }}
                            value={this.state.currentValue as string | number}
                            disabled={this.props.disabled || (!changed && this.props.editLock)}
                        />
                    )}
                    <React.Fragment>
                        <InputGroup.Append
                            style={
                                !changed
                                    ? {
                                          opacity: 0,
                                          pointerEvents: "none"
                                      }
                                    : {}
                            }
                            onClick={() => {
                                if (this.props.setEditLock) {
                                    this.props.setEditLock(false);
                                }

                                this.setState({
                                    currentValue: this.props.defaultValue
                                });
                            }}>
                            <InputGroup.Text>
                                <FontAwesomeIcon fixedWidth icon="undo" />
                            </InputGroup.Text>
                        </InputGroup.Append>
                        <InputGroup.Append
                            style={
                                !changed
                                    ? {
                                          opacity: 0,
                                          pointerEvents: "none"
                                      }
                                    : {}
                            }
                            onClick={() => {
                                commit();
                            }}>
                            <InputGroup.Text>
                                <FontAwesomeIcon fixedWidth icon="check" />
                            </InputGroup.Text>
                        </InputGroup.Append>
                    </React.Fragment>
                </div>
            </InputGroup>
        );
    }
}
