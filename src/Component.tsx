import React, { useCallback, useEffect, useRef, useState } from "react";
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

interface AlertState {
	isOpen: boolean;
	severity: AlertSeverity;
	message: string;
	duration?: number;
}

interface ConfirmState {
	isOpen: boolean;
	title: string | undefined;
	message: string;
	yesCaption: string;
	noCaption: string;
	callback: (result: boolean) => void;
}

interface ChoiceState {
	isOpen: boolean;
	title: string | undefined;
	options: Option[];
	type: string | undefined;
	cancelCaption: string;
	extra: unknown;
	callback: (result: Option | null) => void;
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
	alertDurations?: Partial<AlertDurations>;
}

type Strings = Props["strings"];

interface HostPart<TRenderProps, TShow> {
	renderProps: TRenderProps;
	show: TShow;
}

const defaultDurations: AlertDurations = {
	info: 3000,
	success: 3000,
	warning: 10_000,
	error: 10_000,
};

function noop(): void {
	// blank
}

const initialAlert: AlertState = {
	isOpen: false,
	severity: "info",
	message: "",
};

const initialConfirm: ConfirmState = {
	isOpen: false,
	title: undefined,
	message: "",
	yesCaption: "",
	noCaption: "",
	callback: noop,
};

const initialChoice: ChoiceState = {
	isOpen: false,
	title: undefined,
	options: [],
	type: undefined,
	cancelCaption: "",
	extra: undefined,
	callback: noop,
};

function createAlertState(message: string, severityOrOptions: AlertSeverity | AlertOptions): AlertState {
	return {
		isOpen: true,
		message,
		severity: typeof severityOrOptions === "string" ? severityOrOptions : severityOrOptions.severity,
		duration: typeof severityOrOptions === "string" ? undefined : severityOrOptions.duration,
	};
}

function createConfirmState(
	{ title, message, yes, no }: ConfirmOptions,
	callback: (result: boolean) => void,
	strings: Strings,
): ConfirmState {
	return {
		isOpen: true,
		title,
		message,
		yesCaption: yes ?? strings?.yes ?? "Yes",
		noCaption: no === undefined ? (strings?.no ?? "No") : (no ?? ""),
		callback,
	};
}

function createChoiceState(options: ChooseOptions, callback: (result: Option | null) => void, strings: Strings): ChoiceState {
	return {
		isOpen: true,
		title: options.title,
		options: options.options,
		type: options.type,
		extra: options.extra,
		cancelCaption: options.cancelCaption ?? strings?.cancel ?? "Cancel",
		callback,
	};
}

/**
 * Returns a ref which holds the value of the latest committed render.
 * Used by the handlers, which are created once but must see current props and state.
 */
function useLatest<TValue>(value: TValue): React.RefObject<TValue> {
	const ref = useRef(value);

	useEffect(() => {
		ref.current = value;
	});

	return ref;
}

/**
 * Returns a function to schedule timeouts which are cleared when the component unmounts.
 */
function useTimeouts(): (callback: () => void, delay: number) => void {
	const timersRef = useRef(new Map<symbol, ReturnType<typeof setTimeout>>());

	useEffect(() => {
		const timers = timersRef.current;

		return () => {
			for (const timer of timers.values()) {
				clearTimeout(timer);
			}

			timers.clear();
		};
	}, []);

	return useCallback((callback: () => void, delay: number): void => {
		const timers = timersRef.current;
		const id = Symbol("timeout");

		timers.set(
			id,
			setTimeout(() => {
				timers.delete(id);
				callback();
			}, delay),
		);
	}, []);
}

function useAlert(alertDurations: Partial<AlertDurations> | undefined): HostPart<AlertRenderProps, Handlers["alert"]> {
	const [alert, setAlert] = useState(initialAlert);
	const isOpenRef = useLatest(alert.isOpen);
	const setTimeoutUntilUnmount = useTimeouts();

	const hideAlert = useCallback((): void => setAlert((prev) => ({ ...prev, isOpen: false })), []);

	const showAlert = useCallback(
		function show(message: string, severityOrOptions: AlertSeverity | AlertOptions): void {
			if (isOpenRef.current) {
				hideAlert();
				setTimeoutUntilUnmount(() => show(message, severityOrOptions), 10);
			} else {
				setAlert(createAlertState(message, severityOrOptions));
			}
		},
		[isOpenRef, hideAlert, setTimeoutUntilUnmount],
	);

	return {
		renderProps: {
			isVisible: alert.isOpen,
			onClose: hideAlert,
			duration: alert.duration ?? alertDurations?.[alert.severity] ?? defaultDurations[alert.severity],
			severity: alert.severity,
			message: alert.message,
		},
		show: showAlert,
	};
}

/**
 * State of a dialog which reports a result through a callback.
 * Returns the current state, a setter and a function which reports the result and closes the dialog.
 */
function useDialog<TState extends { isOpen: boolean; callback: (result: TResult) => void }, TResult>(
	initialState: TState,
): [TState, (state: TState) => void, (result: TResult) => void] {
	const [state, setState] = useState(initialState);

	const close = (result: TResult): void => {
		state.callback(result);
		setState((prev) => ({ ...prev, isOpen: false }));
	};

	return [state, setState, close];
}

function useConfirm(stringsRef: React.RefObject<Strings>): HostPart<ConfirmRenderProps, Handlers["confirm"]> {
	const [confirm, setConfirm, close] = useDialog<ConfirmState, boolean>(initialConfirm);

	const showConfirm = useCallback(
		(options: ConfirmOptions, callback: (result: boolean) => void): void =>
			setConfirm(createConfirmState(options, callback, stringsRef.current)),
		[setConfirm, stringsRef],
	);

	return {
		renderProps: {
			...confirm,
			confirmCaption: confirm.yesCaption,
			onConfirm: () => close(true),
			denyCaption: confirm.noCaption,
			onDeny: () => close(false),
		},
		show: showConfirm,
	};
}

function useChoice(stringsRef: React.RefObject<Strings>): HostPart<ChoiceRenderProps, Handlers["choose"]> {
	const [choice, setChoice, close] = useDialog<ChoiceState, Option | null>(initialChoice);

	const showChoice = useCallback(
		(options: ChooseOptions, callback: (result: Option | null) => void): void =>
			setChoice(createChoiceState(options, callback, stringsRef.current)),
		[setChoice, stringsRef],
	);

	return {
		renderProps: {
			...choice,
			onConfirm: (option: Option) => close(option),
			onCancel: () => close(null),
		},
		show: showChoice,
	};
}

/**
 * Registers the handlers at the service while the component is mounted.
 * The service identifies a host by the handlers object, so it is created only once and keeps its identity.
 * This is safe because the handlers only access refs and state setters.
 */
function useRegisterHandlers(alert: Handlers["alert"], confirm: Handlers["confirm"], choose: Handlers["choose"]): void {
	const [handlers] = useState<Handlers>(() => ({ alert, confirm, choose }));

	useEffect(() => {
		addHandlers(handlers);

		return () => removeHandlers(handlers);
	}, [handlers]);
}

function ConfirmComponentHost({ renderAlert, renderConfirm, renderChoice, strings, alertDurations }: Props): React.ReactNode {
	const stringsRef = useLatest(strings);
	const alert = useAlert(alertDurations);
	const confirm = useConfirm(stringsRef);
	const choice = useChoice(stringsRef);

	useRegisterHandlers(alert.show, confirm.show, choice.show);

	return (
		<>
			{renderAlert(alert.renderProps)}
			{renderConfirm(confirm.renderProps)}
			{renderChoice?.(choice.renderProps)}
		</>
	);
}

export type { AlertRenderProps, ChoiceRenderProps, ConfirmRenderProps, Props };

export { ConfirmComponentHost };
