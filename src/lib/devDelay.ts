import sleep from "./sleep";

const devDelay = async () => {
    if (import.meta.env.VITE_DEV_MODE) {
        await sleep(import.meta.env.VITE_DEV_DELAY_SECONDS);
    }
};
export default devDelay;
