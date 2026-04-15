'use client';

import { useState } from 'react';

export default function ContactForm({ carId }: { carId: string }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      customerName: formData.get('customerName'),
      email: formData.get('email'),
      phone: formData.get('phone') || undefined,
      message: formData.get('message'),
      carId,
      _hp: formData.get('_hp'),
    };

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.status === 429) {
        setError('Too many requests. Please try again later.');
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to send inquiry');
        return;
      }

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const fieldStyle = { width: '100%', padding: 8, boxSizing: 'border-box' as const };

  return (
    <div style={{ marginTop: 32, padding: 20, background: '#f0f7ff', borderRadius: 8 }}>
      <h3 style={{ margin: '0 0 16px' }}>Interested in this car?</h3>

      {success ? (
        <p style={{ color: 'green' }}>
          Your inquiry has been sent! The seller will get back to you soon.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Honeypot field - hidden from users, filled by bots */}
          <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
            <input name="_hp" tabIndex={-1} autoComplete="off" />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label htmlFor="customerName">Your Name *</label>
            <br />
            <input id="customerName" name="customerName" required style={fieldStyle} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="email">Email *</label>
            <br />
            <input id="email" name="email" type="email" required style={fieldStyle} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="phone">Phone</label>
            <br />
            <input id="phone" name="phone" type="tel" style={fieldStyle} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="message">Message *</label>
            <br />
            <textarea id="message" name="message" rows={4} required maxLength={2000} style={fieldStyle} />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" disabled={submitting} style={{ padding: '8px 16px', cursor: submitting ? 'wait' : 'pointer' }}>
            {submitting ? 'Sending...' : 'Send Inquiry'}
          </button>
        </form>
      )}
    </div>
  );
}
