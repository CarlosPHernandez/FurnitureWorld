'use client'

import { forwardRef } from 'react'
import Image from 'next/image'

interface PrintInvoiceProps {
  invoice: {
    invoiceNumber: string
    customerName: string
    customerEmail?: string
    customerPhone?: string
    customerAddress?: string
    date: string
    dueDate: string
    items: {
      description: string
      quantity: number
      unitPrice: number
      total: number
    }[]
    subtotal: number
    tax: number
    total: number
    notes?: string
  }
  companyLogo?: string
}

const PrintInvoice = forwardRef<HTMLDivElement, PrintInvoiceProps>(({ invoice, companyLogo }, ref) => {
  return (
    <div ref={ref} className="p-8 bg-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
          <p className="text-gray-600 mt-1">{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right flex flex-col items-end">
          {companyLogo ? (
            <div className="mb-2">
              <Image
                src={companyLogo}
                alt="Company Logo"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
          ) : (
            <h2 className="text-xl font-bold text-gray-900">Family Mattress</h2>
          )}
          <p className="text-gray-600">123 Furniture Street</p>
          <p className="text-gray-600">City, State 12345</p>
          <p className="text-gray-600">Phone: (555) 123-4567</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-8">
        <h3 className="text-gray-600 font-medium mb-2">Bill To:</h3>
        <p className="text-gray-900 font-medium">{invoice.customerName}</p>
        {invoice.customerAddress && (
          <p className="text-gray-600 mt-1">{invoice.customerAddress}</p>
        )}
        {invoice.customerPhone && (
          <p className="text-gray-600 mt-1">Phone: {invoice.customerPhone}</p>
        )}
        {invoice.customerEmail && (
          <p className="text-gray-600 mt-1">Email: {invoice.customerEmail}</p>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <p className="text-gray-600">Invoice Date:</p>
          <p className="text-gray-900">{invoice.date}</p>
        </div>
        <div>
          <p className="text-gray-600">Due Date:</p>
          <p className="text-gray-900">{invoice.dueDate}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4">Description</th>
            <th className="text-right py-3 px-4">Quantity</th>
            <th className="text-right py-3 px-4">Unit Price</th>
            <th className="text-right py-3 px-4">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-3 px-4">{item.description}</td>
              <td className="text-right py-3 px-4">{item.quantity}</td>
              <td className="text-right py-3 px-4">${item.unitPrice.toFixed(2)}</td>
              <td className="text-right py-3 px-4">${item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900">${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Tax:</span>
            <span className="text-gray-900">${invoice.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-t border-gray-200 font-bold">
            <span>Total:</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-8">
          <h3 className="text-gray-600 font-medium mb-2">Notes:</h3>
          <p className="text-gray-900 whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-600 text-sm mt-16">
        <p>Thank you for your business!</p>
        <p className="mt-1">Payment is due by {invoice.dueDate}</p>
        <p className="mt-4">For questions regarding this invoice, please contact us at (555) 123-4567</p>
      </div>
    </div>
  )
})

PrintInvoice.displayName = 'PrintInvoice'

export default PrintInvoice 