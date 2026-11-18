import { act, render } from "@testing-library/react";
import React from "react";
import {
	type AlertRenderProps,
	type ChoiceRenderProps,
	ConfirmComponentHost,
	type ConfirmRenderProps,
	type Props,
} from "./Component";
import { ConfirmService, type Option } from "./Service";

function setup(props: Partial<Props> = {}): {
	renderAlert: jest.Mock<React.ReactElement, [AlertRenderProps]>;
	renderConfirm: jest.Mock<React.ReactElement, [ConfirmRenderProps]>;
	renderChoice: jest.Mock<React.ReactElement, [ChoiceRenderProps]>;
	unmount: () => void;
} {
	const renderAlert = jest.fn((_props: AlertRenderProps) => <div />);
	const renderConfirm = jest.fn((_props: ConfirmRenderProps) => <div />);
	const renderChoice = jest.fn((_props: ChoiceRenderProps) => <div />);

	const { unmount } = render(
		<ConfirmComponentHost renderAlert={renderAlert} renderChoice={renderChoice} renderConfirm={renderConfirm} {...props} />,
	);

	return { renderAlert, renderConfirm, renderChoice, unmount };
}

function renderStrict(): {
	renderAlert: jest.Mock<React.ReactElement, [AlertRenderProps]>;
	renderConfirm: jest.Mock<React.ReactElement, [ConfirmRenderProps]>;
	unmount: () => void;
} {
	const renderAlert = jest.fn((_props: AlertRenderProps) => <div />);
	const renderConfirm = jest.fn((_props: ConfirmRenderProps) => <div />);
	const { unmount } = render(
		<React.StrictMode>
			<ConfirmComponentHost renderAlert={renderAlert} renderConfirm={renderConfirm} />
		</React.StrictMode>,
	);

	return { renderAlert, renderConfirm, unmount };
}

function lastProps<TProps>(mock: jest.Mock<React.ReactElement, [TProps]>): TProps {
	const call = mock.mock.lastCall;

	if (!call) {
		throw new Error("Render function was not called.");
	}

	return call[0];
}

describe("ConfirmComponentHost", () => {
	describe("initial render", () => {
		it("renders everything closed", () => {
			// act
			const { renderAlert, renderConfirm, renderChoice } = setup();

			// assert
			expect(lastProps(renderAlert).isVisible).toBe(false);
			expect(lastProps(renderConfirm).isOpen).toBe(false);
			expect(lastProps(renderChoice).isOpen).toBe(false);
		});

		it("works without renderChoice", () => {
			// arrange
			const renderAlert = jest.fn((_props: AlertRenderProps) => <div />);
			const renderConfirm = jest.fn((_props: ConfirmRenderProps) => <div />);

			// act
			const fails = (): unknown => render(<ConfirmComponentHost renderAlert={renderAlert} renderConfirm={renderConfirm} />);

			// assert
			expect(fails).not.toThrow();
		});
	});

	describe("registration", () => {
		it("throws if no host is mounted", () => {
			// act
			const fails = (): void => ConfirmService.alert("Message", "info");

			// assert
			expect(fails).toThrow("ConfirmService is not initialized.");
		});

		it("unregisters on unmount", () => {
			// arrange
			const { unmount } = setup();

			// act
			unmount();

			// assert
			expect(() => ConfirmService.alert("Message", "info")).toThrow("ConfirmService is not initialized.");
		});

		it("uses the last mounted host", () => {
			// arrange
			const first = setup();
			const second = setup();

			// act
			act(() => ConfirmService.alert("Message", "info"));

			// assert
			expect(lastProps(first.renderAlert).isVisible).toBe(false);
			expect(lastProps(second.renderAlert).isVisible).toBe(true);
		});

		it("falls back to the previous host when the last one is unmounted", () => {
			// arrange
			const first = setup();
			const second = setup();

			second.unmount();

			// act
			act(() => ConfirmService.alert("Message", "info"));

			// assert
			expect(lastProps(first.renderAlert).isVisible).toBe(true);
		});

		it("keeps the order of hosts when a host re-renders", () => {
			// arrange
			const firstRenderAlert = jest.fn((_props: AlertRenderProps) => <div />);
			const renderConfirm = jest.fn((_props: ConfirmRenderProps) => <div />);
			const first = render(<ConfirmComponentHost renderAlert={firstRenderAlert} renderConfirm={renderConfirm} />);
			const second = setup();

			first.rerender(
				<ConfirmComponentHost renderAlert={firstRenderAlert} renderConfirm={renderConfirm} strings={{ yes: "Ja" }} />,
			);

			// act
			act(() => ConfirmService.alert("Message", "info"));

			// assert
			expect(lastProps(firstRenderAlert).isVisible).toBe(false);
			expect(lastProps(second.renderAlert).isVisible).toBe(true);
		});
	});

	describe("strict mode", () => {
		it("registers once and unregisters on unmount", () => {
			// arrange
			const { renderAlert, unmount } = renderStrict();

			act(() => ConfirmService.alert("Message", "info"));

			expect(lastProps(renderAlert).isVisible).toBe(true);

			// act
			unmount();

			// assert
			expect(() => ConfirmService.alert("Message", "info")).toThrow("ConfirmService is not initialized.");
		});

		it("calls the confirm callback only once", async () => {
			// arrange
			const { renderConfirm } = renderStrict();
			const onSettled = jest.fn<undefined, []>();
			let promise: Promise<void> = Promise.resolve();

			act(() => {
				promise = ConfirmService.confirm({ message: "Message" }).then(() => onSettled());
			});

			// act
			act(() => lastProps(renderConfirm).onConfirm());

			// assert
			await promise;
			expect(onSettled).toHaveBeenCalledTimes(1);
			expect(lastProps(renderConfirm).isOpen).toBe(false);
		});
	});

	describe("alert", () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it("shows an alert with a severity", () => {
			// arrange
			const { renderAlert } = setup();

			// act
			act(() => ConfirmService.alert("Message", "warning"));

			// assert
			expect(lastProps(renderAlert)).toStrictEqual(
				expect.objectContaining({
					isVisible: true,
					message: "Message",
					severity: "warning",
					duration: 10_000,
				}),
			);
		});

		it.each([
			["info", 3000],
			["success", 3000],
			["warning", 10_000],
			["error", 10_000],
		] as const)("uses the default duration for %s", (severity, duration) => {
			// arrange
			const { renderAlert } = setup();

			// act
			act(() => ConfirmService.alert("Message", severity));

			// assert
			expect(lastProps(renderAlert).duration).toBe(duration);
		});

		it("uses the alertDurations prop", () => {
			// arrange
			const { renderAlert } = setup({ alertDurations: { info: 1234 } });

			// act
			act(() => ConfirmService.alert("Message", "info"));

			// assert
			expect(lastProps(renderAlert).duration).toBe(1234);
		});

		it("uses the duration from the options", () => {
			// arrange
			const { renderAlert } = setup({ alertDurations: { info: 1234 } });

			// act
			act(() => ConfirmService.alert("Message", { severity: "info", duration: 42 }));

			// assert
			expect(lastProps(renderAlert)).toStrictEqual(expect.objectContaining({ severity: "info", duration: 42 }));
		});

		it("hides the alert on close", () => {
			// arrange
			const { renderAlert } = setup();

			act(() => ConfirmService.alert("Message", "info"));

			// act
			act(() => lastProps(renderAlert).onClose());

			// assert
			expect(lastProps(renderAlert)).toStrictEqual(expect.objectContaining({ isVisible: false, message: "Message" }));
		});

		it("hides an open alert before showing the next one", () => {
			// arrange
			const { renderAlert } = setup();

			act(() => ConfirmService.alert("First", "info"));

			// act
			act(() => ConfirmService.alert("Second", "error"));

			// assert
			expect(lastProps(renderAlert)).toStrictEqual(expect.objectContaining({ isVisible: false, message: "First" }));

			act(() => jest.advanceTimersByTime(10));

			expect(lastProps(renderAlert)).toStrictEqual(
				expect.objectContaining({ isVisible: true, message: "Second", severity: "error" }),
			);
		});

		it("clears a pending alert timer on unmount", () => {
			// arrange
			const { renderAlert, unmount } = setup();

			act(() => ConfirmService.alert("First", "info"));
			act(() => ConfirmService.alert("Second", "info"));

			const callCount = renderAlert.mock.calls.length;

			// act
			unmount();

			// assert
			expect(jest.getTimerCount()).toBe(0);

			act(() => jest.runAllTimers());

			expect(renderAlert).toHaveBeenCalledTimes(callCount);
		});
	});

	describe("confirm", () => {
		it("shows a confirmation with default captions", () => {
			// arrange
			const { renderConfirm } = setup();

			// act
			act(() => {
				ConfirmService.confirm({ title: "Title", message: "Message" }).catch(() => undefined);
			});

			// assert
			expect(lastProps(renderConfirm)).toStrictEqual(
				expect.objectContaining({
					isOpen: true,
					title: "Title",
					message: "Message",
					confirmCaption: "Yes",
					denyCaption: "No",
				}),
			);
		});

		it("uses the strings prop for captions", () => {
			// arrange
			const { renderConfirm } = setup({ strings: { yes: "Ja", no: "Nein" } });

			// act
			act(() => {
				ConfirmService.confirm({ message: "Message" }).catch(() => undefined);
			});

			// assert
			expect(lastProps(renderConfirm)).toStrictEqual(expect.objectContaining({ confirmCaption: "Ja", denyCaption: "Nein" }));
		});

		it("uses updated strings props", () => {
			// arrange
			const renderAlert = jest.fn((_props: AlertRenderProps) => <div />);
			const renderConfirm = jest.fn((_props: ConfirmRenderProps) => <div />);
			const { rerender } = render(
				<ConfirmComponentHost renderAlert={renderAlert} renderConfirm={renderConfirm} strings={{ yes: "Ja" }} />,
			);

			rerender(<ConfirmComponentHost renderAlert={renderAlert} renderConfirm={renderConfirm} strings={{ yes: "Oui" }} />);

			// act
			act(() => {
				ConfirmService.confirm({ message: "Message" }).catch(() => undefined);
			});

			// assert
			expect(lastProps(renderConfirm).confirmCaption).toBe("Oui");
		});

		it("prefers the captions from the options", () => {
			// arrange
			const { renderConfirm } = setup({ strings: { yes: "Ja", no: "Nein" } });

			// act
			act(() => {
				ConfirmService.confirm({ message: "Message", yes: "Ok", no: "Abort" }).catch(() => undefined);
			});

			// assert
			expect(lastProps(renderConfirm)).toStrictEqual(expect.objectContaining({ confirmCaption: "Ok", denyCaption: "Abort" }));
		});

		it("uses an empty deny caption if no is null", () => {
			// arrange
			const { renderConfirm } = setup({ strings: { no: "Nein" } });

			// act
			act(() => {
				ConfirmService.confirm({ message: "Message", no: null }).catch(() => undefined);
			});

			// assert
			expect(lastProps(renderConfirm).denyCaption).toBe("");
		});

		it("resolves and closes on confirm", async () => {
			// arrange
			const { renderConfirm } = setup();
			let promise: Promise<void> = Promise.resolve();

			act(() => {
				promise = ConfirmService.confirm({ message: "Message" });
			});

			// act
			act(() => lastProps(renderConfirm).onConfirm());

			// assert
			await expect(promise).resolves.toBeUndefined();
			expect(lastProps(renderConfirm)).toStrictEqual(expect.objectContaining({ isOpen: false, message: "Message" }));
		});

		it("rejects and closes on deny", async () => {
			// arrange
			const { renderConfirm } = setup();
			let promise: Promise<void> = Promise.resolve();

			act(() => {
				promise = ConfirmService.confirm({ message: "Message" });
			});

			// act
			act(() => lastProps(renderConfirm).onDeny());

			// assert
			await expect(promise).rejects.toThrow("Canceled");
			expect(lastProps(renderConfirm).isOpen).toBe(false);
		});
	});

	describe("choice", () => {
		const selectedOption: Option = { key: "two" };
		const options: Option[] = [{ key: 1 }, selectedOption];

		it("shows a choice with a default cancel caption", () => {
			// arrange
			const { renderChoice } = setup();

			// act
			act(() => {
				ConfirmService.choose({ title: "Title", options, type: "type", extra: { some: "data" } }).catch(() => undefined);
			});

			// assert
			expect(lastProps(renderChoice)).toStrictEqual(
				expect.objectContaining({
					isOpen: true,
					title: "Title",
					options,
					type: "type",
					extra: { some: "data" },
					cancelCaption: "Cancel",
				}),
			);
		});

		it("uses the strings prop for the cancel caption", () => {
			// arrange
			const { renderChoice } = setup({ strings: { cancel: "Abbrechen" } });

			// act
			act(() => {
				ConfirmService.choose({ options }).catch(() => undefined);
			});

			// assert
			expect(lastProps(renderChoice).cancelCaption).toBe("Abbrechen");
		});

		it("prefers the cancel caption from the options", () => {
			// arrange
			const { renderChoice } = setup({ strings: { cancel: "Abbrechen" } });

			// act
			act(() => {
				ConfirmService.choose({ options, cancelCaption: "Close" }).catch(() => undefined);
			});

			// assert
			expect(lastProps(renderChoice).cancelCaption).toBe("Close");
		});

		it("resolves with the selected option and closes", async () => {
			// arrange
			const { renderChoice } = setup();
			let promise: Promise<Option> = Promise.resolve({ key: 0 });

			act(() => {
				promise = ConfirmService.choose({ options });
			});

			// act
			act(() => lastProps(renderChoice).onConfirm(selectedOption));

			// assert
			await expect(promise).resolves.toBe(selectedOption);
			expect(lastProps(renderChoice)).toStrictEqual(expect.objectContaining({ isOpen: false, options }));
		});

		it("rejects and closes on cancel", async () => {
			// arrange
			const { renderChoice } = setup();
			let promise: Promise<Option> = Promise.resolve({ key: 0 });

			act(() => {
				promise = ConfirmService.choose({ options });
			});

			// act
			act(() => lastProps(renderChoice).onCancel());

			// assert
			await expect(promise).rejects.toThrow("Canceled");
			expect(lastProps(renderChoice).isOpen).toBe(false);
		});
	});
});
