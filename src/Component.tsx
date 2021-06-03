import * as Service from "./Service";
import React, { Fragment } from "react";

type State = {
    alertOpen: boolean,
    alertSeverity: Service.AlertSeverity,
    alertMessage: string,
    confirmOpen: boolean,
    confirmTitle: string | undefined,
    confirmMessage: string,
    confirmYesCaption: string,
    confirmNoCaption: string,
    confirmCallback: (result: boolean) => void,
};

export type AlertRenderProps = {
    open: boolean,
    onClose: () => void,
    duration: number,
    severity: Service.AlertSeverity,
    message: string,
};

export type ConfirmRenderProps = {
    open: boolean,
    title?: string,
    message: string,
    onClose: () => void,
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

export class Alerts extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            alertOpen: false,
            alertSeverity: "info",
            alertMessage: "",
            confirmOpen: false,
            confirmTitle: undefined,
            confirmMessage: "",
            confirmYesCaption: "",
            confirmNoCaption: "",
            confirmCallback: () => undefined,
        };
    }

    override componentDidMount(): void {
        Service.initAlerts(this.showAlert, this.showConfirm);
    }

    override componentWillUnmount(): void {
        Service.initAlerts(null, null);
    }

    showAlert = (message: string, severity: Service.AlertSeverity): void => {
        this.setState({ alertOpen: true, alertMessage: message, alertSeverity: severity });
    };

    showConfirm = (title: string | undefined, message: string, callback: (result: boolean) => void, yes?: string, no?: string | null): void => {
        const { strings } = this.props;

        this.setState({
            confirmOpen: true,
            confirmTitle: title,
            confirmMessage: message,
            confirmYesCaption: yes ?? strings?.yes ?? "Yes",
            confirmNoCaption: no === undefined ? (strings?.no ?? "No") : no ?? "",
            confirmCallback: callback,
        });
    };

    private readonly hideAlert = () => {
        this.setState({ alertOpen: false });
    };

    private readonly acceptConfirm = () => {
        this.state.confirmCallback(true);
        this.setState({ confirmOpen: false });
    };

    private readonly denyConfirm = () => {
        this.state.confirmCallback(false);
        this.setState({ confirmOpen: false });
    };

    override render(): React.ReactNode {
        const { alertOpen, alertSeverity, alertMessage, confirmOpen, confirmTitle, confirmMessage, confirmYesCaption, confirmNoCaption } = this.state;
        const autoHideDuration = alertSeverity === "success" || alertSeverity === "info" ? 3000 : 10000;

        return (
            <Fragment>
                {this.props.renderAlert({
                    open: alertOpen,
                    onClose: this.hideAlert,
                    duration: autoHideDuration,
                    severity: alertSeverity,
                    message: alertMessage,
                })}
                {this.props.renderConfirm({
                    open: confirmOpen,
                    title: confirmTitle,
                    message: confirmMessage,
                    onClose: this.denyConfirm,
                    confirmCaption: confirmYesCaption,
                    onConfirm: this.acceptConfirm,
                    denyCaption: confirmNoCaption,
                    onDeny: this.denyConfirm,
                })}
            </Fragment>
        );
    }
}