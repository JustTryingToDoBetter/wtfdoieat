import { useCallback, useState } from 'react';
import { getFavourites, getRestaurantId, toggleFavourite as storageToggle } from '../lib/storage';

export function useFavourites() {
  const [favourites, setFavourites] = useState(() => getFavourites());

  /**
   * Toggle saved state for a restaurant. Returns whether the restaurant is
   * NOW favourited (true = just added, false = just removed).
   */
  const toggle = useCallback((restaurant) => {
    const updated = storageToggle(restaurant);
    setFavourites(updated);
    const id = getRestaurantId(restaurant);
    return updated.some((f) => (f.favId || f.placeId) === id);
  }, []);

  const isFav = useCallback(
    (restaurantOrId) => {
      const id =
        typeof restaurantOrId === 'string' ? restaurantOrId : getRestaurantId(restaurantOrId);
      return favourites.some((f) => (f.favId || f.placeId) === id);
    },
    [favourites]
  );

  return { favourites, toggle, isFav };
}
