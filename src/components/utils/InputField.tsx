import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage } from "react-intl";

export type AnyEnum = {
    [key: string]: string | number;
    [index: number]: string;
};

export enum FieldType {
    Boolean = "boolean",
    Number = "number",
    String = "string",
    Password = "password",
    Enum = "enum"
}

export type InputFieldTypes = number | string | boolean;

export type InputFieldProps = {
    name: string;
    disabled?: boolean;
    tooltip?: string;
    type: FieldType;
} & (
    | {
          defaultValue?: boolean;
          onChange: (newValue: boolean, isValid: boolean) => unknown;
          type: FieldType.Boolean;
      }
    | {
          defaultValue?: number;
          onChange: (newValue: number, isValid: boolean) => unknown;
          type: FieldType.Number;
          min?: number;
          max?: number;
      }
    | {
          defaultValue?: string;
          onChange: (newValue: string, isValid: boolean) => unknown;
          type: FieldType.String;
      }
    | {
          defaultValue?: string;
          onChange: (newValue: string, isValid: boolean) => unknown;
          type: FieldType.Password;
      }
    | {
          defaultValue: string | number;
          onChange: (newValue: string, isValid: boolean) => unknown;
          type: FieldType.Enum;
          enum: AnyEnum;
      }
);

interface ControlProps {
    value: InputFieldTypes;
    onChange: (newvalue: InputFieldTypes) => unknown;
    disabled?: boolean;
    name: string;
}

const StringControl = React.forwardRef<HTMLInputElement, ControlProps>(function StringControl(
    props,
    ref
): JSX.Element {
    return (
        <Form.Control
            value={props.value as string}
            onChange={e => props.onChange(e.target.value)}
            disabled={props.disabled}
            ref={ref}
        />
    );
});

const PasswordControl = React.forwardRef<HTMLInputElement, ControlProps>(function PasswordControl(
    props,
    ref
): JSX.Element {
    return (
        <Form.Control
            value={props.value as string}
            onChange={e => props.onChange(e.target.value)}
            disabled={props.disabled}
            type="password"
            ref={ref}
        />
    );
});

const BooleanControl = React.forwardRef<HTMLInputElement, ControlProps>(function BooleanControl(
    props,
    ref
): JSX.Element {
    const rndId = Math.random().toString();
    return (
        <label
            htmlFor={rndId}
            className="d-flex m-0 flex-grow-1 justify-content-center align-content-center">
            <Form.Check
                id={rndId}
                checked={props.value as boolean}
                onChange={e => props.onChange(e.target.checked)}
                type="switch"
                className="m-auto"
                disabled={props.disabled}
                ref={ref}
            />
        </label>
    );
});

type NumberControlProps = ControlProps & {
    min?: number;
    max?: number;
};
const NumberControl = React.forwardRef<HTMLInputElement, NumberControlProps>(function NumberControl(
    props,
    ref
): JSX.Element {
    return (
        <Form.Control
            value={props.value as number}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                props.onChange(
                    isNaN(e.target.valueAsNumber) ? e.target.value : e.target.valueAsNumber
                )
            }
            disabled={props.disabled}
            min={props.min}
            max={props.max}
            type="number"
            ref={ref}
        />
    );
});

type EnumControlProps = ControlProps & {
    enum: AnyEnum;
};
const EnumControl = React.forwardRef<HTMLSelectElement, EnumControlProps>(function EnumControl(
    props,
    ref
): JSX.Element {
    return (
        <Form.Control
            value={props.value as string}
            onChange={e => props.onChange(parseInt(e.target.value))}
            disabled={props.disabled}
            as="select"
            custom
            ref={ref}>
            {Object.entries(props.enum)
                //filters out reverse mapping
                .filter(([key]) => isNaN(parseInt(key)))
                .map(([key, value]) => {
                    return (
                        <FormattedMessage id={`${props.name}.${key}`} key={key}>
                            {message => (
                                <option key={value} value={value}>
                                    {message}
                                </option>
                            )}
                        </FormattedMessage>
                    );
                })}
        </Form.Control>
    );
});

export const defaultValues: Record<FieldType, InputFieldTypes> = {
    [FieldType.Enum]: 0,
    [FieldType.Number]: 0,
    [FieldType.Boolean]: false,
    [FieldType.String]: "",
    [FieldType.Password]: ""
};

export default function InputField(props: InputFieldProps): JSX.Element {
    const [currentValue, setCurrentValue] = useState(
        props.defaultValue ?? defaultValues[props.type]
    );
    const controlRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        setCurrentValue(props.defaultValue ?? defaultValues[props.type]);
    }, [props.defaultValue]);
    useEffect(() => {
        if (controlRef.current) {
            if (controlRef.current.checkValidity()) {
                controlRef.current.classList.remove("is-invalid");
            } else {
                controlRef.current.classList.add("is-invalid");
            }
        }
        onChange(currentValue);
    }, [currentValue]);

    const onChange = (newValue: InputFieldTypes) => {
        switch (props.type) {
            case FieldType.Boolean:
                props.onChange(newValue as boolean, controlRef.current?.checkValidity() ?? true);
                return;
            case FieldType.Number:
                props.onChange(newValue as number, controlRef.current?.checkValidity() ?? true);
                return;
            case FieldType.String:
            case FieldType.Password:
            case FieldType.Enum:
                props.onChange(newValue as string, controlRef.current?.checkValidity() ?? true);
                return;
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

    const basicControls: {
        [Property in typeof props.type]: Property extends FieldType.Enum | FieldType.Number
            ? undefined
            : React.FC<ControlProps>;
    } = {
        string: StringControl,
        password: PasswordControl,
        boolean: BooleanControl,
        [FieldType.Number]: undefined,
        [FieldType.Enum]: undefined
    };

    const changed = currentValue != props.defaultValue ?? defaultValues[props.type];

    return (
        <InputGroup>
            <OverlayTrigger
                overlay={tooltip(props.tooltip)}
                show={props.tooltip ? undefined : false}>
                {({ ref, ...triggerHandler }) => (
                    <InputGroup.Prepend className="w-40">
                        <InputGroup.Text className="flex-grow-1" {...triggerHandler}>
                            <span className={changed ? "font-weight-bold" : ""}>
                                <FormattedMessage id={props.name} />
                            </span>
                            {props.tooltip ? (
                                <div className="ml-auto" ref={ref}>
                                    <FontAwesomeIcon icon="info" />
                                </div>
                            ) : null}
                        </InputGroup.Text>
                    </InputGroup.Prepend>
                )}
            </OverlayTrigger>
            {props.type === FieldType.Number ? (
                <NumberControl
                    value={currentValue}
                    onChange={newValue => setCurrentValue(newValue)}
                    name={props.name}
                    disabled={props.disabled}
                    max={props.max}
                    min={props.min}
                    ref={controlRef}
                />
            ) : props.type === FieldType.Enum ? (
                <EnumControl
                    value={currentValue}
                    onChange={newValue => setCurrentValue(newValue)}
                    name={props.name}
                    enum={props.enum}
                    disabled={props.disabled}
                />
            ) : (
                React.createElement<ControlProps & React.RefAttributes<HTMLInputElement>>(
                    basicControls[props.type],
                    {
                        value: currentValue,
                        onChange: newValue => setCurrentValue(newValue),
                        disabled: props.disabled,
                        name: props.type,
                        ref: controlRef
                    }
                )
            )}

            <InputGroup.Append>
                <Button
                    style={{ visibility: !changed || props.disabled ? "hidden" : undefined }}
                    variant="danger"
                    onClick={() =>
                        setCurrentValue(props.defaultValue ?? defaultValues[props.type])
                    }>
                    <FontAwesomeIcon icon="undo" />
                </Button>
            </InputGroup.Append>
        </InputGroup>
    );
}
