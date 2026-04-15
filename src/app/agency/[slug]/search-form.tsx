'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchForm({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      if (value) params.set(key, value as string);
    }

    router.push(`/agency/${slug}?${params.toString()}`);
  }

  function handleReset() {
    router.push(`/agency/${slug}`);
  }

  const inputStyle = { padding: 6, width: '100%', boxSizing: 'border-box' as const };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 12,
        marginBottom: 24,
        padding: 16,
        background: '#f8f8f8',
        borderRadius: 8,
      }}
    >
      <div>
        <label htmlFor="make" style={{ fontSize: 12, fontWeight: 600 }}>Make</label>
        <br />
        <input id="make" name="make" defaultValue={searchParams.get('make') ?? ''} style={inputStyle} />
      </div>
      <div>
        <label htmlFor="model" style={{ fontSize: 12, fontWeight: 600 }}>Model</label>
        <br />
        <input id="model" name="model" defaultValue={searchParams.get('model') ?? ''} style={inputStyle} />
      </div>
      <div>
        <label htmlFor="minYear" style={{ fontSize: 12, fontWeight: 600 }}>Min Year</label>
        <br />
        <input id="minYear" name="minYear" type="number" defaultValue={searchParams.get('minYear') ?? ''} style={inputStyle} />
      </div>
      <div>
        <label htmlFor="maxYear" style={{ fontSize: 12, fontWeight: 600 }}>Max Year</label>
        <br />
        <input id="maxYear" name="maxYear" type="number" defaultValue={searchParams.get('maxYear') ?? ''} style={inputStyle} />
      </div>
      <div>
        <label htmlFor="minPrice" style={{ fontSize: 12, fontWeight: 600 }}>Min Price</label>
        <br />
        <input id="minPrice" name="minPrice" type="number" defaultValue={searchParams.get('minPrice') ?? ''} style={inputStyle} />
      </div>
      <div>
        <label htmlFor="maxPrice" style={{ fontSize: 12, fontWeight: 600 }}>Max Price</label>
        <br />
        <input id="maxPrice" name="maxPrice" type="number" defaultValue={searchParams.get('maxPrice') ?? ''} style={inputStyle} />
      </div>
      <div style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
        <button type="submit" style={{ padding: '6px 16px', cursor: 'pointer' }}>Search</button>
        <button type="button" onClick={handleReset} style={{ padding: '6px 12px', cursor: 'pointer' }}>Clear</button>
      </div>
    </form>
  );
}
