"use client";

import { useEffect, useState } from 'react';

type Member = { id: number; name: string; email: string };

export default function UserSelector() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3000/api/members')
      .then((r) => r.json())
      .then((data) => setMembers(data || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('selectedMemberId');
      if (raw) setSelectedId(Number(raw));
    } catch (e) {}
  }, []);

  const onChange = (value: string) => {
    const id = Number(value) || null;
    setSelectedId(id);
    try { localStorage.setItem('selectedMemberId', String(id)); } catch (e) {}
    const ev = new CustomEvent('memberChange', { detail: { id } });
    window.dispatchEvent(ev);
  };

  const selectedName = members.find((m) => m.id === selectedId)?.name ?? 'Wybierz użytkownika';

  return (
    <div className="ml-4">
      <label className="sr-only">Wybierz czytelnika</label>
      <div className="inline-flex items-center space-x-2">
        <select
          value={selectedId ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="bg-gray-700 text-gray-100 px-3 py-1 rounded-md border border-gray-600 focus:outline-none"
        >
          <option value="">-- {loading ? 'Ładowanie...' : 'Wybierz czytelnika'} --</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
          ))}
        </select>
        <div className="text-sm text-gray-200 hidden sm:block">{selectedId ? `Wybrany: ${selectedName}` : ''}</div>
      </div>
    </div>
  );
}
