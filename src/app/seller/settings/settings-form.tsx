'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Agency {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  primaryColor: string | null;
  contactEmail: string | null;
  phone: string | null;
  address: string | null;
}

export default function SettingsForm({ agency }: { agency: Agency }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get('name'),
      contactEmail: formData.get('contactEmail') || null,
      phone: formData.get('phone') || null,
      address: formData.get('address') || null,
      logo: formData.get('logo') || null,
      primaryColor: formData.get('primaryColor') || null,
    };

    const res = await fetch('/api/agency/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to update settings');
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  const fieldStyle = { width: '100%', padding: 8, marginBottom: 4, boxSizing: 'border-box' as const };

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ color: '#666', marginBottom: 16 }}>
        Slug: <strong>{agency.slug}</strong> (not editable)
      </p>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="name">Agency Name *</label>
        <br />
        <input id="name" name="name" defaultValue={agency.name} required style={fieldStyle} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="contactEmail">Contact Email</label>
        <br />
        <input id="contactEmail" name="contactEmail" type="email" defaultValue={agency.contactEmail ?? ''} style={fieldStyle} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="phone">Phone</label>
        <br />
        <input id="phone" name="phone" defaultValue={agency.phone ?? ''} style={fieldStyle} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="address">Address</label>
        <br />
        <input id="address" name="address" defaultValue={agency.address ?? ''} style={fieldStyle} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="logo">Logo URL</label>
        <br />
        <input id="logo" name="logo" type="url" defaultValue={agency.logo ?? ''} placeholder="https://example.com/logo.png" style={fieldStyle} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="primaryColor">Primary Color</label>
        <br />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input id="primaryColor" name="primaryColor" defaultValue={agency.primaryColor ?? '#0070f3'} pattern="^#[0-9a-fA-F]{6}$" title="Hex color (e.g. #0070f3)" style={{ ...fieldStyle, flex: 1 }} />
          <input type="color" defaultValue={agency.primaryColor ?? '#0070f3'} onChange={(e) => {
            const input = document.getElementById('primaryColor') as HTMLInputElement;
            if (input) input.value = e.target.value;
          }} style={{ width: 40, height: 36, padding: 0, border: '1px solid #ddd' }} />
        </div>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Settings saved successfully!</p>}

      <button type="submit" style={{ padding: '8px 16px' }}>Save Settings</button>
      <a href="/seller/dashboard" style={{ marginLeft: 12 }}>Back to Dashboard</a>
    </form>
  );
}
