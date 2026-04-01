import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const quickPrompts = [
  'How to use coupons?',
  'How long is delivery?',
  'Where can I track my order?',
  'Can I pay cash on delivery?',
  'How do I edit my profile?',
  'How do I download my receipt?',
];

const defaultHints =
  'You can ask about products, coupons, cart, checkout, card payment, delivery, dashboard, profile updates, and receipt downloads.';

const supportRules = [
  {
    test: /(coupon|discount|code|save)/i,
    reply:
      'You can collect coupons on Home in the Coupon Drops section, then apply one coupon during checkout before payment. Available coupons include free-delivery and 5% discount options for all products.',
  },
  {
    test: /(delivery|shipping|arrive|dispatch)/i,
    reply:
      'Island-wide delivery usually takes 24 to 48 hours for available products. You can check order progress in your dashboard.',
  },
  {
    test: /(product|item|details|brand|color|customi[sz]e|option|size)/i,
    reply:
      'Open Products and click any item card to view full details like brand, color, available options, and customer reviews before checkout.',
  },
  {
    test: /(cart|quantity|total|amount)/i,
    reply:
      'In Cart you can increase or decrease quantity and totals update automatically. Then continue to checkout for payment.',
  },
  {
    test: /(track|order status|where is my order|dashboard)/i,
    reply:
      'Open your Dashboard to see your recent orders, payment details, and downloadable receipts.',
  },
  {
    test: /(cash|cod|cash on delivery)/i,
    reply:
      'Yes, Cash on Delivery is available. You can choose it at checkout under payment method.',
  },
  {
    test: /(card|visa|mastercard|payment)/i,
    reply:
      'Card payment is supported with 16-digit validation in 4-4-4-4 format. Enter card type, card number, expiry date, and PIN at checkout, then confirm payment.',
  },
  {
    test: /(receipt|bill|invoice|download)/i,
    reply:
      'After payment, open Dashboard and click Download Receipt for any order to get the payment bill file.',
  },
  {
    test: /(free ship|free delivery)/i,
    reply:
      'Free-delivery coupons remove the standard delivery charge at checkout. Collect them on Home and apply one before payment.',
  },
  {
    test: /(5%|five percent|percent discount)/i,
    reply:
      'The 5% coupon applies to product subtotal during checkout. Select it in the coupon list before confirming payment.',
  },
  {
    test: /(profile|address|phone|edit)/i,
    reply:
      'In Dashboard, click Edit Profile to update your name, phone, and address. Email is kept read-only.',
  },
  {
    test: /(contact|agent|support|help)/i,
    reply:
      'I can help with orders, coupons, payments, and account settings. Ask your question and I will guide you step by step.',
  },
];

function generateSupportReply(message) {
  for (const rule of supportRules) {
    if (rule.test.test(message)) {
      return rule.reply;
    }
  }

  return defaultHints;
}

export default function SupportAgentWidget() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'agent',
      text: 'Hi, I am your NeoCart support agent. Ask me anything about orders, delivery, payment, coupons, or your account.',
    },
  ]);
  const messageListRef = useRef(null);
  const messageEndRef = useRef(null);

  const canSend = useMemo(() => value.trim().length > 0, [value]);

  useEffect(() => {
    if (!open) return;
    const node = messageListRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, open]);

  const sendMessage = (text) => {
    const clean = text.trim();
    if (!clean) return;

    const userMessage = { id: `u-${Date.now()}`, role: 'user', text: clean };
    const agentMessage = { id: `a-${Date.now()}-${Math.random()}`, role: 'agent', text: generateSupportReply(clean) };

    setMessages((prev) => [...prev, userMessage, agentMessage]);
    setValue('');
  };

  return (
    <>
      {open ? (
        <div className="support-widget" role="dialog" aria-label="Customer support chat">
          <div className="support-widget__header">
            <p className="support-widget__title">
              <Bot size={16} /> Support Agent
            </p>
            <button
              type="button"
              className="support-widget__close"
              aria-label="Close support chat"
              onClick={() => setOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="support-widget__messages" aria-live="polite" ref={messageListRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.role === 'agent' ? 'support-msg support-msg--agent' : 'support-msg support-msg--user'}
              >
                {message.text}
              </div>
            ))}
            <div ref={messageEndRef} aria-hidden="true" />
          </div>

          <div className="support-widget__quick">
            {quickPrompts.map((prompt) => (
              <button
                type="button"
                key={prompt}
                className="support-widget__quick-chip"
                onClick={() => sendMessage(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            className="support-widget__composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(value);
            }}
          >
            <input
              type="text"
              className="support-widget__input"
              placeholder="Ask your question"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            <button type="submit" className="support-widget__send" disabled={!canSend}>
              <Send size={15} />
            </button>
          </form>

          <div className="support-widget__footer">
            Need account actions? <Link to="/dashboard">Open dashboard</Link>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="support-widget-toggle"
        onClick={() => setOpen(true)}
        aria-label="Open support chat"
      >
        <MessageCircle size={18} />
        <span>Support</span>
      </button>
    </>
  );
}
