import './index.css'

import { useEffect, useState } from 'react'
import { Table, Spinner } from 'react-bootstrap' 
import { TranInfo, WalletHistory } from './WalletHistory';
import { ethers } from 'ethers';

function History() {
  const walletHistory = new WalletHistory()

  const [updatingHistory, setUpdatingHistory] = useState(false)
  const [historyUpdateTime, setHistoryUpdateTime] = useState(0)
  const [last20Tran, setLast20Tran] = useState<TranInfo[]>([])
  
  const renderMainPage = () => {
    return (
      <div className='form'>
        <div className='title'>
        Payment History
        </div>
        <div className='content d-flex'>
          {renderTranHistory()}     
        </div>
      </div>
    )
  }

  const getLastTransaction = async() => {
    const time = Math.floor(new Date().getTime() / 1000);
    if (time == historyUpdateTime || updatingHistory) return

    const transactions = await walletHistory.getLastTransactions()
    setLast20Tran(transactions)

    setUpdatingHistory(false)
    setHistoryUpdateTime(Math.floor(new Date().getTime() / 1000) + 5)
  }

  const refreshTransactions = () => {
    setUpdatingHistory(true)
    getLastTransaction()
  }

  const loadTransactions = () => {
    if(!last20Tran || last20Tran.length == 0) {
      refreshTransactions()
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])  

  const getLinkTran = (hash: string): string => {
    return 'https://' + process.env.REACT_APP_NETWORK_NAME + '.etherscan.io/tx/' + hash
  }

  const formatCryptoAmount = (amount: string)  => {
    const decimalPlace = amount.indexOf('.')
    const decimalPlaces = amount.length - (decimalPlace >= 0 ? decimalPlace + 1: amount.length)

    if (decimalPlaces > 6) {
      return amount.substring(0, decimalPlace + 6 + 1)
    }

    return amount
  }

  const renderTranInfoRow = (t: TranInfo) => {
    return (
      <tr key={t.hash} className='historyrow'>
        <td>{t.id}</td>
        <td>{t.date}</td>
        <td><a href={getLinkTran(t.hash)}>{t.hash.substring(0, 20)}...</a></td>
        <td>{t.crypto}</td>
        <td>{formatCryptoAmount(ethers.utils.formatUnits(ethers.utils.parseUnits(t.value, 0), 18))}</td>
        <td>{t.status}</td>
      </tr>
    )
  }

  const renderTranHistory = () => {
    return (
      <div className='tranhistory maintdwrapper'>
        {updatingHistory && (
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Updating...</span>
          </Spinner>
        )}
        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Link to transaction</th>
              <th>Currency</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
            {last20Tran.map(t => renderTranInfoRow(t))}
          </thead>
          <tbody>
          </tbody>
        </Table>
      </div>
    )
  }

  return renderMainPage()
}

export default History
