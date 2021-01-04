declare module "*.scss" {
    const content: { [className: string]: string };
    // noinspection JSDuplicatedDeclaration
    export default content;
}

declare module "*.svg" {
    const content: string;
    export default content;
}
