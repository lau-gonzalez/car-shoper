'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  description: string | null;
  images: string;
  status: string;
}

export default function EditCarPage() {
  const router = useRouter();
  const params = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cars/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(setCar)
      .catch(() => setError('Car not found'))
      .finally(() => setLoading(false));
  }, [params.id]);

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
      description: formData.get('description') || null,
      images: JSON.stringify(
        (formData.get('images') as string)
          ?.split(',')
          .map((s) => s.trim())
          .filter(Boolean) || [],
      ),
      status: formData.get('status'),
    };

    const res = await fetch(`/api/cars/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to update car');
      return;
    }

    router.push('/seller/dashboard');
  }

  if (loading) return <p style={{ textAlign: 'center', marginTop: 80 }}>Loading...</p>;
  if (!car) return <p style={{ textAlign: 'center', marginTop: 80, color: 'red' }}>{error}</p>;

  const images = (() => {
    try {
      return JSON.parse(car.images).join(', ');
    } catch {
      return '';
    }
  })();

  const fieldStyle = { width: '100%', padding: 8, marginBottom: 4 };

  return (
    <main style={{ maxWidth: 500, margin: '40px auto', padding: '0 16px' }}>
      <h1>Edit Car</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="make">Make *</label>
          <br />
          <input id="make" name="make" defaultValue={car.make} required style={fieldStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="model">Model *</label>
          <br />
          <input id="model" name="model" defaultValue={car.model} required style={fieldStyle} />
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
            defaultValue={car.year}
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
            defaultValue={car.price}
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
            defaultValue={car.mileage}
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
            defaultValue={car.description ?? ''}
            style={fieldStyle}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="images">Image URLs (comma-separated)</label>
          <br />
          <input id="images" name="images" defaultValue={images} style={fieldStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="status">Status</label>
          <br />
          <select id="status" name="status" defaultValue={car.status} style={fieldStyle}>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '8px 16px' }}>
          Save Changes
        </button>
        <a href="/seller/dashboard" style={{ marginLeft: 12 }}>
          Cancel
        </a>
      </form>
    </main>
  );
}
