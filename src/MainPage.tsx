import React, { Component } from "react";
import WSControl from "./controllers/devices/ws/client/wscontroller";
import { IErrorMessage } from "./interfaces/IErrorMessage";
import { IServiceRespond } from "./interfaces/IServiceRespond";
import { validationJSON } from "./lib/util/errors";

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
    msg: undefined
};

interface IMainPageState {
    count: number;
    isConnect: boolean;
    respond: IRespond
}

const HOST: string = window.location.hostname;
const port: number = 5000;
const URL: string = `${HOST}:${port}`;
const urlService: string = `ws://${URL}`;
const request = {
    "cmd":[1, 17, 192, 44],
    "timeOut":100,
    "ChunksEndTime":1,
    "NotRespond":false
}

export default class MainPage extends Component<{}, IMainPageState>{
    timerId: any;
    private wss: WSControl | null = null;

    constructor (props: any){
        super(props);
        this.state = {
            count: 0,
            isConnect: false,
            respond: defaultRespond
        }
    }

    public validateIncomingMessage(respond: any): IServiceRespond | IErrorMessage {
        let msg: any = validationJSON(respond);
        return msg;
    }

    private setConnectionStateToOpen(){
        this.setState((state) => ({
            isConnect: true
        }));
    }

    private setConnectionStateToClose(){
        this.setState((state) => ({
            isConnect: false
        }));
    }

    private async connect() {
        this.wss = new WSControl(urlService);
        this.wss.onOpenUserHandler = this.setConnectionStateToOpen.bind(this);
    }

    private disconnect() {
        this.wss?.close()
        this.wss!.onCloseUserHandler = this.setConnectionStateToClose.bind(this);
    }

    private async socketControl(e: any){
        
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

    validateRespond(respond: any): IRespond{
        const resp: any = JSON.parse(respond);
        let aboba: IRespond = {...defaultRespond, ...resp};
        if (aboba.status == "OK"){
            //TODO: Распарсить массив в строку, удалив первые и последние 2 байта 
            let array!: Array<number> = aboba.msg
            console.log(array)
        }
        console.log(aboba)
        return aboba;
    }

    private async sendRequest(e: any){
        try{
            const respond: string | undefined = await this.wss?.send(JSON.stringify(request));
            this.setState(({respond: this.validateRespond(respond)})) 
        }
        catch (error: any) {
            console.log(`error: ${error}`);
        }
        
    }

    render(): React.ReactNode {
        return(
            <div>
                <input type="button" value={this.state.isConnect? "Disconnect" : "Connect"} onClick={async(e) => await this.socketControl(e)}/>
                <input type="button" value="Send" disabled={!this.state.isConnect} onClick={async(e) => await this.sendRequest(e)}/>
                <p>status: {this.state.respond.status}</p>
                <p>message: {this.state.respond.msg}</p>
            </div>
        )
    }
    
}