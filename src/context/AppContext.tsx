import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Booking } from '../lib/engine';
import { loadBookings, loadOfferClaimed, saveBookings, saveOfferClaimed } from '../lib/storage';

type Ctx = {
  bookings: Booking[];
  addBooking: (b: Booking) => void;
  removeBooking: (id: string) => void;
  offerClaimed: boolean;
  claimOffer: () => void;
  ready: boolean;
};

const AppContext = createContext<Ctx | null>(null);

export function useApp() {
  const c = useContext(AppContext);
  if (!c) throw new Error('useApp must be used inside <AppProvider>');
  return c;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [offerClaimed, setOfferClaimed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      setBookings(await loadBookings());
      setOfferClaimed(await loadOfferClaimed());
      setReady(true);
    })();
  }, []);

  const addBooking = useCallback((b: Booking) => {
    setBookings(prev => {
      const next = [...prev, b];
      saveBookings(next);
      return next;
    });
  }, []);

  const removeBooking = useCallback((id: string) => {
    setBookings(prev => {
      const next = prev.filter(b => b.id !== id);
      saveBookings(next);
      return next;
    });
  }, []);

  const claimOffer = useCallback(() => {
    setOfferClaimed(true);
    saveOfferClaimed();
  }, []);

  const value = useMemo(() => ({ bookings, addBooking, removeBooking, offerClaimed, claimOffer, ready }), [bookings, addBooking, removeBooking, offerClaimed, claimOffer, ready]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
