import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage } from "react-intl";

import { DistributiveOmit } from "../../utils/misc";
import InputField, {
    defaultValues,
    FieldType,
    InputFieldProps,
    InputFieldTypes
} from "./InputField";

type ExtractValues<T> = T extends T ? T[keyof T] : never;

type FieldsOutput<Fields extends Record<string, InputFormField>> = {
    [Id in keyof Fields]: Fields[Id]["type"] extends FieldType.Number
        ? number
        : Fields[Id]["type"] extends FieldType.Enum
        ? // @ts-expect-error Typescript doesnt seem to support union descrimination in conditional types
          ExtractValues<Fields[Id]["enum"]>
        : Fields[Id]["type"] extends FieldType.Boolean
        ? boolean
        : Fields[Id]["type"] extends FieldType.String
        ? string
        : Fields[Id]["type"] extends FieldType.Password
        ? string
        : never;
};

export type InputFormField = DistributiveOmit<InputFieldProps, "onChange"> & {
    alwaysInclude?: boolean;
};
interface IProps<Fields extends Record<string, InputFormField>> {
    fields: Fields;
    onSave: (fields: FieldsOutput<Fields>) => unknown;
    readOnly?: boolean;
}

interface FieldState {
    invalid?: boolean;
}

export default function InputForm<Fields extends Record<string, InputFormField>>(
    props: IProps<Fields>
): JSX.Element {
    const fieldValueStates = new Map<
        InputFormField,
        [InputFieldTypes, React.Dispatch<React.SetStateAction<InputFieldTypes>>]
    >();
    const fieldStateIds = new Map<string, InputFormField>();
    const [fieldStates, setFieldStates] = useState<Record<string, FieldState | undefined>>({});

    useEffect(() => {
        Object.keys(props.fields).forEach(id => {
            setFieldStates(prevState => ({
                ...prevState,
                [id]: {}
            }));
        });
    }, []);

    Object.entries(props.fields).forEach(([id, field]) => {
        fieldStateIds.set(id, field);
        fieldValueStates.set(
            field,
            useState<InputFieldTypes>(field.defaultValue ?? defaultValues[field.type])
        );
    });

    let anyDiff = false;
    let anyInvalid = false;
    for (const [id, fieldDescriptor] of fieldStateIds) {
        const [fieldValue] = fieldValueStates.get(fieldDescriptor)!;
        const fieldState = fieldStates[id];
        if (fieldDescriptor.defaultValue != fieldValue) anyDiff = true;
        if (fieldState?.invalid) anyInvalid = true;

        if (anyDiff && anyInvalid) break;
    }

    const save = () => {
        const outputObject: Record<string, InputFieldTypes> = {};

        for (const [id, fieldDescriptor] of fieldStateIds) {
            const [fieldValue] = fieldValueStates.get(fieldDescriptor)!;

            if (!fieldDescriptor.alwaysInclude && fieldValue == fieldDescriptor.defaultValue)
                continue;

            outputObject[id] = fieldValue;
        }
        // @ts-expect-error I can't be assed to turn this generic object into the specially crafted output type, its mostly for public api sanity so i dont care
        props.onSave(outputObject);
    };

    return (
        <div>
            {Object.entries(props.fields).map(([id, field]) => {
                const { disabled, ...innerProps } = field;
                return (
                    <InputField
                        key={id}
                        {...innerProps}
                        disabled={props.readOnly || disabled}
                        onChange={(newVal: InputFieldTypes, isValid: boolean) => {
                            fieldValueStates.get(field)![1](newVal);
                            setFieldStates(prevState => ({
                                ...prevState,
                                [id]: {
                                    ...prevState[id],
                                    invalid: !isValid
                                }
                            }));
                        }}
                    />
                );
            })}
            <div className="text-center mt-2">
                <OverlayTrigger
                    overlay={
                        <Tooltip id={`form-invalid`}>
                            <FormattedMessage id="generic.invalid_form" />
                        </Tooltip>
                    }
                    show={anyInvalid ? undefined : false}>
                    <Button
                        variant={props.readOnly || anyInvalid ? "danger" : "success"}
                        disabled={props.readOnly || !anyDiff || anyInvalid}
                        onClick={save}>
                        <FormattedMessage id="generic.save" />
                    </Button>
                </OverlayTrigger>
            </div>
        </div>
    );
}
