import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCartItems } from '@/store/shop/cart-slice';
import { cartEvents } from '@/utils/cartEvents';

const CartProvider = ({ children }) => {
  const dispatch = useDispatch();

  // IMPORTANT: shopCart slice (not cart)
  const { user } = useSelector((state) => state?.auth || {});
  const { lastUpdated } = useSelector((state) => state?.shopCart || {});

  /**
   * Load cart items for the authenticated user
   */
  const loadCart = useCallback(async () => {
    if (!user?.id) return;

    try {
      await dispatch(fetchCartItems(user.id)).unwrap();
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  }, [dispatch, user?.id]);

  /**
   * Initial cart fetch on login / refresh
   */
  useEffect(() => {
    if (user?.id) {
      loadCart();
    }
  }, [loadCart, user?.id]);

  /**
   * Sync cart across tabs + custom cart events
   */
  useEffect(() => {
    if (!user?.id) return;

    const handleStorageChange = (event) => {
      if (event.key !== 'cart_last_updated') return;

      const lastSyncTime = lastUpdated
        ? new Date(lastUpdated).getTime()
        : 0;

      const shouldRefresh = Date.now() - lastSyncTime > 5000;

      if (shouldRefresh) {
        loadCart();
      }
    };

    const handleCartUpdateEvent = () => {
      loadCart();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cart-updated', handleCartUpdateEvent);

    // Custom event bus subscription
    const unsubscribe = cartEvents.subscribe(handleCartUpdateEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart-updated', handleCartUpdateEvent);

      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [loadCart, user?.id, lastUpdated]);

  return <>{children}</>;
};

export default CartProvider;
