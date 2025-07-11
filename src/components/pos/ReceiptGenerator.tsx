"use client";

import { forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, Mail } from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

interface ReceiptData {
  orderNumber: string;
  restaurant: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  customer?: {
    name: string;
    phone?: string;
    email?: string;
  };
  tableNumber?: string;
  orderType: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  taxes: number;
  discounts: Array<{
    description: string;
    amount: number;
  }>;
  tips: number;
  total: number;
  paymentMethod: string;
  cashReceived?: number;
  change?: number;
  timestamp: string;
  staff: string;
}

interface ReceiptProps {
  data: ReceiptData;
  onPrint?: () => void;
  onDownload?: () => void;
  onEmail?: () => void;
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ data, onPrint, onDownload, onEmail }, ref) => {
    return (
      <div ref={ref} className="max-w-sm mx-auto bg-white">
        {/* Actions (only show when not printing) */}
        <div className="no-print mb-4 flex space-x-2">
          {onPrint && (
            <Button onClick={onPrint} size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          )}
          {onDownload && (
            <Button onClick={onDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          {onEmail && data.customer?.email && (
            <Button onClick={onEmail} variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          )}
        </div>

        {/* Receipt Content */}
        <Card className="receipt-content">
          <CardContent className="p-6 text-sm">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">{data.restaurant.name}</h2>
              <p className="text-gray-600">{data.restaurant.address}</p>
              <p className="text-gray-600">{data.restaurant.phone}</p>
              <p className="text-gray-600">{data.restaurant.email}</p>
            </div>

            <Separator className="my-4" />

            {/* Order Info */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="font-medium">Order #:</span>
                <span>{data.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{formatDate(data.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time:</span>
                <span>{formatTime(data.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>
                <span className="capitalize">
                  {data.orderType.replace("_", " ")}
                </span>
              </div>
              {data.tableNumber && (
                <div className="flex justify-between">
                  <span className="font-medium">Table:</span>
                  <span>{data.tableNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Server:</span>
                <span>{data.staff}</span>
              </div>
            </div>

            {/* Customer Info */}
            {data.customer && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2 mb-4">
                  <h3 className="font-medium">Customer:</h3>
                  <div className="text-gray-600">
                    <p>{data.customer.name}</p>
                    {data.customer.phone && <p>{data.customer.phone}</p>}
                    {data.customer.email && <p>{data.customer.email}</p>}
                  </div>
                </div>
              </>
            )}

            <Separator className="my-4" />

            {/* Items */}
            <div className="space-y-2 mb-4">
              <h3 className="font-medium">Items:</h3>
              {data.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span>{item.name}</span>
                      <span>{formatCurrency(item.price)}</span>
                    </div>
                    <div className="text-gray-600 text-xs">
                      Qty: {item.quantity} × {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    {formatCurrency(item.total)}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(data.subtotal)}</span>
              </div>

              {data.discounts.length > 0 && (
                <>
                  {data.discounts.map((discount, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-green-600"
                    >
                      <span>{discount.description}:</span>
                      <span>-{formatCurrency(discount.amount)}</span>
                    </div>
                  ))}
                </>
              )}

              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(data.taxes)}</span>
              </div>

              {data.tips > 0 && (
                <div className="flex justify-between">
                  <span>Tip:</span>
                  <span>{formatCurrency(data.tips)}</span>
                </div>
              )}

              <Separator className="my-2" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(data.total)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Payment Info */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Payment Method:</span>
                <span className="capitalize">
                  {data.paymentMethod.replace("_", " ")}
                </span>
              </div>

              {data.paymentMethod === "cash" && data.cashReceived && (
                <>
                  <div className="flex justify-between">
                    <span>Cash Received:</span>
                    <span>{formatCurrency(data.cashReceived)}</span>
                  </div>
                  {data.change && data.change > 0 && (
                    <div className="flex justify-between font-medium">
                      <span>Change:</span>
                      <span>{formatCurrency(data.change)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <Separator className="my-4" />

            {/* Footer */}
            <div className="text-center text-xs text-gray-600 space-y-1">
              <p>Thank you for your business!</p>
              <p>Please come again</p>
              {data.customer?.email && (
                <p>Receipt emailed to {data.customer.email}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

Receipt.displayName = "Receipt";

export default Receipt;

// Helper function to print receipt
export const printReceipt = (receiptElement: HTMLElement) => {
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .receipt-content { max-width: 300px; margin: 0 auto; }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${receiptElement.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  }
};
