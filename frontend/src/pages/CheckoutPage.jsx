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
  const { user, coupons, removeCoupon } = useAuth();
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
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; min-height: 100vh; margin: 0; display: grid; place-items: center; background: radial-gradient(circle at 20% 15%, #3047a4 0%, #141d45 36%, #080b1f 78%, #05070f 100%); color: #e2e8f0; padding: 24px; }
    .stage { width: 100%; max-width: 1024px; }
    .paper { width: 100%; background: linear-gradient(160deg, rgba(18,28,62,0.98), rgba(10,15,38,0.98)); border: 1px solid rgba(147, 197, 253, 0.35); border-radius: 28px; padding: 30px; box-shadow: 0 24px 70px rgba(7, 11, 33, 0.65), inset 0 1px 0 rgba(255,255,255,0.18); position: relative; overflow: hidden; }
    .paper:before { content: ''; position: absolute; inset: -80px auto auto -60px; width: 280px; height: 280px; background: radial-gradient(circle, rgba(96,165,250,0.35), transparent 72%); pointer-events: none; }
    .paper:after { content: ''; position: absolute; inset: auto -80px -90px auto; width: 320px; height: 320px; background: radial-gradient(circle, rgba(167,139,250,0.25), transparent 72%); pointer-events: none; }
    .brand { position: relative; font-size: 30px; font-weight: 800; margin: 0; color: #dbeafe; letter-spacing: 0.6px; }
    .meta { position: relative; display:flex; justify-content: space-between; gap:20px; margin-top: 14px; }
    .meta p { margin: 8px 0; color: #cbd5e1; }
    .customer { position: relative; margin-top: 14px; border: 1px solid rgba(148,163,184,0.28); border-radius: 14px; padding: 12px 14px; background: rgba(15,23,42,0.38); }
    .customer p { margin: 6px 0; font-size: 13px; color: #cbd5e1; }
    table { width: 100%; border-collapse: collapse; margin-top: 18px; }
    .totals { margin-top: 16px; text-align: right; font-weight: 800; font-size: 22px; color: #bfdbfe; }
    th { color: #cbd5e1; }
    td { color: #e2e8f0; }
    .note { margin-top: 12px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="stage">
  <div class="paper">
    <h1 class="brand">NeoCart Premium Receipt</h1>
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
    <div class="customer">
      <p><strong>Customer:</strong> ${bill.customerName || 'Customer'}</p>
      <p><strong>Phone:</strong> ${bill.customerPhone || 'Not provided'}</p>
      <p><strong>Address:</strong> ${bill.customerAddress || 'Not provided'}</p>
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
        customerName: user?.name || '',
        customerPhone: normalizePhoneInput(phone) || user?.phone || '',
        customerAddress: user?.address || '',
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
    <div className="checkout-shell mx-auto max-w-6xl space-y-6">
      <section className="checkout-hero glass p-6">
        <span className="checkout-hero__badge">NEOCART CHECKOUT</span>
        <h1 className="checkout-hero__title text-3xl font-bold">Secure Checkout Experience</h1>
        <p className="mt-2 text-slate-300">Choose your payment style, apply collected coupons, and finish your order with a premium billing flow.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="checkout-card glass p-6">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          {cartItems.length === 0 ? (
            <div className="checkout-empty mt-4 p-5 text-sm text-slate-300">
              <div className="checkout-empty__orb" aria-hidden="true" />
              <p className="checkout-empty__eyebrow">ORDER SUMMARY</p>
              <h3 className="checkout-empty__title">No items in your cart</h3>
              <p className="checkout-empty__subtitle">Your payment is complete and cart is now clean. Discover fresh drops and add your next favorite items.</p>
              <Link to="/products" className="checkout-empty__link">Browse products</Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-item-card flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
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

          <div className="checkout-totals mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
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

        <div className="checkout-card checkout-payment glass p-6">
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
            <label className="checkout-pay-option flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
              <span>Cash on Delivery</span>
              <input type="radio" name="payment" checked={paymentMethod === 'cash_on_delivery'} onChange={() => setPaymentMethod('cash_on_delivery')} />
            </label>
            <label className="checkout-pay-option flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
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
        <section className="checkout-message glass border border-emerald-400/30 p-6">
          <h3 className="text-lg font-semibold text-emerald-300">Phone Message</h3>
          <p className="mt-2 text-slate-200">{smsMessage}</p>
        </section>
      )}

      {invoice && (
        <section className="checkout-card glass p-6">
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
