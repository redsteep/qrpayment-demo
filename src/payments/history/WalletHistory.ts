import { ethers } from 'ethers'
import Web3 from 'web3';
import { AbiItem } from 'web3-utils'

import abi from './abi.json'

const address = process.env.REACT_APP_ETHEREUM_WALLET

export interface TranInfo {
  id: string
  date: string
  crypto: string
  amount: string
  status: string

  from: string
  value: string
  hash: string
}

export class WalletHistory {
  web3: Web3

  constructor() {
    this.web3 = new Web3(Web3.givenProvider)
  }

  async getLastBlockNumber() {
    const blockNumber = await this.web3.eth.getBlockNumber()
    return blockNumber
  }

  async getLastEventsFromBlock(blockNumber: number) {
    const thisContract = new this.web3.eth.Contract(abi as AbiItem[], address)
    const result = await thisContract.getPastEvents('Received', { fromBlock: blockNumber})
    return result
  }

  async getLastTransactionsFromBlock(blockNumber: number): Promise<TranInfo[]> {
    const lastEvents = await this.getLastEventsFromBlock(blockNumber)

    const tranPromises = lastEvents.map(e => {return this.web3.eth.getTransaction(e.transactionHash)})
    const transactions = await Promise.all(tranPromises)

    const blockPromises = transactions.map(t => {return this.web3.eth.getBlock(t.blockNumber ?? 1)})
    const blocks = await Promise.all(blockPromises)

    const blockDict = Object.fromEntries(blocks.map((b) => [b.number, new Date(parseFloat(b.timestamp.toString()) * 1000)]));

    const result = transactions.map(t => {
      return {
        id: t.transactionIndex?.toString(),
        date: blockDict[t.blockNumber ?? 1].toLocaleString().toString(),
        crypto: 'ETH',
        amount: ethers.utils.formatUnits(ethers.utils.parseUnits(t.value, 0), 18),
        status: 'SUCCESS',
        from: t.from,
        value: t.value,
        hash: t.hash
      } as TranInfo
    })

    return result
  }

  async getLastTransactions(): Promise<TranInfo[]> {
    return await this.getLastTransactionsFromBlock(1)
  }

  async getLastEvents() {
    return await this.getLastEventsFromBlock(1)
  }  
}
