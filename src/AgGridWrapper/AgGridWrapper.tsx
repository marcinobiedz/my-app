import React from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css"
import './AgGridWrapper.css';
import { Transaction } from '../types';

type Enrichment = { ROI: number, currentValue: number, investmentValue: number }

const FIXED_DECIMALS = (decimals: number) => (a: { value: number }) => a.value.toFixed(decimals)
const TWO_DECIMALS = FIXED_DECIMALS(2)
const FOUR_DECIMALS = FIXED_DECIMALS(4)

export const AgGridWrapper = (props: { transactions: (Transaction & Enrichment)[] }) => {
  const colDefs = React.useMemo(() => [
    { field: "ccy", filter: "agTextColumnFilter", cellDataType: 'text' },
    { field: "value", filter: "agNumberColumnFilter", cellDataType: 'number', valueFormatter: TWO_DECIMALS },
    { field: "rate", filter: "agNumberColumnFilter", cellDataType: 'number', valueFormatter: FOUR_DECIMALS },
    { field: "ROI", filter: "agNumberColumnFilter", cellDataType: 'number', valueFormatter: TWO_DECIMALS },
    { field: "investmentValue", filter: "agNumberColumnFilter", cellDataType: 'number', valueFormatter: TWO_DECIMALS },
    { field: "currentValue", filter: "agNumberColumnFilter", cellDataType: 'number', valueFormatter: TWO_DECIMALS },
    { field: "date", filter: "agDateColumnFilter", cellDataType: 'date' }
  ], [])

  return (
    <div
      className="ag-theme-quartz"
      style={{ height: '95vh' }}
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
