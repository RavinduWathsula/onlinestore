import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { cartApi, ordersApi, otpApi } from '../services/api';
import { useToast } from '../context/ToastContext';

function formatMoney(amount) {
  return `LKR ${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function cardLabel(cardType) {
  const map = {
    visa: 'Visa Sri Lanka',
    mastercard: 'Mastercard Sri Lanka',
    lankaqr: 'LankaQR Linked Card',
  };
  return map[cardType] || 'Card';
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [summary, setSummary] = useState({ total: 0, count: 0 });
  const [loadingCart, setLoadingCart] = useState(true);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [cardType, setCardType] = useState('visa');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpId, setOtpId] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const [smsMessage, setSmsMessage] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const { showToast } = useToast();

  const loadCart = async () => {
    setLoadingCart(true);
    try {
      const res = await cartApi.list();
      setCartItems(res.data.data || []);
      setSummary(res.data.summary || { total: 0, count: 0 });
    } catch {
      showToast('Could not load cart for checkout', 'error');
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const canSendOtp = useMemo(() => {
    const digits = cardNumber.replace(/\D+/g, '');
    const phoneDigits = phone.replace(/\D+/g, '');
    return (
      digits.length === 16 &&
      /^(0?7\d{8}|947\d{8})$/.test(phoneDigits) &&
      /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiryDate) &&
      pin.length >= 3
    );
  }, [cardNumber, expiryDate, pin, phone]);

  const sendOtp = async () => {
    if (!canSendOtp) {
      showToast('Enter valid 16-digit card, expiry, PIN, and Sri Lankan phone number', 'error');
      return;
    }

    setSendingOtp(true);
    try {
      const response = await otpApi.send(phone);
      const data = response.data?.data || {};
      setOtpId(Number(data.otp_id || 0));
      setOtpCode('');
      setOtpVerified(false);
      setSmsMessage(`OTP sent to ${data.phone || phone}. Please check your SMS inbox.`);
      showToast(response.data?.message || 'OTP sent to your phone');
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to send OTP to phone';
      showToast(message, 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpId) {
      showToast('Send OTP first', 'error');
      return;
    }

    if (otpCode.length !== 6) {
      showToast('Enter the 6-digit OTP code', 'error');
      return;
    }

    setVerifyingOtp(true);
    try {
      await otpApi.verify({ otp_id: otpId, phone, otp_code: otpCode });
      setOtpVerified(true);
      showToast('OTP verified successfully');
    } catch (error) {
      setOtpVerified(false);
      const message = error?.response?.data?.message || 'Invalid OTP code';
      showToast(message, 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const buildInvoiceHtml = (bill) => {
    const rows = bill.items
      .map(
        (item) => `
          <tr>
            <td style="padding:10px;border-bottom:1px solid #dbe4ff;">${item.name}</td>
            <td style="padding:10px;border-bottom:1px solid #dbe4ff;text-align:center;">${item.quantity}</td>
            <td style="padding:10px;border-bottom:1px solid #dbe4ff;text-align:right;">${formatMoney(item.price)}</td>
            <td style="padding:10px;border-bottom:1px solid #dbe4ff;text-align:right;">${formatMoney(item.total)}</td>
          </tr>
        `
      )
      .join('');

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>NeoCart Bill #${bill.orderId}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f7ff; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 920px; margin: 0 auto; background: #fff; border-radius: 18px; padding: 24px; box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12); }
    .brand { font-size: 26px; font-weight: 800; margin: 0; color: #1d4ed8; }
    .meta { display:flex; justify-content: space-between; gap:16px; margin-top: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 18px; }
    .totals { margin-top: 16px; text-align: right; font-weight: 700; }
    .pill { display:inline-block; padding:6px 12px; border-radius:999px; background:#e0ebff; color:#1e40af; font-size:12px; font-weight:700; }
  </style>
</head>
<body>
  <div class="card">
    <h1 class="brand">NeoCart Payment Bill</h1>
    <div class="meta">
      <div>
        <p><strong>Order ID:</strong> #${bill.orderId}</p>
        <p><strong>Date:</strong> ${new Date(bill.date).toLocaleString()}</p>
      </section>
      <div>
        <p><strong>Payment:</strong> ${bill.paymentMethodLabel}</p>
        <p><strong>Status:</strong> <span class="pill">PAID SUCCESSFULLY</span></p>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="text-align:left;padding:10px;border-bottom:2px solid #bfdbfe;">Item</th>
          <th style="text-align:center;padding:10px;border-bottom:2px solid #bfdbfe;">Qty</th>
          <th style="text-align:right;padding:10px;border-bottom:2px solid #bfdbfe;">Unit Price</th>
          <th style="text-align:right;padding:10px;border-bottom:2px solid #bfdbfe;">Line Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="totals">Total Paid: ${formatMoney(bill.total)}</p>
  </div>
</body>
</html>`;
  };

  const downloadBill = () => {
    if (!invoice) return;
    const html = buildInvoiceHtml(invoice);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neocart-bill-${invoice.orderId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) {
      showToast('Cart is empty', 'error');
      return;
    }

    if (paymentMethod === 'card' && !otpVerified) {
      showToast('Verify OTP before completing card payment', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload =
        paymentMethod === 'card'
          ? {
              payment_method: 'card',
              card_type: cardType,
              card_number: cardNumber,
              expiry_date: expiryDate,
              pin,
              phone,
              otp_id: otpId,
            }
          : { payment_method: 'cash_on_delivery' };

      const res = await ordersApi.checkout(payload);
      const orderId = res.data.order_id;
      const amount = Number(summary.total || 0);
      const paymentMethodLabel =
        paymentMethod === 'card'
          ? `${cardLabel(cardType)} • ****${cardNumber.replace(/\D+/g, '').slice(-4)}`
          : 'Cash on Delivery';

      if (paymentMethod === 'card') {
        setSmsMessage(`SMS to ${phone}: Payment successful for ${formatMoney(amount)}. Ref: #${orderId}.`);
      }

      setInvoice({
        orderId,
        date: res.data.order?.created_at || new Date().toISOString(),
        items: cartItems.map((item) => ({
          name: item.name,
          quantity: Number(item.quantity),
          price: Number(item.price),
          total: Number(item.quantity) * Number(item.price),
        })),
        total: amount,
        paymentMethodLabel,
      });

      setCartItems([]);
      setSummary({ total: 0, count: 0 });
      showToast(`Order #${orderId} created successfully`);
    } catch (error) {
      const message = error?.response?.data?.message || 'Checkout failed';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCart) {
    return (
      <div className="mx-auto max-w-5xl glass p-6">
        <p className="text-slate-300">Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="glass p-6">
        <h1 className="text-3xl font-bold">Secure Checkout</h1>
        <p className="mt-2 text-slate-300">Choose payment type, verify OTP for card payments, and download your payment bill.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass p-6">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          {cartItems.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-white/20 bg-white/5 p-5 text-sm text-slate-400">
              No items in cart. <Link to="/products" className="text-blue-300 underline">Browse products</Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?auto=format&fit=crop&w=200&q=80'}
                    alt={item.name}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-slate-400">Qty {item.quantity} x {formatMoney(item.price)}</p>
                  </div>
                  <p className="font-semibold text-blue-300">{formatMoney(Number(item.quantity) * Number(item.price))}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Items</span>
              <span>{summary.count}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-slate-300">
              <span>Delivery</span>
              <span>{formatMoney(0)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-lg font-bold">
              <span>Total</span>
              <span className="text-blue-300">{formatMoney(summary.total)}</span>
            </div>
          </div>
        </div>

        <div className="glass p-6">
          <h2 className="text-xl font-semibold">Payment</h2>
          <div className="mt-4 space-y-3">
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
              <span>Cash on Delivery</span>
              <input type="radio" name="payment" checked={paymentMethod === 'cash_on_delivery'} onChange={() => setPaymentMethod('cash_on_delivery')} />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
              <span>Card Payment (Sri Lanka)</span>
              <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
            </label>
          </div>

          {paymentMethod === 'card' && (
            <div className="mt-4 space-y-3">
              <select className="input-field" value={cardType} onChange={(e) => setCardType(e.target.value)}>
                <option value="visa">Visa Sri Lanka</option>
                <option value="mastercard">Mastercard Sri Lanka</option>
                <option value="lankaqr">LankaQR Linked Card</option>
              </select>
              <input
                className="input-field"
                placeholder="Card number (16 digits)"
                value={cardNumber}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D+/g, '').slice(0, 16);
                  setCardNumber(digits);
                  setOtpVerified(false);
                }}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="input-field"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => {
                    setExpiryDate(e.target.value);
                    setOtpVerified(false);
                  }}
                />
                <input
                  className="input-field"
                  placeholder="PIN"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D+/g, '').slice(0, 4));
                    setOtpVerified(false);
                  }}
                  type="password"
                />
              </div>
              <input
                className="input-field"
                placeholder="Sri Lanka phone number (07XXXXXXXX)"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setOtpVerified(false);
                }}
              />
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  className="input-field"
                  placeholder="Enter OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D+/g, '').slice(0, 6))}
                />
                <button type="button" className="btn-secondary" onClick={verifyOtp} disabled={verifyingOtp || !otpId}>
                  {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
              <button type="button" className="btn-secondary w-full" onClick={sendOtp} disabled={sendingOtp}>
                {sendingOtp ? 'Sending OTP...' : 'Send OTP to Phone'}
              </button>
              {otpVerified && <p className="text-sm text-emerald-300">OTP verified. Card payment is authorized.</p>}
            </div>
          )}

          <button type="button" className="btn-primary mt-6 w-full" disabled={loading || cartItems.length === 0} onClick={placeOrder}>
            {loading ? 'Processing payment...' : 'Confirm Payment'}
          </button>
        </div>
      </section>

      {smsMessage && (
        <section className="glass border border-emerald-400/30 p-6">
          <h3 className="text-lg font-semibold text-emerald-300">Phone Message</h3>
          <p className="mt-2 text-slate-200">{smsMessage}</p>
        </section>
      )}

      {invoice && (
        <section className="glass p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold">Payment Bill</h3>
              <p className="text-sm text-slate-300">Order #{invoice.orderId} • {invoice.paymentMethodLabel}</p>
            </div>
            <button type="button" className="btn-primary" onClick={downloadBill}>
              Download Bill
            </button>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Total Paid</span>
              <span className="text-xl font-bold text-blue-300">{formatMoney(invoice.total)}</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Payment successful. You can download and keep this bill for records.</p>
            <div className="mt-4">
              <Link to="/dashboard" className="btn-secondary inline-flex">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
