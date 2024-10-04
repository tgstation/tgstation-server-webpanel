interface IProps {
    setBearer: (newBearer: string | null) => void;
}

const Router = (props: IProps) => {
    props.setBearer(null); // todo

    return <></>;
};

export default Router;
