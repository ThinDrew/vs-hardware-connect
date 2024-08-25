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

    render(): React.ReactNode {
        return(
            <div>
                <input type="button" value="Connect"/>
                <input type="button" value="Send"/>
                <p>message:</p>
                <p>status:</p>
                <p>text:</p>
            </div>
        )
    }
}