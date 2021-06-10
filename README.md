# react-confirm-service

![Build](https://github.com/atheck/react-confirm-service/actions/workflows/main.yml/badge.svg)
![npm](https://img.shields.io/npm/v/react-confirm-service)

Provides a service to show alerts and confirmations in react apps.

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
    />
</MyApp>
~~~

The implementation depends on the UI components you want to use to show alerts and confirmation dialogs.

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
~~~

## How to use the `ConfirmComponentHost`

The `ConfirmComponentHost` the following props:

| Property | Description |
| --- | --- |
| renderAlert | Required. Provide a function which renders the alert component. See [renderAlert](#renderAlert) |
| renderConfirm | Required. Provide a function which renders the confirmation component. See [renderConfirm](#renderConfirm) |
| strings | Takes an object to provide default values for `yes` an `no` button captions. Use this to localize these texts. |

 takes the props `renderAlert`, and `renderConfirm`. Use these props to render the alert and confirm components.

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

## How to use the `ConfirmService`

### Alert

To show an alert to the user, call the `alert` function. It has the following parameters:

| Parameter | Description |
| --- | ---
| message | The message to display. |
| severity | The severity of the alert. |

### Confirm

To show a confirmation to the user, use the `confirm` function. It takes one options parameter:

| Property | Description |
| --- | --- |
| title | The optional title of the confirmation. |
| message | The message of the confirmation. |
| yes | The caption of the button to accept. The default is "Yes". |
| no | The caption of the button to deny. The default is "No". If you pass `null`, the button is not displayed. |

This function returns a `Promise`. It will be resolved if the confirmation is accepted and rejected if the confirmation is denied.
