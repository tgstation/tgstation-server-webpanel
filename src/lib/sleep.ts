const sleep = (delay: number) =>
    new Promise<void>(resolve => {
        setTimeout(() => resolve(), delay);
    });

export default sleep;
