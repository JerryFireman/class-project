import React from "react";

// @dev This component delivers the client dashboard portion of the user interface
class ClientDashboard extends React.Component { 
    render() { 
        const buttonStyle = {
            height: "75px", 
            width: "100px",
            fontSize: "14px"
        } 
        return (
            <div>
                <h2>Client dashboard</h2>
                <form>
                    <label>
                        Enter amount of funds to deposit:
                        <br/>
                        <input type="number" name="depositAmount" value={this.props.depositAmount} onChange={this.props.handleChange} />            
                    </label>
                        <br/>
                </form>
                <button style={buttonStyle} onClick={this.props.deposit} >Deposit funds </button>
                <form>
                <br/>
                    <label>
                        Enter amount of funds to withdraw:
                        <br/>
                        <input type="number" name="clientWithdrawalAmount" value={this.props.clientWithdrawalAmount} onChange={this.props.handleChange} />            
                    </label>
                        <br/>
                </form>
                <button style={buttonStyle} onClick={this.props.clientWithdrawal} >Withdraw funds </button>
               <br/>
               <br/>
                <button style={buttonStyle} onClick={this.props.approvePhaseStructure} >Approve phase structure </button>
                <br/>
                <br/>
                <button style={buttonStyle} onClick={this.props.approvePhase} >Approve current phase</button>
                <br/>
                <br/>
                <button style={buttonStyle} onClick={this.props.clientCancelProject} >Cancel project</button>
                <br/>
           </div>

        )
    }
}

export default ClientDashboard;