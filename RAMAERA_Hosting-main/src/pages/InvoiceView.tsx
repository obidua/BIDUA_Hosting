import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  gst_percent?: number;
  tds_percent?: number;
  amount: number;
}

interface Invoice {
  id: string | number;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  amount_paid: number;
  balance_due: number;
  payment_status: string;
  status: string;
  description?: string;
  items: InvoiceItem[];
  currency?: string;
  payment_method?: string;
  payment_date?: string;
  payment_reference?: string;
}

export function InvoiceView() {
  const { invoiceId} = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [invoice, setInvoice] = useState<Invoice | null>(location.state?.invoice || null);
  const [loading, setLoading] = useState(!invoice);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/api/v1/invoices/${invoiceId}`);
      setInvoice(data);
    } catch (error) {
      console.error('Failed to load invoice:', error);
      alert('Failed to load invoice');
      navigate('/dashboard/billing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!invoice && invoiceId) {
      loadInvoice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  const handleDownload = () => {
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading invoice...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Invoice not found</div>
      </div>
    );
  }

  const cgst = invoice.tax_amount / 2;
  const sgst = invoice.tax_amount / 2;

  return (
    <>
      <style>
        {`
          @media print {
            html, body {
              background: white !important;
              margin: 0;
              padding: 0;
            }
            
            .print\\:hidden {
              display: none !important;
            }
            
            * {
              box-shadow: none !important;
              text-shadow: none !important;
              filter: none !important;
              backdrop-filter: none !important;
            }
            
            .no-print {
              display: none !important;
            }
            
            @page {
              margin: 15mm;
              size: A4;
            }
            
            .page-break {
              page-break-before: always;
            }
          }
        `}
      </style>
      
      <div className="min-h-screen bg-slate-950 py-8">
        <div className="max-w-[210mm] mx-auto px-4">
          
          {/* Header Actions - Hidden in print */}
          <div className="flex items-center justify-between mb-6 print:hidden no-print">
            <button
              onClick={() => navigate('/dashboard/billing')}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Billing</span>
            </button>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition border border-cyan-500/30"
              >
                Print
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
              >
                Save as PDF
              </button>
            </div>
          </div>

          {/* Professional Invoice Document */}
          <div className="bg-white text-black shadow-xl">
            
            {/* Header with Logo and Invoice Number */}
            <div className="border-b-4 border-teal-600 p-8">
              <div className="flex justify-between items-start">
                {/* Company Logo & Name */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 bg-teal-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">B</span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">BIDUA INDUSTRIES</h1>
                      <p className="text-sm text-slate-600">PVT LTD</p>
                    </div>
                  </div>
                </div>
                
                {/* Invoice Number & Status */}
                <div className="text-right">
                  <div className="text-4xl font-bold text-teal-600 mb-2">INVOICE</div>
                  <div className="text-2xl font-semibold text-slate-700">{invoice.invoice_number}</div>
                </div>
              </div>
            </div>

            {/* Invoice Details Section */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-8 mb-8">
                
                {/* Issue Date & For */}
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Issue Date:</div>
                    <div className="text-base font-medium">{new Date(invoice.invoice_date).toLocaleDateString('en-GB')}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Due Date:</div>
                    <div className="text-base font-medium text-red-600">{new Date(invoice.due_date).toLocaleDateString('en-GB')}</div>
                  </div>
                  
                  <div className="pt-4">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Issue For:</div>
                    <div className="font-semibold text-base">Valued Customer</div>
                    <div className="text-sm text-slate-600 mt-1">Account ID: {invoice.id}</div>
                    {invoice.description && (
                      <div className="text-sm text-slate-600 mt-2">{invoice.description}</div>
                    )}
                  </div>
                </div>

                {/* Issued By */}
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Issued By:</div>
                  <div className="font-semibold text-base mb-2">BIDUA Industries Pvt Ltd</div>
                  <div className="text-sm text-slate-700 space-y-0.5">
                    <p>Office 201, B 158, Sector 63,</p>
                    <p>Noida, Uttar Pradesh 201301</p>
                    <p>India</p>
                    <p className="mt-2 font-medium">GSTIN: 09AAMCR4056L1ZS</p>
                    <p>PAN Number: AAMCR4056L</p>
                    <p>SAC: 998315</p>
                    <p className="mt-2">Email: support@bidua.com</p>
                    <p>Phone: +91 120 416 8464</p>
                  </div>
                </div>
              </div>

              {/* Item Description Table */}
              <div className="mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-y-2 border-slate-300">
                      <th className="text-left py-3 px-4 text-sm font-bold text-slate-700">Item Description</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-slate-700">Qty</th>
                      <th className="text-right py-3 px-4 text-sm font-bold text-slate-700">Amount</th>
                      <th className="text-right py-3 px-4 text-sm font-bold text-slate-700">Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items?.map((item, index) => (
                      <tr key={index} className="border-b border-slate-200">
                        <td className="py-4 px-4 text-sm text-slate-700">
                          <div className="font-medium">{item.description}</div>
                          <div className="text-xs text-slate-500 mt-1">SAC: 998315</div>
                        </td>
                        <td className="py-4 px-4 text-center text-sm text-slate-700">{item.quantity}</td>
                        <td className="py-4 px-4 text-right text-sm font-semibold text-slate-900">
                          Rs. {Number(item.amount || 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-right text-sm text-green-600">
                          {item.discount_percent ? `Rs. ${(Number(item.amount) * Number(item.discount_percent) / 100).toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end mb-8">
                <div className="w-80">
                  <div className="space-y-2 border-t-2 border-slate-300 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="font-semibold">Rs. {Number(invoice.subtotal || 0).toFixed(2)}</span>
                    </div>
                    
                    {invoice.tax_amount > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">9.00% CGST:</span>
                          <span className="font-semibold">Rs. {cgst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">9.00% SGST:</span>
                          <span className="font-semibold">Rs. {sgst.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    
                    {invoice.amount_paid > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Credits / Paid:</span>
                        <span className="font-semibold">Rs. {Number(invoice.amount_paid).toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-lg font-bold border-t-2 border-slate-300 pt-3 mt-3">
                      <span>Total:</span>
                      <span className="text-teal-600">Rs. {Number(invoice.total_amount || 0).toFixed(2)}</span>
                    </div>
                    
                    {invoice.balance_due > 0 && (
                      <div className="flex justify-between text-lg font-bold text-red-600 bg-red-50 -mx-2 px-2 py-2 rounded">
                        <span>Balance Due:</span>
                        <span>Rs. {Number(invoice.balance_due).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Information if Paid */}
              {invoice.payment_status === 'paid' && invoice.payment_date && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                  <h3 className="font-semibold text-green-900 mb-2">✓ Payment Received</h3>
                  <div className="text-sm text-green-800 space-y-1">
                    <p><span className="font-semibold">Payment Date:</span> {new Date(invoice.payment_date).toLocaleString('en-GB')}</p>
                    <p><span className="font-semibold">Payment Method:</span> {invoice.payment_method || 'Razorpay'}</p>
                    {invoice.payment_reference && (
                      <p><span className="font-semibold">Reference:</span> {invoice.payment_reference}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Terms & Conditions */}
              <div className="border-t-2 border-slate-200 pt-6 mt-6">
                <h3 className="font-bold text-sm mb-3 text-slate-900">PAYMENT TERMS & CONDITIONS</h3>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p><strong>Payment Terms:</strong> Payment is due within 7 days from the invoice date. Late payments may incur additional charges.</p>
                  <p><strong>Accepted Payment Methods:</strong> Bank Transfer, Credit/Debit Card, UPI, Razorpay, and other digital payment methods.</p>
                  <p><strong>Refund Policy:</strong> Refunds are processed as per our Service Level Agreement. Please contact support for refund requests.</p>
                  <p><strong>Service Continuity:</strong> Services will remain active as long as payments are up to date. Suspension may occur for overdue accounts.</p>
                  <p><strong>Taxes:</strong> All prices are inclusive of applicable GST (18% - 9% CGST + 9% SGST) as per Indian tax regulations.</p>
                  <p><strong>Disputes:</strong> Any billing disputes must be raised within 15 days of invoice date.</p>
                </div>
              </div>

              {/* Bank Details for Payment */}
              {invoice.payment_status !== 'paid' && (
                <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded">
                  <h3 className="font-bold text-sm mb-3">BANK DETAILS FOR PAYMENT</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Account Name:</p>
                      <p className="font-semibold">BIDUA Industries Pvt Ltd</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Bank Name:</p>
                      <p className="font-semibold">HDFC Bank</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Account Number:</p>
                      <p className="font-semibold">50200012345678</p>
                    </div>
                    <div>
                      <p className="text-slate-600">IFSC Code:</p>
                      <p className="font-semibold">HDFC0001234</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-600">UPI ID:</p>
                      <p className="font-semibold">bidua@hdfcbank</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                <p className="text-sm text-slate-600 mb-2">Thank you for your business!</p>
                <p className="text-xs text-slate-500">This is a computer-generated invoice and does not require a signature.</p>
                <p className="text-xs text-slate-500 mt-3">
                  For any queries, please contact us at <span className="font-semibold">support@bidua.com</span> or call <span className="font-semibold">+91 120 416 8464</span>
                </p>
                <p className="text-xs text-slate-400 mt-4">© 2025 BIDUA Industries Pvt Ltd. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
