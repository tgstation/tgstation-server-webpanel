import { useEffect } from "react";

interface IProps {
    setBearer: (newBearer: string | null) => void;
}

const Layout = (props: IProps) => {
    useEffect(() => props.setBearer(null));

    return <></>;
};

export default Layout;
