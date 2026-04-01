import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { cartApi, ordersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DELIVERY_FEE = 450;

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

function onlyCardDigits(value) {
  return String(value || '').replace(/\D+/g, '').slice(0, 16);
}

function formatCardNumber(value) {
  return onlyCardDigits(value)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();
}

function normalizePhoneInput(value) {
  const raw = String(value || '').trim();
  if (raw.startsWith('+')) {
    return '+' + raw.slice(1).replace(/\D+/g, '');
  }
  return raw.replace(/\D+/g, '');
}

function isValidSriLankaPhone(value) {
  const normalized = normalizePhoneInput(value);
  return /^(07\d{8}|94\d{9}|\+94\d{9})$/.test(normalized);
}

export default function CheckoutPage() {
  const { coupons, removeCoupon } = useAuth();
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
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
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

  const canPayWithCard = useMemo(() => {
    const digits = onlyCardDigits(cardNumber);
    return (
      digits.length === 16 &&
      isValidSriLankaPhone(phone) &&
      /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiryDate) &&
      pin.length >= 3
    );
  }, [cardNumber, expiryDate, pin, phone]);

  const subtotal = Number(summary.total || 0);
  const activeCoupon = coupons.find((coupon) => coupon.code === selectedCoupon) || null;
  const couponDiscount = activeCoupon
    ? activeCoupon.type === 'percent'
      ? (subtotal * Number(activeCoupon.value || 0)) / 100
      : Number(activeCoupon.value || 0)
    : 0;
  const totalPayable = Math.max(0, subtotal + DELIVERY_FEE - couponDiscount);

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
    body { font-family: Arial, sans-serif; background: radial-gradient(circle at top right, #1d4ed8 0%, #0f172a 45%, #050816 100%); margin: 0; padding: 28px; color: #e2e8f0; }
    .card { max-width: 920px; margin: 0 auto; background: linear-gradient(145deg, rgba(14,24,54,0.96), rgba(8,12,32,0.96)); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 22px; padding: 28px; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.45); }
    .brand { font-size: 28px; font-weight: 800; margin: 0; color: #93c5fd; letter-spacing: 0.5px; }
    .meta { display:flex; justify-content: space-between; gap:16px; margin-top: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 18px; }
    .totals { margin-top: 16px; text-align: right; font-weight: 800; font-size: 22px; color: #93c5fd; }
    th { color: #cbd5e1; }
    td { color: #e2e8f0; }
    .note { margin-top: 12px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <h1 class="brand">NeoCart Payment Bill</h1>
    <div class="meta">
      <div>
        <p><strong>Order ID:</strong> #${bill.orderId}</p>
        <p><strong>Date:</strong> ${new Date(bill.date).toLocaleString()}</p>
      </div>
      <div>
        <p><strong>Payment:</strong> ${bill.paymentMethodLabel}</p>
        ${bill.couponCode ? `<p><strong>Coupon:</strong> ${bill.couponCode}</p>` : ''}
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
    <p style="margin-top:12px;text-align:right;color:#bfdbfe;">Subtotal: ${formatMoney(bill.subtotal ?? bill.total)}</p>
    <p style="margin-top:6px;text-align:right;color:#86efac;">Discount: -${formatMoney(bill.discountAmount ?? 0)}</p>
    <p class="totals">Total Paid: ${formatMoney(bill.total)}</p>
    <p class="note">Thank you for shopping with NeoCart. Keep this bill for your records.</p>
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

    if (paymentMethod === 'card' && !canPayWithCard) {
      showToast('Enter valid 16-digit card, expiry, PIN, and Sri Lankan phone number', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload =
        paymentMethod === 'card'
          ? {
              payment_method: 'card',
              coupon_code: selectedCoupon || undefined,
              card_type: cardType,
              card_number: onlyCardDigits(cardNumber),
              expiry_date: expiryDate,
              pin,
              phone: normalizePhoneInput(phone),
            }
          : { payment_method: 'cash_on_delivery', coupon_code: selectedCoupon || undefined };

      const res = await ordersApi.checkout(payload);
      const orderId = res.data.order_id;
      const amount = Number(res.data?.order?.total_amount ?? totalPayable);
      const paymentMethodLabel =
        paymentMethod === 'card'
          ? `${cardLabel(cardType)} • ****${onlyCardDigits(cardNumber).slice(-4)}`
          : 'Cash on Delivery';

      if (paymentMethod === 'card') {
        setSmsMessage(`SMS to ${normalizePhoneInput(phone)}: Payment successful for ${formatMoney(amount)}. Ref: #${orderId}.`);
      } else {
        setSmsMessage(`Order #${orderId} placed with Cash on Delivery. Total payable: ${formatMoney(amount)}.`);
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
        subtotal: Number(res.data.order?.subtotal_amount ?? subtotal),
        discountAmount: Number(res.data.order?.discount_amount ?? couponDiscount),
        couponCode: res.data.order?.coupon_code || selectedCoupon || null,
        total: amount,
        paymentMethodLabel,
      });

      if (selectedCoupon) {
        removeCoupon(selectedCoupon);
      }

      setCartItems([]);
      setSummary({ total: 0, count: 0 });
      setSelectedCoupon('');
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
        <p className="mt-2 text-slate-300">Choose payment type, complete payment securely, and download your creative receipt.</p>
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
              <span>{formatMoney(DELIVERY_FEE)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-emerald-300">
              <span>Coupon discount</span>
              <span>- {formatMoney(couponDiscount)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-lg font-bold">
              <span>Total</span>
              <span className="text-blue-300">{formatMoney(totalPayable)}</span>
            </div>
          </div>
        </div>

        <div className="glass p-6">
          <h2 className="text-xl font-semibold">Payment</h2>
          <div className="mt-4">
            <label className="mb-2 block text-sm text-slate-300">Choose coupon (optional)</label>
            <select
              className="input-field"
              value={selectedCoupon}
              onChange={(e) => setSelectedCoupon(e.target.value)}
            >
              <option value="">No coupon</option>
              {coupons.map((coupon) => (
                <option key={coupon.code} value={coupon.code}>
                  {coupon.code} - {coupon.title}
                </option>
              ))}
            </select>
            {!coupons.length ? (
              <p className="mt-2 text-xs text-slate-400">Collect coupons from the Home page first.</p>
            ) : null}
          </div>

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
                placeholder="Card number (1234 5678 9012 3456)"
                value={formatCardNumber(cardNumber)}
                inputMode="numeric"
                maxLength={19}
                onChange={(e) => {
                  const digits = onlyCardDigits(e.target.value);
                  setCardNumber(digits);
                }}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="input-field"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
                <input
                  className="input-field"
                  placeholder="PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D+/g, '').slice(0, 4))}
                  type="password"
                />
              </div>
              <input
                className="input-field"
                placeholder="Sri Lanka phone number (07XXXXXXXX)"
                value={phone}
                inputMode="tel"
                onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
              />
              <p className="text-xs text-slate-400">Card must be exactly 16 digits in 4-4-4-4 format.</p>
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
            {invoice.couponCode ? (
              <p className="mb-2 text-sm text-emerald-300">Coupon used: {invoice.couponCode}</p>
            ) : null}
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
