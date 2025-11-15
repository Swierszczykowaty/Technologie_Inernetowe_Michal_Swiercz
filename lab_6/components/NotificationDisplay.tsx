'use client';

import { useNotification } from '@/context/NotificationContext';

export default function NotificationDisplay() {
  const { notification, hideNotification } = useNotification();

  if (!notification) {
    return null;
  }

  const { ok, status, url, message } = notification;

  return (
    <div className={`fixed bottom-4 right-4 z-50 w-80 p-3 rounded-md shadow-lg ${ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-bold">Odpowiedź API: {url}</div>
          <div className="text-xs">Status: {status} — {ok ? 'OK' : 'Błąd'}</div>
          {message && <div className="text-xs mt-1">Wiadomość: {message}</div>}
        </div>
        <button onClick={hideNotification} className="ml-3 text-sm font-bold px-2 py-1 rounded hover:bg-gray-700 hover:text-white">×</button>
      </div>
    </div>
  );
}