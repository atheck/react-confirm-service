export type AlertSeverity = "error" | "warning" | "info" | "success";
export type AlertFunc = (message: string, severity: AlertSeverity) => void;
export type ConfirmFunc = (title: string | undefined, message: string, callback: (result: boolean) => void, yes?: string, no?: string | null) => void;
export type ConfirmOptions = {
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
};

let globalAlert: AlertFunc | null;
let globalConfirm: ConfirmFunc | null;

export const initAlerts = (alert: AlertFunc | null, confirm: ConfirmFunc | null): void => {
    globalAlert = alert;
    globalConfirm = confirm;
};

export const ConfirmService = {
    /**
     * Shows an alert.
     * @param message The message of the alert.
     * @param severity The severity of the alert.
     */
    alert: (message: string, severity: AlertSeverity): void => {
        if (globalAlert) {
            globalAlert(message, severity);
        }
    },
    /**
     * Shows a confirmation.
     * @param options The options for the confirmation.
     */
    confirm: (options: ConfirmOptions): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (globalConfirm) {
                globalConfirm(options.title, options.message, result => {
                    if (result) {
                        resolve();
                    } else {
                        reject();
                    }
                }, options.yes, options.no);
            } else {
                return reject();
            }
        });
    },
};