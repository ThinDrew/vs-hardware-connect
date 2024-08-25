import React, { Component } from "react";

interface IMainPageState {
    count: number;
}

export default class MainPage extends Component<{}, IMainPageState>{
    constructor (props: any){
        super(props);
        this.state = {
            count: 0
        }
    }

    incCounter(e: any) {
        this.setState( state => ({
            count: state.count + 1
        }))
    }

    render(): React.ReactNode {
        return(
            <div>
                <input type="button" value="Connect" onClick={(e) => this.incCounter(e)}/>
                <input type="button" value="Send"/>
                <p>message: {this.state.count}</p>
                <p>status:</p>
                <p>text:</p>
            </div>
        )
    }
}