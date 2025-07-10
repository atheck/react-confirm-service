import React, { Fragment } from "react";
import {
	type AlertOptions,
	type AlertSeverity,
	addHandlers,
	type ChooseOptions,
	type ConfirmOptions,
	type Handlers,
	type Option,
	removeHandlers,
} from "./Service";

interface State {
	alert: {
		isOpen: boolean;
		severity: AlertSeverity;
		message: string;
		duration?: number;
	};
	confirm: {
		isOpen: boolean;
		title: string | undefined;
		message: string;
		yesCaption: string;
		noCaption: string;
		callback: (result: boolean) => void;
	};
	choice: {
		isOpen: boolean;
		title: string | undefined;
		options: Option[];
		type: string | undefined;
		cancelCaption: string;
		extra: unknown;
		callback: (result: Option | null) => void;
	};
}

interface AlertRenderProps {
	isVisible: boolean;
	message: string;
	duration: number;
	severity: AlertSeverity;
	onClose: () => void;
}

interface ConfirmRenderProps {
	isOpen: boolean;
	title?: string;
	message: string;
	confirmCaption: string;
	onConfirm: () => void;
	denyCaption: string;
	onDeny: () => void;
}

interface ChoiceRenderProps {
	isOpen: boolean;
	title?: string;
	options: Option[];
	type?: string;
	cancelCaption: string;
	extra: unknown;
	onConfirm: (option: Option) => void;
	onCancel: () => void;
}

type AlertDurations = Record<AlertSeverity, number>;

interface Props {
	renderAlert: (props: AlertRenderProps) => React.ReactElement;
	renderConfirm: (props: ConfirmRenderProps) => React.ReactElement;
	renderChoice?: (props: ChoiceRenderProps) => React.ReactElement;
	strings?: {
		yes?: string;
		no?: string;
		cancel?: string;
	};
	alertDurations?: AlertDurations;
}

const defaultDurations: AlertDurations = {
	info: 3000,
	success: 3000,
	warning: 10_000,
	error: 10_000,
};

class ConfirmComponentHost extends React.Component<Props, State> {
	private readonly alert: Handlers;

	public constructor(props: Props) {
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
				callback() {
					// blank
				},
			},
			choice: {
				isOpen: false,
				title: undefined,
				options: [],
				type: undefined,
				cancelCaption: "",
				extra: undefined,
				callback() {
					// blank
				},
			},
		};

		this.alert = {
			alert: this.showAlert,
			confirm: this.showConfirm,
			choose: this.showChoice,
		};
	}

	public override componentDidMount(): void {
		addHandlers(this.alert);
	}

	public override componentWillUnmount(): void {
		removeHandlers(this.alert);
	}

	public override render(): React.ReactNode {
		const { alert, confirm, choice } = this.state;
		const { renderAlert, renderConfirm, renderChoice, alertDurations } = this.props;
		const autoHideDuration = alert.duration ?? alertDurations?.[alert.severity] ?? defaultDurations[alert.severity];

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
					...confirm,
					confirmCaption: confirm.yesCaption,
					onConfirm: this.acceptConfirm,
					denyCaption: confirm.noCaption,
					onDeny: this.denyConfirm,
				})}
				{renderChoice?.({
					...choice,
					onConfirm: this.confirmChoice,
					onCancel: this.cancelChoice,
				})}
			</Fragment>
		);
	}

	private readonly showAlert = (message: string, severityOrOptions: AlertSeverity | AlertOptions): void => {
		const { alert } = this.state;

		if (alert.isOpen) {
			this.hideAlert();

			setTimeout(() => this.showAlert(message, severityOrOptions), 10);
		} else {
			this.setState({
				alert: {
					isOpen: true,
					message,
					severity: typeof severityOrOptions === "string" ? severityOrOptions : severityOrOptions.severity,
					duration: typeof severityOrOptions === "string" ? undefined : severityOrOptions.duration,
				},
			});
		}
	};

	private readonly showConfirm = ({ title, message, yes, no }: ConfirmOptions, callback: (result: boolean) => void): void => {
		const { strings } = this.props;

		this.setState({
			confirm: {
				isOpen: true,
				title,
				message,
				yesCaption: yes ?? strings?.yes ?? "Yes",
				noCaption: no === undefined ? (strings?.no ?? "No") : (no ?? ""),
				callback,
			},
		});
	};

	private readonly hideAlert = (): void => {
		this.setState((prev) => ({
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
		this.setState((prev) => ({
			confirm: {
				...prev.confirm,
				isOpen: false,
			},
		}));
	};

	private readonly showChoice = (props: ChooseOptions, callback: (option: Option | null) => void): void => {
		const { strings } = this.props;

		this.setState({
			choice: {
				isOpen: true,
				title: props.title,
				options: props.options,
				type: props.type,
				extra: props.extra,
				cancelCaption: props.cancelCaption ?? strings?.cancel ?? "Cancel",
				callback,
			},
		});
	};

	private readonly confirmChoice = (option: Option): void => {
		const { choice } = this.state;

		choice.callback(option);

		this.setState((prev) => ({
			choice: {
				...prev.choice,
				isOpen: false,
			},
		}));
	};

	private readonly cancelChoice = (): void => {
		const { choice } = this.state;

		choice.callback(null);

		this.setState((prev) => ({
			choice: {
				...prev.choice,
				isOpen: false,
			},
		}));
	};
}

export type { AlertRenderProps, ConfirmRenderProps, ChoiceRenderProps, Props };

export { ConfirmComponentHost };
