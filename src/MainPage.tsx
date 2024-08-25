import React, { Component } from "react";

interface IMainPageState {
    count: number;
    isConnect: boolean;
}

export default class MainPage extends Component<{}, IMainPageState>{
    timerId: any;

    constructor (props: any){
        super(props);
        this.state = {
            count: 0,
            isConnect: false
        }
    }

    connect(e: any){
        this.setState((state) => ({
            isConnect: !state.isConnect
        }));
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
                <input type="button" value={this.state.isConnect? "Disconnect" : "Connect"} onClick={(e) => this.connect(e)}/>
                <input type="button" value="Send" disabled={!this.state.isConnect}/>
                <p>message: {this.state.count}</p>
                <p>status:</p>
                <p>text:</p>
            </div>
        )
    }
}