import { ChooseOptions, ConfirmOptions, ConfirmService, initAlerts, Option } from "../src/Service";

describe("Service", () => {
    const mockAlert = jest.fn();
    const mockConfirm = jest.fn();
    const mockChoose = jest.fn();

    beforeEach(() => {
        mockAlert.mockReset();
        mockConfirm.mockReset();
        mockChoose.mockReset();

        initAlerts(mockAlert, mockConfirm, mockChoose);
    });

    describe("alert", () => {
        it("calls the provided alert function", () => {
            const message = "Message";
            const severity = "error";

            // act
            ConfirmService.alert(message, severity);

            // assert
            expect(mockAlert).toHaveBeenCalledTimes(1);
            expect(mockAlert).toHaveBeenCalledWith(message, severity);
        });

        it("throws if not initialized", () => {
            // arrange
            initAlerts(null, mockConfirm, mockChoose);

            // act
            const fails = (): void => ConfirmService.alert("Message", "info");

            // assert
            expect(fails).toThrow("ConfirmService is not initialized.");
        });
    });

    describe("confirm", () => {
        it("calls the provided confirm function", async () => {
            // arrange
            mockConfirm.mockImplementation((_title: string | undefined, _message: string, callback: (result: boolean) => void): void => {
                callback(true);
            });

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
            mockConfirm.mockImplementation((_title: string | undefined, _message: string, callback: (result: boolean) => void): void => {
                callback(false);
            });

            const options: ConfirmOptions = {
                title: "Title",
                message: "Message",
                yes: "yes",
                no: "no",
            };

            // act
            const fails = async (): Promise<void> => ConfirmService.confirm(options);

            // assert
            await expect(fails).rejects.toThrow("Canceled");
            expect(mockConfirm).toHaveBeenCalledWith(options.title, options.message, expect.any(Function), "yes", "no");
        });

        it("throws if not initialized", async () => {
            // arrange
            initAlerts(mockAlert, null, mockChoose);

            // act
            const fails = async (): Promise<void> => ConfirmService.confirm({
                message: "Message",
            });

            // assert
            await expect(fails).rejects.toThrow("ConfirmService is not initialized.");
        });
    });

    describe("choose", () => {
        const options: Option [] = [
            {
                key: "option-1",
            },
            {
                key: "option-2",
            },
            {
                key: "option-3",
            },
        ];

        it("calls the provided choose function", async () => {
            // arrange
            mockChoose.mockImplementation((_options: ChooseOptions, callback: (option: Option | null) => void): void => {
                callback(options[1]);
            });

            const chooseOptions: ChooseOptions = {
                title: "Title",
                options,
            };

            // act
            const result = await ConfirmService.choose(chooseOptions);

            // assert
            expect(mockChoose).toHaveBeenCalledWith(chooseOptions, expect.any(Function));
            expect(result).toBe(options[1]);
        });

        it("throws if choice was canceled", async () => {
            // arrange
            mockChoose.mockImplementation((_options: ChooseOptions, callback: (result: boolean) => void): void => {
                callback(false);
            });

            const chooseOptions: ChooseOptions = {
                title: "Title",
                options,
            };

            // act
            const fails = async (): Promise<Option> => ConfirmService.choose(chooseOptions);

            // assert
            await expect(fails).rejects.toThrow("Canceled");
            expect(mockChoose).toHaveBeenCalledWith(chooseOptions, expect.any(Function));
        });

        it("throws if not initialized", async () => {
            // arrange
            initAlerts(mockAlert, mockConfirm, null);

            // act
            const fails = async (): Promise<Option> => ConfirmService.choose({
                options,
            });

            // assert
            await expect(fails).rejects.toThrow("ConfirmService is not initialized.");
        });
    });
});