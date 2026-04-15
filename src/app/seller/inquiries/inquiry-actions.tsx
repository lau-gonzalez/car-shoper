'use client';

import { useRouter } from 'next/navigation';

export default function InquiryActions({
  inquiryId,
  currentStatus,
}: {
  inquiryId: string;
  currentStatus: string;
}) {
  const router = useRouter();

  async function updateStatus(status: string) {
    await fetch(`/api/inquiries/${inquiryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <span style={{ display: 'flex', gap: 4 }}>
      {currentStatus !== 'read' && (
        <button
          onClick={() => updateStatus('read')}
          style={{ fontSize: 12, padding: '2px 8px', cursor: 'pointer' }}
        >
          Mark Read
        </button>
      )}
      {currentStatus !== 'responded' && (
        <button
          onClick={() => updateStatus('responded')}
          style={{ fontSize: 12, padding: '2px 8px', cursor: 'pointer' }}
        >
          Responded
        </button>
      )}
    </span>
  );
}
