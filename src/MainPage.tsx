import React, { Component } from "react";
import WSControl from "./controllers/devices/ws/client/wscontroller";
import { IErrorMessage } from "./interfaces/IErrorMessage";
import { IServiceRespond } from "./interfaces/IServiceRespond";
import { validationJSON } from "./lib/util/errors";

interface IMainPageState {
    count: number;
    isConnect: boolean;
}

const HOST: string = window.location.hostname;
const port: number = 5000;
const URL: string = `${HOST}:${port}`;
const urlService: string = `ws://${URL}`;

export default class MainPage extends Component<{}, IMainPageState>{
    timerId: any;
    private wss: WSControl | null = null;

    constructor (props: any){
        super(props);
        this.state = {
            count: 0,
            isConnect: false
        }
    }

    public validateIncomingMessage(respond: any): IServiceRespond | IErrorMessage {
        let msg: any = validationJSON(respond);
        return msg;
    }

    private async connect() {
        this.wss = new WSControl({host: urlService});
        const respond: any = await this.wss!.open();
        const msg: any = this.validateIncomingMessage(respond);
    }

    private disconnect() {

    }

    private async socketControl(e: any){
        // this.setState((state) => ({
        //     isConnect: !state.isConnect
        // }));
        if (this.state.isConnect){
            this.disconnect()
        }
        else {
            await this.connect()
        }
        
    }

    incCounter(e: any) {
        this.setState( state => ({
            count: state.count + 1
        }))
    }

    componentDidMount(): void {
        this.timerId = setInterval(
            (e: any) => this.incCounter(e),
            1000
        )
    }

    componentWillUnmount(): void {
        clearInterval(this.timerId);
    }

    render(): React.ReactNode {
        return(
            <div>
                <input type="button" value={this.state.isConnect? "Disconnect" : "Connect"} onClick={async(e) => await this.socketControl(e)}/>
                <input type="button" value="Send" disabled={!this.state.isConnect}/>
                <p>message: {this.state.count}</p>
                <p>status:</p>
                <p>text:</p>
            </div>
        )
    }
}