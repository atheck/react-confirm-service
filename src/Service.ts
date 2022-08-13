type AlertSeverity = "error" | "warning" | "info" | "success";
type AlertFunc = (message: string, severity: AlertSeverity) => void;
type ConfirmFunc = (options: ConfirmOptions, callback: (result: boolean) => void) => void;
type ChooseFunc = (props: ChooseOptions, callback: (result: Option | null) => void) => void;

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
     * The optional caption of the cancel action.
     */
    cancelCaption?: string,
}

let globalAlert: AlertFunc | null;
let globalConfirm: ConfirmFunc | null;
let globalChoose: ChooseFunc | null;

function initAlerts (alert: AlertFunc | null, confirm: ConfirmFunc | null, choose: ChooseFunc | null): void {
    globalAlert = alert;
    globalConfirm = confirm;
    globalChoose = choose;
}

const ConfirmService = {
    /**
     * Shows an alert.
     * @param message The message of the alert.
     * @param severity The severity of the alert.
     */
    alert (this: void, message: string, severity: AlertSeverity): void {
        if (globalAlert) {
            globalAlert(message, severity);
        } else {
            throw new Error("ConfirmService is not initialized.");
        }
    },
    /**
     * Shows a confirmation.
     * @param options The options for the confirmation.
     */
    async confirm (this: void, options: ConfirmOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            if (globalConfirm) {
                globalConfirm(options, result => {
                    if (result) {
                        resolve();
                    } else {
                        reject(new Error("Canceled"));
                    }
                });
            } else {
                reject(new Error("ConfirmService is not initialized."));
            }
        });
    },

    /**
     * Shows a selection.
     * @param options The options of the choice.
     * @returns Resolves if a choice was selected, otherwise rejects the promise.
     */
    async choose<TData extends Option> (this: void, options: ChooseOptions<TData>): Promise<TData> {
        return new Promise<TData>((resolve, reject) => {
            if (globalChoose) {
                globalChoose(options as ChooseOptions, result => {
                    if (result) {
                        resolve(result as TData);
                    } else {
                        reject(new Error("Canceled"));
                    }
                });
            } else {
                reject(new Error("ConfirmService is not initialized."));
            }
        });
    },
};

export type {
    AlertSeverity,
    ConfirmOptions,
    Option,
    ChooseOptions,
};

export {
    initAlerts,
    ConfirmService,
};