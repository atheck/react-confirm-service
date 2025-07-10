type AlertSeverity = "error" | "warning" | "info" | "success";
type AlertFunc = (message: string, severityOrOptions: AlertSeverity | AlertOptions) => void;
type ConfirmFunc = (options: ConfirmOptions, callback: (result: boolean) => void) => void;
type ChooseFunc = (props: ChooseOptions, callback: (result: Option | null) => void) => void;

interface AlertOptions {
    /**
     * The severity of the alert.
     */
    severity: AlertSeverity,
    /**
     * The duration of the alert in milliseconds.
     */
    duration?: number,
}

interface ConfirmOptions {
    /**
     * The title of the confirmation.
     * @type {string}
     */
    title?: string,
    /**
     * The message.
     * @type {string}
     */
    message: string,
    /**
     * Caption of the button to accept the confirmation.
     * @type {string}
     */
    yes?: string,
    /**
     * Caption of the button to deny the confirmation. If it is null, the button is not available.
     * @type {(string | null)}
     */
    no?: string | null,
}

interface Option {
    key: string | number,
}

interface ChooseOptions<TData extends Option = Option> {
    /**
     * The title of the choice.
     * @type {string}
     */
    title?: string,
    /**
     * The list of selectable options.
     */
    options: TData [],
    /**
     * The optional type of the options to distinguish when rendering.
     * @type {string}
     */
    type?: string,
    /**
     * The optional caption of the cancel action.
     */
    cancelCaption?: string,
    /**
     * Optional custom data.
     */
    extra?: unknown,
}

interface Handlers {
    alert: AlertFunc,
    confirm: ConfirmFunc,
    choose: ChooseFunc,
}

const globalHandlers: Handlers [] = [];

function addHandlers (handlers: Handlers): void {
    removeHandlers(handlers);
    globalHandlers.push(handlers);
}

function removeHandlers (handlers: Handlers): void {
    const index = globalHandlers.indexOf(handlers);

    if (index !== -1) {
        globalHandlers.splice(index, 1);
    }
}

function getCurrentHandlers (): Handlers | undefined {
    return globalHandlers.at(-1);
}

const ConfirmService = {
    /**
     * Shows an alert.
     * @param message The message of the alert.
     * @param severityOrOptions The severity of the alert or an options object.
     */
    alert (this: void, message: string, severityOrOptions: AlertSeverity | AlertOptions): void {
        const handlers = getCurrentHandlers();

        if (!handlers) {
            throw new Error("ConfirmService is not initialized.");
        }

        handlers.alert(message, severityOrOptions);
    },
    /**
     * Shows a confirmation.
     * @param options The options for the confirmation.
     */
    async confirm (this: void, options: ConfirmOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            const handlers = getCurrentHandlers();

            if (!handlers) {
                reject(new Error("ConfirmService is not initialized."));

                return;
            }

            handlers.confirm(options, result => {
                if (result) {
                    resolve();
                } else {
                    reject(new Error("Canceled"));
                }
            });
        });
    },

    /**
     * Shows a selection.
     * @param options The options of the choice.
     * @returns Resolves if a choice was selected, otherwise rejects the promise.
     */
    async choose<TData extends Option> (this: void, options: ChooseOptions<TData>): Promise<TData> {
        return new Promise<TData>((resolve, reject) => {
            const handlers = getCurrentHandlers();

            if (!handlers) {
                reject(new Error("ConfirmService is not initialized."));

                return;
            }

            handlers.choose(options as ChooseOptions, result => {
                if (result) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- We have to cast this
                    resolve(result as TData);
                } else {
                    reject(new Error("Canceled"));
                }
            });
        });
    },
};

export type {
    AlertSeverity,
    Handlers,
    AlertOptions,
    ConfirmOptions,
    Option,
    ChooseOptions,
};

export {
    addHandlers,
    removeHandlers,
    ConfirmService,
};