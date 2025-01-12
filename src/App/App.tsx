import React from 'react';
import './App.css';
import { AgGridWrapper } from '../AgGridWrapper/AgGridWrapper';
import { CCY, RawTransaction, Transaction } from '../types';

type State = Record<CCY, number>

export const App: React.FC = () => {
  const [currencies, setCurrencies] = React.useState<State | null>(null)
  const [transactions, setTransactions] = React.useState<Transaction[] | null>(null)

  React.useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/pln').then(a => a.json()).then(resp => {
      const { rates } = resp
      const { CHF, EUR, USD, GBP } = rates
      setCurrencies({
        CHF: 1 / CHF,
        EUR: 1 / EUR,
        USD: 1 / USD,
        GBP: 1 / GBP
      })
    })
  }, [])

  React.useEffect(() => {
    const eurPromise = fetch('transactions/eurTransactions.json').then(body => body.json())
    const usdPromise = fetch('transactions/usdTransactions.json').then(body => body.json())
    const gbpPromise = fetch('transactions/gbpTransactions.json').then(body => body.json())
    const chfPromise = fetch('transactions/chfTransactions.json').then(body => body.json())
    Promise.all([eurPromise, chfPromise, usdPromise, gbpPromise]).then((rawAllTransactions: RawTransaction[][]) => {
      const newTransactions: Transaction[] = rawAllTransactions.reduce((acc: Transaction[], rawCcyTransactions: RawTransaction[]) => {
        const mappedRawTransactions: Transaction[] = rawCcyTransactions.map(transaction => ({ ...transaction, date: new Date(transaction.date) }))
        return [...acc, ...mappedRawTransactions]
      }, [])

      setTransactions(newTransactions)
    })
  }, [])

  if (currencies === null || transactions === null) {
    return null
  }

  const enrichedTransactions = transactions.map(transaction => {
    const currentRate = currencies[transaction.ccy]
    const investmentValue = transaction.rate * transaction.value
    const currentValue = currentRate * transaction.value
    return {
      ...transaction,
      ROI: currentValue - investmentValue,
      investmentValue,
      currentValue
    }
  })

  return <AgGridWrapper transactions={enrichedTransactions} />
}