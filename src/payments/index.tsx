import './index.css'

import { useEffect, useRef, useState } from 'react'
import { Form, Button, Dropdown, Modal } from 'react-bootstrap' 
import { QRCodeSVG } from 'qrcode.react';
import { WalletHistory } from './history/WalletHistory';
import { ethers } from 'ethers';
import Web3 from 'web3';

export default function PaymentManager() {
  const wallet = process.env.REACT_APP_ETHEREUM_WALLET
  const chainId = process.env.REACT_APP_NETWORK_CHAIN_ID

  const walletHistory = new WalletHistory()

  const [dateStr, setDateStr] = useState('')
  const dateStrRef = useRef(dateStr)

  const [amount, setAmount] = useState<ethers.BigNumber>(ethers.utils.parseUnits('0', 0))
  const [amountStr, setAmountStr] = useState('0')
  const amountStrRef = useRef(amountStr)
  
  const [currencyAmountStr, setCurrencyAmountStr] = useState('0')
  const [currencyAmount, setCurrencyAmount] = useState(0)

  const [lastBlockNumber, setLastBlockNumber] = useState(1)
  const lastBlockNumberRef = useRef(lastBlockNumber);
  
  const [headerSub, setHeaderSub] = useState<any>()

  const [paymentStatus, setPaymentStatus] = useState<string>('Created')

  const currencies = ['USD', 'EUR']
  const [currency, setCurrency] = useState<string | null>(currencies[0])

  const cryptos = ['ETH']
  const [cryptoToPay, setCryptoToPay] = useState<string | null>(cryptos[0])
  const [cryptoToConvert, setCryptoToConvert] = useState<string | null>(cryptos[0])

  const [showQrCodeModal, setShowQrCodeModal] = useState(false)
  const showQrCodeModalRef = useRef(showQrCodeModal);

  const web3 = new Web3(Web3.givenProvider)

  const openQrModalWindow = async () => {
    const blockNumber = await walletHistory.getLastBlockNumber()
    const curDate = new Date()
    setPaymentStatus('Created')
    setLastBlockNumber(blockNumber)
    setDateStr(curDate.toLocaleString().toString())
    setShowQrCodeModal(true)
  }

  const closeQrModalWindow = () => {
    setShowQrCodeModal(false)
  }

  const updateStatus = async () => {
    console.log('Updating...')
    const newTransactions = await walletHistory.getLastTransactionsFromBlock(lastBlockNumberRef.current)

    if (!newTransactions) return

    const transaction = newTransactions.find((t) => {return t.amount == amountStrRef.current})
    if (transaction) setPaymentStatus('Paid')
  }

  const renderMainPage = () => {
    return (
      <div className='form'>
        <div className='title'>
          Create Payment Link
        </div>
        <div className='content d-flex flex-column'>
            <div className='innerform d-flex flex-column'>
              <div className='currencyinfo d-flex justify-content-between'>
                <div className='currencyinput d-flex flex-column col-xl-3 col-lg-5 col-md-5'>
                  <div className='currency d-flex flex-column'>
                    {renderCurrencyDropdown()}
                    {renderCryptoDropdown(0)}
                  </div>
                </div>
                <div className='currencyinput d-flex flex-column col-xl-3 col-lg-5 col-md-5'>
                  <div className='crypto d-flex flex-column'>
                    {renderAmountField()}
                    {renderCryptoDropdown(1)}
                  </div>
                </div>
                <div className='currencyinput conversioninfo d-flex flex-column col-xl-3 col-lg-5 col-md-5'>
                  <div className='crypto d-flex flex-column'>
                    <div className='amountdetails d-flex flex-row row'>
                      <div className='col text-start floatleft'>Amount:</div>
                      <div className='col text-end floatright'>{formatCurrencyAmount(currencyAmount)}</div>                      
                    </div>
                    <div className='amountdetails d-flex flex-row'>
                      <div className='col text-start floatleft'>Comission:</div>
                      <div className='col text-end floatright'>{formatCurrencyAmount(0)}</div>
                    </div>
                    <div className='amountdetails d-flex flex-row mt-auto total'>
                      <div className='col text-start floatleft'>Total:</div>
                      <div className='col text-end floatright'>{formatCurrencyAmount(currencyAmount)}</div>
                    </div>
                  </div>
                </div>
              </div>              
            </div>
            <div className='linkinfo d-flex flex-column'>
              <div>
                Payment link will be created:
              </div>
              <div className='linkblock row'>
                <div className='linkinfoblock col'>
                  <div className='total'>Client Pays:</div>
                  <div className='amountparttitle'>{formatCurrencyAmount(currencyAmount)} {currency}</div>
                </div>
                <div className='linkinfoblock col'>
                  <div className='total'>Currency to Recieve:</div>
                  <div className='amountparttitle'>{formatCryptoAmount(amountStr)} {cryptoToPay}</div>
                </div>
                <div className='linkinfoblock col'>
                  <div className='total'>Currency to Convert:</div>
                  <div className='amountparttitle'>{formatCryptoAmount(amountStr)} {cryptoToPay}</div>
                </div>
              </div>
            </div>
            <div className='createpayment'>
              <Button
              onClick={()=> {openQrModalWindow()}}>
                Create Payment Link
              </Button>
            </div>
        </div>
        {renderEthereumQRCode()}
      </div>
    )
  }

  const renderCurrencyDropdown = () => {
    return (
      <div className='amountpart'>
        <Form.Label className='amountparttitle'>Currency to Convert</Form.Label>
        <Dropdown 
          className='dropdown'
          id="dropdown-currency"
          onSelect={setCurrency}
        >
          <Dropdown.Toggle
            variant='default'
            className='dropdownbtn'
            size='sm'
          >
            {currency}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {currencies.map(c => <Dropdown.Item key={`dcur-i-${c}`} eventKey={c}>{c}</Dropdown.Item>)}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    )
  }

  const renderCryptoDropdown = (id: number) => {
    return (
      <div className='amountpart'>
        <Form.Label className='amountparttitle'>{id == 0 ? 'Crypto Currency (to pay)' : 'Crypto Currency to Convert'}</Form.Label>
        <Dropdown   
          className='dropdown'
          id={`dropdown-currency-${id}`}
          onSelect={id == 0 ? setCryptoToPay : setCryptoToConvert}
        >
          <Dropdown.Toggle
            variant='default'
            className='dropdownbtn'
            size='sm'
          >
            {id == 0 ? cryptoToPay : cryptoToConvert}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {cryptos.map(c => <Dropdown.Item key={`dc-${id}-${c}`} eventKey={c}>{c}</Dropdown.Item>)}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    )
  }

  const correctCurrencyInput = (value: string) => {
    if (!value) return false
    return /^\-?\d*\d+.?(\d{1,2})?$/.test(value)
  }

  const correctEtherInput = (value: string) => {
    if (!value) return false
    return /^\d*(?:[.,]\d*)?$/.test(value)
  }

  const handleCurrencyAmountInput = (value: string) => {
    if (!value) {
      value = '0'
    }

    if (correctCurrencyInput(value)) {
      if (value.length == 2 && value.startsWith('0') && !value.startsWith('0.'))
      {
        setCurrencyAmountStr(parseFloat(value).toString())
      } else 
      {
        setCurrencyAmountStr(value)
      }
      setCurrencyAmount(parseFloat(value))
      handleAmountInput(getEthAmount(parseFloat(value)))
    }
  }

  const getEthAmount = (currencyAmount: number) => {
    const price = currency === 'USD' ? 1921.19 : 1950.30
    const etherAmount = (currencyAmount / price).toPrecision(12).toString()
    return etherAmount
  }
  const formatCurrencyAmount = (amount: number) => {
    return Intl.NumberFormat('en-US', {style: 'currency', currency: currency ?? 'USD' }).format(amount)
  }

  const formatCryptoAmount = (amount: string)  => {
    const decimalPlace = amount.indexOf('.')
    const decimalPlaces = amount.length - (decimalPlace >= 0 ? decimalPlace + 1: amount.length)

    if (decimalPlaces > 6) {
      return amount.substring(0, decimalPlace + 6 + 1)
    }

    return amount
  }

  const handleAmountInput = (value: string) => {
    if (correctEtherInput(value)) {

      const decimalPlace = value.indexOf('.')
      const decimalPlaces = value.length - (decimalPlace >= 0 ? decimalPlace + 1: value.length)

      const amountValue = value.replace('.', '')
      const amountInWei = ethers.BigNumber.from(parseFloat(amountValue)).mul(ethers.BigNumber.from(10).pow(18-decimalPlaces))
      setAmount(amountInWei)

      setAmountStr(value)
    } else {
      setAmount(ethers.utils.parseUnits('0', 0))
      setAmountStr(value)
    }
  }

  const renderAmountField = () => {
    return (
      <div className='amountpart'>
        <Form.Label className='amountparttitle'>Amount</Form.Label>
        <Form.Control 
          type='text'
          className='amount'
          onChange={(e) => handleCurrencyAmountInput(e.target.value)}
          value={currencyAmountStr}
        />
      </div>
    )
  }

  const renderEthereumQRCode = () => {
    if (!amount) return

    const show = amount > ethers.utils.parseUnits('0', 18) && showQrCodeModal
    if (!show && showQrCodeModal) closeQrModalWindow()

    const qrCodeUrl = `ethereum:${wallet}@${chainId}?value=${amount.toString()}`

    return (
        <Modal size='lg' show={show} onHide={() => closeQrModalWindow()}>
          <Modal.Header closeButton>
            <Modal.Title>Link Created Successfully!</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div className='modalcontent'>
              <div className='modalheader'>
                <span>Status: </span><div className={paymentStatus === 'Created' ? 'modalheadercreated' : 'modalheaderpaid'}>{paymentStatus}</div>
              </div>
              <div className='modalbody d-flex flex-row'>
                <div className='modalbody-main d-flex flex-column col-4'>
                  <div className='qrcode'>
                    <QRCodeSVG value={qrCodeUrl} size={250} />
                  </div>
                  <div className='qrcodeinfo d-flex flex-column'>
                    <div className='d-flex flex-column'>
                      <div className='qrtotaldetails d-flex flex-row row'>
                        <div className='col text-start floatleft'>Amount:</div>
                        <div className='col text-end floatright qrtotaldetailsamount'>{formatCurrencyAmount(currencyAmount)}</div>                      
                      </div>
                      <div className='qrtotaldetails d-flex flex-row'>
                        <div className='col text-start floatleft'>Comission:</div>
                        <div className='col text-end floatright qrtotaldetailsamount'>{formatCurrencyAmount(0)}</div>
                      </div>
                      <div className='qrtotaldetails d-flex flex-row'>
                        <div className='col text-start floatleft'>Total:</div>
                        <div className='col text-end floatright qrtotaldetailsamount'>{formatCurrencyAmount(currencyAmount)}</div>
                      </div>
                      <div className='qrtotaldetails d-flex flex-row'>
                        <div className='col text-start floatleft'>Amount to pay:</div>
                        <div className='col text-end floatright qrtotaldetailsamount'>{formatCryptoAmount(amountStr)} {cryptoToPay}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='modalbody-details d-flex flex-column col-5 ms-auto'>
                  <div className='modalbody-details-block1 d-flex flex-column'>
                    <div className='d-flex flex-column'>
                      <div className='qrtotaldetails d-flex flex-row row'>
                        <div className='col text-start floatleft qrchequel'>Payment ID:</div>
                        <div className='col text-end floatright qrchequer'>1234567</div>
                      </div>
                      <div className='qrtotaldetails d-flex flex-row'>
                        <div className='col text-start floatleft qrchequel'>Date:</div>
                        <div className='col-7 text-end floatright qrchequer'>{dateStrRef.current}</div>
                      </div>
                      <div className='qrtotaldetails d-flex flex-row'>
                        <div className='col text-start floatleft qrchequel'>Recepient:</div>
                        <div className='col text-end floatright qrchequer'>Platform</div>
                      </div>
                    </div>                    
                  </div>
                  <div className='modalbody-details-block2 d-flex flex-column'>
                    <div className='chequelinkinfo d-flex flex-column'>
                      <div className='linkblock d-flex flex-column row'>
                        <div className='chequelinkinfoblock col'>
                          <div className='chequetotal'>Client Pays:</div>
                          <div className='chequeamount'>{formatCurrencyAmount(currencyAmount)} {currency}</div>
                        </div>
                        <div className='chequelinkinfoblock col'>
                          <div className='chequetotal'>Currency to Recieve:</div>
                          <div className='chequeamount'>{formatCryptoAmount(amountStr)} {cryptoToPay}</div>
                        </div>
                        <div className='chequelinkinfoblock col'>
                          <div className='chequetotal'>Currency to Convert:</div>
                          <div className='chequeamount'>{formatCryptoAmount(amountStr)} {cryptoToPay}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='modalbody-details-block3 d-flex flex-column row'>
                    <div className='qrlinkdetails d-flex flex-row'>
                      <div className='col text-start floatleft qrlinkl'>Copy link:</div>
                      <div className='col-7 text-end floatright qrlinkr'>https://demo.demo.com/pay/79ed0c</div>
                    </div>
                    <div className='qrlinkdetails d-flex flex-row'>
                      <div className='col text-start floatleft qrlinkl'>Copy address:</div>
                      <div className='col-7 text-end floatright qrlinkr'>{wallet}</div>
                    </div>                    
                  </div>
                  <div className='modalbody-details-block4 d-flex flex-row justify-content-between mt-auto'>
                    <Button className='modalbtn' onClick={() => {walletHistory.getLastEvents()}}>Print</Button>
                    <Button className='modalbtn'>Show on screen</Button>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>      
    )
  }
  
  const handleSubscribe = () => {
    if (!!headerSub) return

    const headersub = web3.eth.subscribe(
      'newBlockHeaders',
      (error, result) => {
      if (error)
          console.log(`Error: ${error}`)
      })
      .on("data", (t) => {
        if (!showQrCodeModalRef.current) return
        updateStatus()
      })

    setHeaderSub(headersub)
  }
  
  useEffect(() => {
    handleSubscribe()
  }, [])  

  useEffect(() => {
    showQrCodeModalRef.current = showQrCodeModal
  }, [showQrCodeModal])

  useEffect(() => {
    lastBlockNumberRef.current = lastBlockNumber
  }, [lastBlockNumber])

  useEffect(() => {
    amountStrRef.current = amountStr
  }, [amountStr])

  useEffect(() => {
    dateStrRef.current = dateStr  
  }, [dateStr])

  return renderMainPage()
}
