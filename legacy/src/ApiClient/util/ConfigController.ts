import configOptions, { BaseConfigOption, ConfigOption, ConfigValue } from "./config";

export default new (class ConfigController {
    public loadconfig() {
        for (const val of Object.values(configOptions)) {
            this.getconfig(val);
        }
        console.log("Configuration loaded", configOptions);
    }

    public saveconfig(newconfig: Partial<typeof configOptions>) {
        for (const [key, val] of Object.entries(newconfig)) {
            this.setconfig(key as keyof typeof configOptions, val);
        }
        console.log("Configuration saved", configOptions);
    }

    private getConfigKey(option: BaseConfigOption): string {
        if (!option.site_local) return option.id;

        return `${window.location.pathname}:${option.id}`;
    }

    private setconfig(key: keyof typeof configOptions, option: ConfigOption) {
        if (option?.value === undefined) return this.deleteconfig(key);

        //safeties
        switch (option.type) {
            case "num": {
                //this parses strings and numbers alike to numbers and refuses non numbers
                //@ts-expect-error //parseInt can take numbers
                const value = parseInt(option.value);
                if (Number.isNaN(option.value)) return;
                if (option.min !== undefined && value < option.min) return;
                if (option.max !== undefined && value > option.max) return;
                option.value = value;
                break;
            }
        }

        if (option.callback) {
            // @ts-expect-error Can't be assed to figure this one out
            option.callback(configOptions[key].value, option.value);
        }
        configOptions[key].value = option.value;
        //configOptions[key].persist = option.persist;

        //if (!option.persist) return this.deleteconfig(key); //idiot proofing, alexkar proofing

        try {
            localStorage.setItem(this.getConfigKey(option), JSON.stringify(option.value));
            //option.persist = true;
        } catch {
            (() => {})(); //noop
        }
    }

    private getconfig(option: ConfigOption): void {
        try {
            const data = localStorage.getItem(this.getConfigKey(option));
            if (data !== undefined && data !== null) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const json = JSON.parse(data);
                if (json !== null && json !== undefined) {
                    option.value = json as ConfigValue;
                }
                //option.persist = true;
            }
        } catch {
            (() => {})(); //noop
        }
    }

    private deleteconfig(key: keyof typeof configOptions): void {
        try {
            const option = configOptions[key];
            localStorage.removeItem(this.getConfigKey(option));
            //option.persist = false;
        } catch {
            (() => {})(); //noop
        }
    }
})();
