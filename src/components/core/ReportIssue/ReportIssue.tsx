import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormattedMessage } from "react-intl";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ReportIssue = () => {
    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            className="report-issue"
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
        </>
    );
};

export default ReportIssue;
