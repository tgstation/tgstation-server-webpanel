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
import { ChangeEventHandler } from "react";
import { FormattedMessage } from "react-intl";

interface IProps {
    onChange?: ChangeEventHandler<HTMLInputElement>;
    label: string;
    tooltip?: string;
}

const InputGroup = (props: IProps) => {
    return (
        <div className="flex rounded-lg shadown-sm">
            <Label className="px-4 inline-flex items-center min-w-fit rounded-s-md border border-e-0 text-sm text-gray-500">
                <FormattedMessage id={props.label} />
                {props.tooltip ? (
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
                ) : null}
            </Label>
            <Input onChange={props.onChange} />
        </div>
    );
};

export default InputGroup;
