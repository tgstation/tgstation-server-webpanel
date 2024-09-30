import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEventHandler, HTMLInputTypeAttribute } from "react";
import { FormattedMessage } from "react-intl";

interface IProps {
    onChange?: ChangeEventHandler<HTMLInputElement>;
    label: string;
    tooltip?: string;
    type?: HTMLInputTypeAttribute;
}

const InputGroup = (props: IProps) => {
    return (
        <>
            <div className="px-4 inline-flex justify-between items-center min-w-fit rounded-s-md border border-e-0 text-sm">
                <Label>
                    <FormattedMessage id={props.label} />
                </Label>
                {props.tooltip ? (
                    <div className="items-end">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <FontAwesomeIcon
                                        className="ml-4"
                                        icon={faInfo}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <FormattedMessage id={props.tooltip} />
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                ) : null}
            </div>
            <Input onChange={props.onChange} type={props.type} />
        </>
    );
};

export default InputGroup;
