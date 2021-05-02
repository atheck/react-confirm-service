import { initAlerts, Alert, ConfirmOptions } from "../src/Service";

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
            Alert.alert(message, severity);

            // assert
            expect(mockAlert).toHaveBeenCalledTimes(1);
            expect(mockAlert).toHaveBeenCalledWith(message, severity);
        });
    });

    describe("confirm", () => {
        it("calls the provided confirm function", () => {
            // arrange
            const mockAlert = jest.fn();
            const mockConfirm = jest.fn().mockResolvedValue(true);
            initAlerts(mockAlert, mockConfirm);

            const options: ConfirmOptions = {
                title: "Title",
                message: "Message",
                yes: "yes",
                no: "no",
            };

            // act
            Alert.confirm(options);

            // assert
            expect(mockConfirm).toHaveBeenCalledTimes(1);
            expect(mockConfirm).toHaveBeenCalledWith(options.title, options.message, expect.any(Function), "yes", "no");
        });
    });
});