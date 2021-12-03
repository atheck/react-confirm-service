import { ConfirmOptions, ConfirmService, initAlerts } from "../src/Service";

describe("Service", () => {
    describe("alert", () => {
        it("calls the provided alert function", () => {
            // arrange
            const mockAlert = jest.fn();
            const mockConfirm = jest.fn();

            initAlerts(mockAlert, mockConfirm);

            const message = "Message";
            const severity = "error";

            // act
            ConfirmService.alert(message, severity);

            // assert
            expect(mockAlert).toHaveBeenCalledTimes(1);
            expect(mockAlert).toHaveBeenCalledWith(message, severity);
        });
    });

    describe("confirm", () => {
        it("calls the provided confirm function", async () => {
            // arrange
            const mockAlert = jest.fn();
            const mockConfirm = jest.fn((_title: string | undefined, _message: string, callback: (result: boolean) => void): void => {
                callback(true);
            });

            initAlerts(mockAlert, mockConfirm);

            const options: ConfirmOptions = {
                title: "Title",
                message: "Message",
                yes: "yes",
                no: "no",
            };

            // act
            await ConfirmService.confirm(options);

            // assert
            expect(mockConfirm).toHaveBeenCalledWith(options.title, options.message, expect.any(Function), "yes", "no");
        });

        it("throws if confirmation was canceled", async () => {
            // arrange
            const mockAlert = jest.fn();
            const mockConfirm = jest.fn((_title: string | undefined, _message: string, callback: (result: boolean) => void): void => {
                callback(false);
            });

            initAlerts(mockAlert, mockConfirm);

            const options: ConfirmOptions = {
                title: "Title",
                message: "Message",
                yes: "yes",
                no: "no",
            };

            // act
            const fails = async (): Promise<void> => await ConfirmService.confirm(options);

            // assert
            await expect(fails).rejects.toThrow("Canceled");
            expect(mockConfirm).toHaveBeenCalledWith(options.title, options.message, expect.any(Function), "yes", "no");
        });
    });
});