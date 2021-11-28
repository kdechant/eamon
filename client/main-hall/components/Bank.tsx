import * as React from 'react';
import {useState} from "react";
import {Link, Route, Routes} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../hooks";
import {playerActions} from "../store/player";

const Bank: React.FC = () => {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);

  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const deposit = () => {
    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt <= 0) {
      setMessage('The banker scowls at you and says, "Come, come, you\'re not making sense! Try again."');
      return false;
    }
    if (amt > player.gold) {
      setMessage("Seamus looks very pleased when you tell him the sum. Then he scowls when he sees that you don't have that much gold.");
      return false;
    }

    setMessage("Seamus takes your money, puts it in his bag, and listens to it jingle with a smile on his face.");
    dispatch(playerActions.deposit(amt));
    return true;
  };

  const withdraw = () => {
    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt <= 0) {
      setMessage('The banker scowls at you and says, "Come, come, you\'re not making sense! Try again."');
      return false;
    }
    if (amt > player.gold_in_bank) {
      setMessage("Seamus throws you a terrible glance and says, \"That's more than you have in your account! You know I don't make loans to adventurers!\"");
      return false;
    }

    setMessage("Seamus hands you your gold and shakes your hand.");
    dispatch(playerActions.withdraw(amt));
    return true;
  };

  if (!player) {
    return <p>Loading...</p>;
  }

  return (
    <div className="bank">
      <h2><img src="/static/images/ravenmore/128/coin.png" alt="Gold coin" />Bank of Eamon Towne</h2>
      <p>You have no trouble spotting Seamus McFenney, the local banker, due to his large belly. You attract his attention, and he comes over to you.</p>
      <p>&quot;Well, {player.name}, my dear {player.gender === 'm' ? 'boy' : 'lass'}, what a pleasure
        to see you! Do you want to make a deposit or a withdrawal?&quot;</p>
      <p>You have {player.gold} gold pieces in hand, and {player.gold_in_bank} gold pieces in
        the bank.</p>

      <Routes>

        <Route path="" element={
          <p>
            <Link to="/main-hall/bank/deposit" className="btn btn-primary">Deposit</Link>
            <Link to="/main-hall/bank/withdraw" className="btn btn-primary">Withdrawal</Link>
            <Link to="/main-hall/hall" className="btn btn-primary">Go back to Main Hall</Link>
          </p>
        } />

        <Route path="deposit" element={
          <div className="bank-deposit">
            <p>Good for you! How much would you like to deposit?</p>
            <div className="form-row">
              <div className="col-auto">
                <input type="text" className="form-control" id="amount" name="amount" onChange={handleChange} />
              </div>
              <div className="col-auto">
                <button className="btn btn-primary" onClick={deposit}>Deposit</button>
              </div>
              <div className="col-auto">
                <Link to="/main-hall/bank" className="btn btn-primary">Done</Link>
              </div>
            </div>
            <p>{message}</p>
          </div>
        } />

        <Route path="withdraw" element={
          <div className="bank-deposit">
            <p>Good for you! How much would you like to withdraw?</p>
            <div className="form-row">
              <div className="col-auto">
                <input type="text" className="form-control" id="amount" name="amount" onChange={handleChange} />
              </div>
              <div className="col-auto">
                <button className="btn btn-primary" onClick={withdraw}>Withdraw</button>
              </div>
              <div className="col-auto">
                <Link to="/main-hall/bank" className="btn btn-primary">Done</Link>
              </div>
            </div>
            <p>{message}</p>
          </div>
        } />

      </Routes>
    </div>
  );
}

export default Bank;
