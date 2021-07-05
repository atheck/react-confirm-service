import * as Service from "./Service";
import React, { Fragment } from "react";

type State = {
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
};

export type AlertRenderProps = {
    isVisible: boolean,
    message: string,
    duration: number,
    severity: Service.AlertSeverity,
    onClose: () => void,
};

export type ConfirmRenderProps = {
    isOpen: boolean,
    title?: string,
    message: string,
    confirmCaption: string,
    onConfirm: () => void,
    denyCaption: string,
    onDeny: () => void,
};

export type Props = {
    renderAlert: (props: AlertRenderProps) => React.ReactElement,
    renderConfirm: (props: ConfirmRenderProps) => React.ReactElement,
    strings?: {
        yes?: string,
        no?: string,
    },
};

export class ConfirmComponentHost extends React.Component<Props, State> {
    constructor(props: Props) {
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
                callback: () => undefined,
            }
        };
    }

    override componentDidMount(): void {
        Service.initAlerts(this.showAlert, this.showConfirm);
    }

    override componentWillUnmount(): void {
        Service.initAlerts(null, null);
    }

    showAlert = (message: string, severity: Service.AlertSeverity): void => {
        if (this.state.alert.isOpen) {
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

    showConfirm = (title: string | undefined, message: string, callback: (result: boolean) => void, yes?: string, no?: string | null): void => {
        const { strings } = this.props;

        this.setState({
            confirm: {
                isOpen: true,
                title,
                message,
                yesCaption: yes ?? strings?.yes ?? "Yes",
                noCaption: no === undefined ? (strings?.no ?? "No") : no ?? "",
                callback,
            },
        });
    };

    private readonly hideAlert = () => {
        this.setState(prev => ({
            alert: {
                ...prev.alert,
                isOpen: false,
            },
        }));
    };

    private readonly acceptConfirm = () => {
        this.state.confirm.callback(true);
        this.closeConfirmation();
    };

    private readonly denyConfirm = () => {
        this.state.confirm.callback(false);
        this.closeConfirmation();
    };

    private readonly closeConfirmation = () => {
        this.setState(prev => ({
            confirm: {
                ...prev.confirm,
                isOpen: false
            },
        }));
    }

    override render(): React.ReactNode {
        const { alert, confirm } = this.state;
        const autoHideDuration = alert.severity === "success" || alert.severity === "info" ? 3000 : 10000;

        return (
            <Fragment>
                {this.props.renderAlert({
                    isVisible: alert.isOpen,
                    onClose: this.hideAlert,
                    duration: autoHideDuration,
                    severity: alert.severity,
                    message: alert.message,
                })}
                {this.props.renderConfirm({
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
}