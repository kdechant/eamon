import * as React from 'react';
import {Link, Route} from "react-router-dom";

export default class Bank extends React.Component<any, any> {
  public state: any = {
    amount: '',
    error: '',
    message: '',
  };

  public handleChange = (event) => {
    const change = {
      amount: event.target.value
    };
    this.setState(change);
  };

  public deposit = () => {
    let amt = parseInt(this.state.amount, 10);
    const player = this.props.player;
    if (isNaN(amt) || amt <= 0) {
      this.setState({message: 'The banker scowls at you and says, "Come, come, you\'re not making sense! Try again."'});
      return false;
    }
    if (amt > player.gold) {
      this.setState({message: "Seamus looks very pleased when you tell him the sum. Then he scowls when he sees that you don't have that much gold."});
      return false;
    }

    this.setState({message: "Seamus takes your money, puts it in his bag, and listens to it jingle with a smile on his face."});
    player.gold -= amt;
    player.gold_in_bank += amt;
    this.props.setPlayerState(player);
    return true;
  };

  public withdraw = () => {
    let amt = parseInt(this.state.amount, 10);
    const player = this.props.player;
    if (isNaN(amt) || amt <= 0) {
      this.setState({message: 'The banker scowls at you and says, "Come, come, you\'re not making sense! Try again."'});
      return false;
    }
    if (amt > player.gold_in_bank) {
      this.setState({message: "Seamus throws you a terrible glance and says, \"That's more than you have in your account! You know I don't make loans to adventurers!\""});
      return false;
    }

    this.setState({message: "Seamus hands you your gold and shakes your hand."});
    player.gold += amt;
    player.gold_in_bank -= amt;
    this.props.setPlayerState(player);
    return true;
  };

  public render() {

    if (!this.props.player) {
      return <p>Loading...</p>;
    }

    return (
      <div className="bank">
        <h2><img src="/static/images/ravenmore/128/coin.png" alt="Gold coin" />Bank of Eamon Towne</h2>
        <p>You have no trouble spotting Seamus McFenney, the local banker, due to his large belly. You attract his attention, and he comes over to you.</p>
        <p>&quot;Well, {this.props.player.name}, my dear {this.props.player.gender === 'm' ? 'boy' : 'lass'}, what a pleasure
          to see you! Do you want to make a deposit or a withdrawal?&quot;</p>
        <p>You have {this.props.player.gold} gold pieces in hand, and {this.props.player.gold_in_bank} gold pieces in
          the bank.</p>

        <Route path="/main-hall/bank" exact={true} render={(props) => (
          <p>
            <Link to="/main-hall/bank/deposit" className="btn btn-primary">Deposit</Link>
            <Link to="/main-hall/bank/withdraw" className="btn btn-primary">Withdrawal</Link>
            <Link to="/main-hall/hall" className="btn btn-primary">Go back to Main Hall</Link>
          </p>
        )} />

        <Route path="/main-hall/bank/deposit" render={(props) => (
          <div className="bank-deposit">
            <p>Good for you! How much would you like to deposit?</p>
            <div className="form-row">
              <div className="col-auto">
                <input type="text" className="form-control" id="amount" name="amount" onChange={this.handleChange} />
              </div>
              <div className="col-auto">
                <button className="btn btn-primary" onClick={this.deposit}>Deposit</button>
              </div>
              <div className="col-auto">
                <Link to="/main-hall/bank" className="btn btn-primary">Done</Link>
              </div>
            </div>
            <p>{this.state.message}</p>
          </div>
          )} />

        <Route path="/main-hall/bank/withdraw" render={(props) => (
          <div className="bank-deposit">
            <p>Good for you! How much would you like to withdraw?</p>
            <div className="form-row">
              <div className="col-auto">
                <input type="text" className="form-control" id="amount" name="amount" onChange={this.handleChange} />
              </div>
              <div className="col-auto">
                <button className="btn btn-primary" onClick={this.withdraw}>Withdraw</button>
              </div>
              <div className="col-auto">
                <Link to="/main-hall/bank" className="btn btn-primary">Done</Link>
              </div>
            </div>
            <p>{this.state.message}</p>
          </div>
        )} />
      </div>
    );
  }
}
