import React from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css"
import './App.css';

export type CCY = 'EUR' | 'CHF' | 'USD'

export type Transaction = {
    value: number,
    ccy: CCY,
    rate: number,
    date: Date
}

export type RawTransaction = {
    value: number,
    ccy: CCY,
    rate: number,
    date: string
}

type State = Record<CCY, number>

type Enrichment = { ROI: number, currentValue: number, investmentValue: number }

export const App: React.FC = () => {
  const [currencies, setCurrencies] = React.useState<State | null>(null)
  const [transactions, setTransactions] = React.useState<Transaction[] | null>(null)

  React.useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/pln').then(a => a.json()).then(resp => {
      const { rates } = resp
      const { CHF, EUR, USD } = rates
      setCurrencies({
        CHF: 1 / CHF,
        EUR: 1 / EUR,
        USD: 1/ USD
      })
    })
  }, [])

  React.useEffect(() => {
    const eurPromise = fetch('transactions/eurTransactions.json').then(body => body.json())
    const usdPromise = fetch('transactions/usdTransactions.json').then(body => body.json())
    const chfPromise = fetch('transactions/chfTransactions.json').then(body => body.json())
    Promise.all([eurPromise, chfPromise, usdPromise]).then((rawAllTransactions: RawTransaction[][]) => {
      const newTransactions: Transaction[] = rawAllTransactions.reduce((acc: Transaction[], rawCcyTransactions: RawTransaction[]) => {
        const mappedRawTransactions: Transaction[] = rawCcyTransactions.map(transaction => ({...transaction, date: new Date(transaction.date)}))
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

const FIXED_DECIMALS = (decimals: number) => (a: {value: number}) => a.value.toFixed(decimals)
const TWO_DECIMALS = FIXED_DECIMALS(2)
const FOUR_DECIMALS = FIXED_DECIMALS(4)

export const AgGridWrapper = (props: { transactions: (Transaction & Enrichment)[] }) => {
  const colDefs = React.useMemo(() => [
    { field: "ccy", filter: "agTextColumnFilter", cellDataType: 'text' },
    { field: "value", filter: "agNumberColumnFilter", cellDataType: 'number', valueFormatter: TWO_DECIMALS},
    { field: "rate", filter: "agNumberColumnFilter", cellDataType: 'number', valueFormatter: FOUR_DECIMALS },
    { field: "ROI", filter: "agNumberColumnFilter", cellDataType: 'number', valueFormatter: TWO_DECIMALS },
    { field: "investmentValue", filter: "agNumberColumnFilter", cellDataType: 'number', valueFormatter: TWO_DECIMALS },
    { field: "currentValue", filter: "agNumberColumnFilter", cellDataType: 'number', valueFormatter: TWO_DECIMALS },
    { field: "date", filter: "agDateColumnFilter", cellDataType: 'date'}
  ], [])

  return (
    <div
      className="ag-theme-quartz"
      style={{ height: 900 }}
    >
      <AgGridReact
        rowData={props.transactions}
        columnDefs={colDefs as any}
        rowClassRules={{
          "positive-investment": (a: any) => {
              return a.data.ROI > 0
            },
            "negative-investment": (a: any) => {
              return a.data.ROI < 0
          }
        }}
      />
    </div>
  )
}
