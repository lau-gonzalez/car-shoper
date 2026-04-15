'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCarPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const body = {
      make: formData.get('make'),
      model: formData.get('model'),
      year: Number(formData.get('year')),
      price: Number(formData.get('price')),
      mileage: Number(formData.get('mileage') || 0),
      description: formData.get('description') || undefined,
      images: JSON.stringify(
        (formData.get('images') as string)
          ?.split(',')
          .map((s) => s.trim())
          .filter(Boolean) || [],
      ),
      status: formData.get('status') || 'available',
    };

    const res = await fetch('/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to create car');
      return;
    }

    router.push('/seller/dashboard');
  }

  const fieldStyle = { width: '100%', padding: 8, marginBottom: 4 };

  return (
    <main style={{ maxWidth: 500, margin: '40px auto', padding: '0 16px' }}>
      <h1>Add New Car</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="make">Make *</label>
          <br />
          <input id="make" name="make" required style={fieldStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="model">Model *</label>
          <br />
          <input id="model" name="model" required style={fieldStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="year">Year *</label>
          <br />
          <input
            id="year"
            name="year"
            type="number"
            min={1900}
            max={2100}
            required
            style={fieldStyle}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="price">Price *</label>
          <br />
          <input
            id="price"
            name="price"
            type="number"
            min={1}
            step="0.01"
            required
            style={fieldStyle}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="mileage">Mileage</label>
          <br />
          <input
            id="mileage"
            name="mileage"
            type="number"
            min={0}
            defaultValue={0}
            style={fieldStyle}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="description">Description</label>
          <br />
          <textarea
            id="description"
            name="description"
            rows={3}
            style={fieldStyle}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="images">Image URLs (comma-separated)</label>
          <br />
          <input id="images" name="images" style={fieldStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="status">Status</label>
          <br />
          <select id="status" name="status" defaultValue="available" style={fieldStyle}>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '8px 16px' }}>
          Create Car
        </button>
        <a href="/seller/dashboard" style={{ marginLeft: 12 }}>
          Cancel
        </a>
      </form>
    </main>
  );
}
