export type AlertSeverity = "error" | "warning" | "info" | "success";
export type AlertFunc = (message: string, severity: AlertSeverity) => void;
export type ConfirmFunc = (title: string | undefined, message: string, callback: (result: boolean) => void, yes?: string, no?: string | null) => void;
export type ChooseFunc = (props: ChooseOptions, callback: (result: Option | null) => void) => void;

export interface ConfirmOptions {
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

export interface Option {
    key: string | number,
}

export interface ChooseOptions<TData extends Option = Option> {
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

export function initAlerts (alert: AlertFunc | null, confirm: ConfirmFunc | null, choose: ChooseFunc | null): void {
    globalAlert = alert;
    globalConfirm = confirm;
    globalChoose = choose;
}

export const ConfirmService = {
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
                globalConfirm(options.title, options.message, result => {
                    if (result) {
                        resolve();
                    } else {
                        reject(new Error("Canceled"));
                    }
                }, options.yes, options.no);
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