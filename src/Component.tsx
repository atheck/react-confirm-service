import * as Service from "./Service";
import React, { Fragment } from "react";

interface State {
    alert: {
        isOpen: boolean,
        severity: Service.AlertSeverity,
        message: string,

    },
    confirm: {
        isOpen: boolean,
        title: string | undefined,
        message: string,
        yesCaption: string,
        noCaption: string,
        callback: (result: boolean) => void,
    },
}

export interface AlertRenderProps {
    isVisible: boolean,
    message: string,
    duration: number,
    severity: Service.AlertSeverity,
    onClose: () => void,
}

export interface ConfirmRenderProps {
    isOpen: boolean,
    title?: string,
    message: string,
    confirmCaption: string,
    onConfirm: () => void,
    denyCaption: string,
    onDeny: () => void,
}

export interface Props {
    renderAlert: (props: AlertRenderProps) => React.ReactElement,
    renderConfirm: (props: ConfirmRenderProps) => React.ReactElement,
    strings?: {
        yes?: string,
        no?: string,
    },
}

export class ConfirmComponentHost extends React.Component<Props, State> {
    public constructor (props: Props) {
        super(props);

        this.state = {
            alert: {
                isOpen: false,
                severity: "info",
                message: "",
            },
            confirm: {
                isOpen: false,
                title: undefined,
                message: "",
                yesCaption: "",
                noCaption: "",
                callback () {
                    // blank
                },
            },
        };
    }

    public override componentDidMount (): void {
        Service.initAlerts(this.showAlert, this.showConfirm);
    }

    // eslint-disable-next-line class-methods-use-this
    public override componentWillUnmount (): void {
        Service.initAlerts(null, null);
    }

    public override render (): React.ReactNode {
        const { alert, confirm } = this.state;
        const { renderAlert, renderConfirm } = this.props;
        const autoHideDuration = alert.severity === "success" || alert.severity === "info" ? 3_000 : 10_000;

        return (
            <Fragment>
                {renderAlert({
                    isVisible: alert.isOpen,
                    onClose: this.hideAlert,
                    duration: autoHideDuration,
                    severity: alert.severity,
                    message: alert.message,
                })}
                {renderConfirm({
                    isOpen: confirm.isOpen,
                    title: confirm.title,
                    message: confirm.message,
                    confirmCaption: confirm.yesCaption,
                    onConfirm: this.acceptConfirm,
                    denyCaption: confirm.noCaption,
                    onDeny: this.denyConfirm,
                })}
            </Fragment>
        );
    }

    private readonly showAlert = (message: string, severity: Service.AlertSeverity): void => {
        const { alert } = this.state;

        if (alert.isOpen) {
            this.hideAlert();

            setTimeout(() => this.showAlert(message, severity), 10);
        } else {
            this.setState({
                alert: {
                    isOpen: true,
                    message,
                    severity,
                },
            });
        }
    };

    private readonly showConfirm = (title: string | undefined, message: string, callback: (result: boolean) => void, yes?: string, no?: string | null): void => {
        const { strings } = this.props;

        this.setState({
            confirm: {
                isOpen: true,
                title,
                message,
                yesCaption: yes ?? strings?.yes ?? "Yes",
                noCaption: no === undefined ? strings?.no ?? "No" : no ?? "",
                callback,
            },
        });
    };

    private readonly hideAlert = (): void => {
        this.setState(prev => ({
            alert: {
                ...prev.alert,
                isOpen: false,
            },
        }));
    };

    private readonly acceptConfirm = (): void => {
        const { confirm } = this.state;

        confirm.callback(true);
        this.closeConfirmation();
    };

    private readonly denyConfirm = (): void => {
        const { confirm } = this.state;

        confirm.callback(false);
        this.closeConfirmation();
    };

    private readonly closeConfirmation = (): void => {
        this.setState(prev => ({
            confirm: {
                ...prev.confirm,
                isOpen: false,
            },
        }));
    };
}