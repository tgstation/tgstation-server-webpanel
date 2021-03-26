import { library } from "@fortawesome/fontawesome-svg-core";
import { faDiscord, faGithub } from "@fortawesome/free-brands-svg-icons";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons/faAngleRight";
import { faBars } from "@fortawesome/free-solid-svg-icons/faBars";
import { faBriefcase } from "@fortawesome/free-solid-svg-icons/faBriefcase";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { faCodeBranch } from "@fortawesome/free-solid-svg-icons/faCodeBranch";
import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";
import { faCogs } from "@fortawesome/free-solid-svg-icons/faCogs";
import { faEdit } from "@fortawesome/free-solid-svg-icons/faEdit";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons/faExclamationCircle";
import { faGripLinesVertical } from "@fortawesome/free-solid-svg-icons/faGripLinesVertical";
import { faHdd } from "@fortawesome/free-solid-svg-icons/faHdd";
import { faHome } from "@fortawesome/free-solid-svg-icons/faHome";
import { faInfo } from "@fortawesome/free-solid-svg-icons/faInfo";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import { faKey } from "@fortawesome/free-solid-svg-icons/faKey";
import { faPen } from "@fortawesome/free-solid-svg-icons/faPen";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { faPlusSquare } from "@fortawesome/free-solid-svg-icons/faPlusSquare";
import { faQuestion } from "@fortawesome/free-solid-svg-icons/faQuestion";
import { faServer } from "@fortawesome/free-solid-svg-icons/faServer";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons/faSignOutAlt";
import { faSync } from "@fortawesome/free-solid-svg-icons/faSync";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { faToolbox } from "@fortawesome/free-solid-svg-icons/faToolbox";
import { faTools } from "@fortawesome/free-solid-svg-icons/faTools";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { faUndo } from "@fortawesome/free-solid-svg-icons/faUndo";
import { faUpload } from "@fortawesome/free-solid-svg-icons/faUpload";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons/faUserPlus";
import { faUserSlash } from "@fortawesome/free-solid-svg-icons/faUserSlash";

export default function (): void {
    library.add(
        faAngleRight,
        faBars,
        faCheck,
        faCodeBranch,
        faCog,
        faCogs,
        faTimes,
        faExclamationCircle,
        faUser,
        faUserPlus,
        faUserSlash,
        faEdit,
        faHdd,
        faSync,
        faServer,
        faSignOutAlt,
        faPlus,
        faPlusSquare,
        faQuestion,
        faHome,
        faTools,
        faToolbox,
        faUndo,
        faInfo,
        faGripLinesVertical,
        faKey,
        faPen,
        faGithub,
        faBriefcase,
        faDiscord,
        faUpload,
        faTrash,
        faInfoCircle
    );
}
