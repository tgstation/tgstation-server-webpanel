import sleep from "./sleep";

const devDelay = async <T>(func: () => Promise<T>, name: string): Promise<T> => {
    if (import.meta.env.VITE_DEV_MODE) {
        console.log(`Dev Delay: ${name}`);
        await sleep(import.meta.env.VITE_DEV_DELAY_SECONDS * 1000);
    }

    return await func();
};
export default devDelay;
