# react-confirm-service

![Build](https://github.com/atheck/react-confirm-service/actions/workflows/main.yml/badge.svg)
![npm](https://img.shields.io/npm/v/react-confirm-service)

Provides a service to show alerts, confirmations, and choices in react apps.

## Installation

`npm install react-confirm-service`

## Basic Usage

First you start by using the `ConfirmComponentHost` in your application:

~~~tsx
import { ConfirmComponentHost } from "react-confirm-service";

...

<MyApp>
    <ConfirmComponentHost
        renderAlert={props => (
            <Notification
                isOpen={props.isVisible}
                onClose={props.onClose}
                ...
            >
                {props.message}
            </Notification>
        )}
        renderConfirm={props => (
            <Dialog
                isOpen={props.isOpen}
                title={props.title}
            >
                // render content, buttons, ...
            </Dialog>
        )}
        renderChoice={props => {
            const options = props.options.map(option => <li key={option.key} onClick={() => props.onConfirm(option)}>{option.key}</li>);

            <Dialog
                isOpen={props.isOpen}
                title={props.title}
            >
                <>
                    <ul>
                        {options}
                    </ul>
                    <button onClick={props.onCancel}>Cancel</button>
                </>
            </Dialog>
        )}
    />
</MyApp>
~~~

The implementation depends on the UI components you want to use to show alerts, confirmation, and choice dialogs.

After that, you can use the `ConfirmService` anywhere in your application:

~~~ts
import { ConfirmService } from "react-confirm-service";

...

ConfirmService.alert("Something happened", "info");

...

ConfirmService.confirm({
    message: "Close without saving?"
})
    .then(/* Yes */)
    .catch(/* No */);

...

ConfirmService.choose({
    title: "Fruits",
    options: [
        { key: "Bananas" },
        { key: "Apples" },
        { key: "Pineapples" },
    ]
})
    .then(choice => /* ... */)
    .catch(/* cancelled */)
~~~

## How to use the `ConfirmComponentHost`

The `ConfirmComponentHost` accepts the following props:

| Property | Required | Description |
| --- | --- | --- |
| renderAlert | yes | Provide a function which renders the alert component. See [renderAlert](#renderalert) |
| renderConfirm | yes | Provide a function which renders the confirmation component. See [renderConfirm](#renderconfirm) |
| renderChoice | no | Provide a function which renders the choice component. See [renderChoice](#renderchoice) |
| strings | no | Takes an object to provide default values for `yes`, `no`, and `cancel` button captions. Use this to localize these texts. |
| alertDurations | no | You can provide an object to set the durations of an alert for each severity in ms. The defaults are: info: 3000, success: 3000, warning: 10000, error: 10000. |

### renderAlert

`renderAlert` is a function with one parameter of type `AlertRenderProps`:

| Property | Description |
| --- | --- |
| isVisible  | Alert is shown or not. |
| message | The message to display to the user. |
| duration | How long should the message be displayed, in ms. |
| severity | The severity of the alert. Use different icons and/or colors. |
| onClose | Call this function when the alert should close. |

### renderConfirm

`renderConfirm` is a function with one parameter of type `ConfirmRenderProps`:

| Property | Description |
| --- | --- |
| isOpen | Is the confirmation dialog opened? |
| title | The optional title of the confirmation. |
| message | The message of the confirmation. |
| confirmCaption | The caption of the button to accept the confirmation. |
| onConfirm | Call this function when the button to accept is pressed. |
| denyCaption | The caption of the button to deny the confirmation. Do not display this button if the caption is an empty string (""). |
| onDeny | Call this function when the button to deny is pressed. |

### renderChoice

`renderChoice` is a function with one parameter of type `ChoiceRenderProps`:

| Property | Description |
| --- | --- |
| isOpen | Is the choice dialog opened? |
| title | The optional title of the choice. |
| options | The list of selectable options to show. |
| type | The optional type of the options to distinguish when rendering. |
| cancelCaption | The caption of the action to cancel the choice. |
| onConfirm | Call this function when a choice is selected. |
| onCancel | Call this function when the choice is cancelled. |

## How to use the `ConfirmService`

### Alert

To show an alert to the user, call the `alert` function. It has the following parameters:

| Parameter | Required | Description |
| --- | --- | --- |
| message | yes | The message to display. |
| severity | yes | The severity of the alert. |

### Confirm

To show a confirmation to the user, use the `confirm` function. It takes one options parameter:

| Property | Required | Description |
| --- | --- | --- |
| title | no | The title of the confirmation. |
| message | yes | The message of the confirmation. |
| yes | no | The caption of the button to accept. If not provided the `yes` property of `strings` is used. The default is "Yes". |
| no | no | The caption of the button to deny. If not provided the `no` property of `strings` is used. The default is "No". If you pass `null`, the button is not displayed. |

This function returns a `Promise`. It will be resolved if the confirmation is accepted and rejected if the confirmation is denied.

### Choose

To show a choice to the user, use the `choose` function. It takes one options parameter:

| Property | Required | Description |
| --- | --- | --- |
| title | no | The title of the choice. |
| options | yes | The possible choices. |
| type | no | The optional type of the options to distinguish when rendering. |
| cancelCaption | no | The caption of the cancel action. If not provided the `cancel` property of `strings` is used. The default is "Cancel". |

This function returns a `Promise`. It will be resolved with the selected option and rejected if the choice is cancelled.

The `choose` function is a generic function. So you can provide a custom type for your options. The generic parameter is optional.

Your custom type must have a `key` property of type `string | number`.

~~~ts
interface CustomOption {
    key: string | number,
    data: MyData,
}

ConfirmService.choose<CustomOption>({
    options: [
        { key: "1", data: myData1 },
        { key: "2", data: myData2 },
        { key: "3", data: myData3 }
    ]
});
~~~
