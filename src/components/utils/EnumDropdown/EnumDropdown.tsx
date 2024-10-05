import { CaretSortIcon } from "@radix-ui/react-icons";
import { FormattedMessage } from "react-intl";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export interface IProps<TEnum> {
    enum: Record<string, string>;
    value: TEnum;
    onChange?: (newValue: TEnum) => void;
    noIntl?: boolean;
}

const EnumDropdown = <TEnum extends string>(props: IProps<TEnum>) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" data-testid="dropdown-button">
                    {props.noIntl ? props.value : <FormattedMessage id={props.value} />}
                    <CaretSortIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent data-testid="dropdown-content">
                {Object.keys(props.enum).map(key => {
                    return (
                        <DropdownMenuItem
                            key={key}
                            onSelect={() => {
                                const newValue = props.enum[key] as TEnum;
                                if (props.onChange) {
                                    props.onChange(newValue);
                                }
                            }}
                            data-testid={`dropdown-item-${key}`}>
                            {props.noIntl ? (
                                props.enum[key]
                            ) : (
                                <FormattedMessage id={props.enum[key]} />
                            )}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default EnumDropdown;
