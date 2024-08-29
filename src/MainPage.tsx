import React, { Component } from "react";
import WSControl from "./controllers/devices/ws/client/wscontroller";
import { IErrorMessage } from "./interfaces/IErrorMessage";
import { IServiceRespond } from "./interfaces/IServiceRespond";
import { validationJSON } from "./lib/util/errors";
import "./MainPage.css"
import { delay } from "./lib/util/delay";

enum ConnectionStatus {
    Disconnected = "Disconnected",
    Connecting = "Connecting...",
    Connected = "Connected",
}

interface IRespond {
    status: string | undefined;
    duration: string | undefined;
    time: string | undefined;
    msg: string | Array<number> | undefined;
}

const defaultRespond: IRespond = {
    status: undefined,
    duration: undefined,
    time: undefined,
    msg: undefined,
};

interface IMainPageState {
    connectionStatus: ConnectionStatus;
    isSendingRequests: boolean;
    respond: IRespond;
}

const HOST: string = window.location.hostname;
const port: number = 5000;
const URL: string = `${HOST}:${port}`;
const urlService: string = `ws://${URL}`;
const request = {
    cmd: [1, 17, 192, 44],
    timeOut: 100,
    ChunksEndTime: 1,
    NotRespond: false,
};

export default class MainPage extends Component<{}, IMainPageState> {
    timerId: any;
    private wss: WSControl | null = null;

    constructor(props: any) {
        super(props);
        this.state = {
            connectionStatus: ConnectionStatus.Disconnected,
            isSendingRequests: false,
            respond: defaultRespond,
        };
    }

    public validateIncomingMessage(
        respond: any
    ): IServiceRespond | IErrorMessage {
        let msg: any = validationJSON(respond);
        return msg;
    }

    private setConnectionStateToOpen() {
        this.setState((state) => ({
            connectionStatus: ConnectionStatus.Connected,
        }));
    }

    private setConnectionStateToClose() {
        this.setState((state) => ({
            connectionStatus: ConnectionStatus.Disconnected,
            isSendingRequests: false
        }));
    }

    private async connect() {
        this.setState({ connectionStatus: ConnectionStatus.Connecting })
        this.wss = new WSControl(urlService);
        this.wss.onOpenUserHandler = this.setConnectionStateToOpen.bind(this);
    }

    private disconnect() {
        this.wss?.close();
        this.wss!.onCloseUserHandler = this.setConnectionStateToClose.bind(this);
    }

    private async socketControl(e: any) {
        if (this.isConnected()) {
            this.disconnect();
        } else {
            await this.connect();
        }
    }

    validateRespond(respond: any): IRespond {
        const resp: any = JSON.parse(respond);
        let newRespond: IRespond = { ...defaultRespond, ...resp };
        if (newRespond.status == "OK") {
            let respondMsgArray: Array<number>;
            if (Array.isArray(newRespond.msg)) {
                respondMsgArray = newRespond.msg;
                console.log(respondMsgArray);
                //получаем контрольную сумму
                let checksum: Array<number> = respondMsgArray.slice(-2);
                //избавляемся от первых и последних 2 байт
                respondMsgArray = respondMsgArray.slice(2, -2);
                //получаем строковое сообщение
                let msg = String.fromCharCode(...respondMsgArray);
                newRespond.msg = msg;
            }
        }
        console.log(newRespond);
        return newRespond;
    }

    private async sendRequest(e: any) {
        try {
            const respond: string | undefined = await this.wss?.send(
                JSON.stringify(request)
            );
            this.setState({ respond: this.validateRespond(respond) });
        } catch (error: any) {
            console.log(`error: ${error}`);
        }
    }

    private async startSendingRequests(e: any) {
        console.log(this.state.isSendingRequests);
        this.setState(
            (state) => ({
                isSendingRequests: !state.isSendingRequests
            }),
            async () => {
                console.log(this.state.isSendingRequests);
                while (this.state.isSendingRequests) {
                    await this.sendRequest(e);
                    await delay(10);
                }
            }
        );
    }

    private isConnected() {
        if (this.state.connectionStatus === ConnectionStatus.Connected)
            return true
        else if (this.state.connectionStatus === ConnectionStatus.Disconnected)
            return false
    }

    render(): React.ReactNode {
        const statusColor = this.state.respond.status === "OK" ? "green" : "red";

        const connectionColor =
            this.state.connectionStatus === ConnectionStatus.Connected
                ? "green"
                : this.state.connectionStatus === ConnectionStatus.Connecting
                    ? "gray"
                    : "red";

        const { connectionStatus, isSendingRequests, respond } = this.state

        return (
            <div>
                <p><span style={{ color: connectionColor }}>{connectionStatus}</span></p>
                <div className="button-container">
                    <input
                        type="button"
                        value={this.isConnected() ? "Disconnect" : "Connect"}
                        onClick={async (e) => await this.socketControl(e)}
                        style={{
                            backgroundColor: this.isConnected() ? "#ca3c3c" : "#0056b3"
                        }}
                    />
                    <input
                        type="button"
                        value="Send"
                        disabled={!this.isConnected() || this.state.isSendingRequests}
                        onClick={async (e) => await this.sendRequest(e)}
                    />
                    <input
                        type="button"
                        value={this.state.isSendingRequests ? "Stop" : "Start"}
                        disabled={!this.isConnected()}
                        onClick={async (e) => await this.startSendingRequests(e)}
                    />
                </div>

                <p className="message-label">status: <span style={{ color: statusColor }}>{respond.status}</span></p>
                <p className="message-label">message: <span style={{ color: "white" }}>{respond.msg}</span></p>
                <p className="message-label">duration: <span style={{ color: "white" }}>{respond.duration}</span></p>
                <p className="message-label">time: <span style={{ color: "white" }}>{respond.time}</span></p>
            </div>
        );
    }
}
