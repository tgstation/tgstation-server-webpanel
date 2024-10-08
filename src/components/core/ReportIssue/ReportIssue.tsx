import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormattedMessage } from "react-intl";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ReportIssue = () => {
    return (
        <div className="fixed bottom-0 left-0 ml-1 mb-1">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            onClick={() =>
                                window.open(
                                    "https://github.com/tgstation/tgstation-server-webpanel/issues/new"
                                )
                            }>
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <FormattedMessage id="view.report" />
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};

export default ReportIssue;
