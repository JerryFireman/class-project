import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import Header from "./Header.js";
import ProjectInfo from "./ProjectInfo.js";
import PhaseStructure from "./PhaseStructure.js"
import CreatePhase from "./CreatePhase.js"
import ClientDashboard from "./ClientDashboard.js"
//import ServiceProviderDashboard from "./ClientDashboard.js"

import "./App.css";

class App extends Component {
  constructor(props) {
    super(props)
    this.definePhase = this.definePhase.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.getPhaseStructure = this.getPhaseStructure.bind(this)
    this.approvePhaseStructure = this.approvePhaseStructure.bind(this)
    this.deposit = this.deposit.bind(this)

  }
  
  state = { 
    web3: null,
    accounts: null,
    contract: null,
    instance: null,
    storageValue: 0,
    phaseName: "",
    phaseDescription: "",
    initialPayment: 0,
    finalPayment: 0,
    phaseStructure: [],
    project: {},
    depositAmount: 0
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      // Set web3, accounts, and contract to the state.
      this.setState({ web3, accounts, contract: instance });
      // Call readProject() to obtain project information and add to state
      const project = await instance.methods.readProject().call();
      this.setState({project: project})
      var clientBalance = this.state.project.clientBalance;
      clientBalance = String(clientBalance);
      clientBalance = web3.utils.fromWei(clientBalance, 'ether');
      console.log("clientBalance before setState", clientBalance);
      this.setState(prevState => {
        let project = Object.assign({}, prevState.project);
        project.clientBalance = clientBalance;
        return { project };
      })
      console.log("clientBalance from state after setState", this.state.project.clientBalance)
      console.log("escrow balance from state after setState",this.state.project.escrowBalance);
      console.log("service provider balance from state after setState",this.state.project.serviceProviderBalance);

      await this.getPhaseStructure()
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  //Executed to define a new phase of the project
  definePhase = async (event) => {
    event.preventDefault()
    const { accounts, contract } = this.state;
    await contract.methods.createPhase(this.state.phaseName, this.state.phaseDescription, this.state.initialPayment, this.state.finalPayment).send({ from: accounts[0], gas: 3000000 });
    this.getPhaseStructure()
    this.setState({
      phaseName: "",
      phaseDescription: "",
      initialPayment: 0,
      finalPayment: 0        
    })
  };

    //Executed by the client to deposit funds into contract                 
      deposit = async () => {
        console.log("1")
        const { accounts, contract, web3 } = this.state;
        let balance = await web3.eth.getBalance(accounts[1])
        console.log("client balance", balance)
      try {
          //await web3.eth.sendTransaction({from:accounts[1], to:contract._address, value:String(web3.utils.toWei(this.state.depositAmount,"ether"))});
          contract.methods.deposit().send({from: accounts[1], gas: 3000000, value: String(web3.utils.toWei(this.state.depositAmount,"ether"))});
          this.setState({
            depositAmount: 0
          });
          // Call readProject() to obtain project information and add to state
          const project = await contract.methods.readProject().call();
          this.setState({project: project})
          console.log("accounts 1 address", accounts[1])
          let balance = await web3.eth.getBalance(accounts[1])
          console.log("client wallet balance", balance)
          let conbalance = await web3.eth.getBalance("0x6F2b8204FDF7384926E1571f68571B5AC65714C0")
          console.log("contract balance", conbalance)
          console.log("client balance in contract", this.state.project.clientBalance)

        } catch (error) {
          // Catch any errors for any of the above operations.
          alert(
          `Deposit into contract failed. Check console for details.`,
        );
        console.error(error);
        }
      }

  //Executed to retrieve the current phase structure 
  getPhaseStructure = async () => {
    const { contract } = this.state;
    const idGenerator = await contract.methods.idGenerator().call();
    var phaseArray = [];
    if (idGenerator >= 2) {
      for (let i = 1; i < idGenerator; i++) {
        var phase = await contract.methods.readPhase(i).call();
        delete phase[0];
        delete phase[1];
        delete phase[2];
        delete phase[3];
        delete phase[4];
        delete phase[5];
        phase.id = i
        phaseArray.push(phase);
      }
    }
    this.setState({
      phaseStructure: phaseArray
    });
    return phaseArray
   }
   
  approvePhaseStructure = async (event) => {
    const { accounts, contract } = this.state;
    try {
      const response = await contract.methods.approvePhaseStructure().send({ from: accounts[1], gas: 3000000 });
      if (response) {
        const project = await contract.methods.readProject().call();
        console.log("project.phaseExists",project.phaseExists)
        this.setState({project: project})
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Attempt to approve phase structure returned error. Check console for details.`,
      );
      console.error(error);
    }
  };

  handleChange (event) {
    this.setState({ [event.target.name]: event.target.value });
  }
 
  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <Header/>
        <ProjectInfo project={this.state.project}/>
        <PhaseStructure phaseStructure={this.state.phaseStructure} project={this.state.project}/>
        <CreatePhase handleChange={this.handleChange} definePhase={this.definePhase}  phaseName={this.state.phaseName} phaseDescription={this.state.phaseDescription} initialPayment={this.state.initialPayment} finalPayment={this.state.finalPayment} />
        <ClientDashboard handleChange={this.handleChange} approvePhaseStructure={this.approvePhaseStructure} depositAmount={this.state.depositAmount} deposit={this.deposit}/>
      </div>
    );
  }
}

export default App;
