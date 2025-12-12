/**
 * File: watchlist-button.tsx
 * Purpose: Button component to add/remove property from watchlist
 */

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { addToWatchlist, removeFromWatchlist } from '@/actions/watchlist';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface WatchlistButtonProps {
  propertyId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function WatchlistButton({
  propertyId,
  variant = 'outline',
  size = 'sm',
}: WatchlistButtonProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Check if property is in watchlist
  const { data: watchlistEntry } = useQuery({
    queryKey: ['watchlist-check', propertyId],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from('watchlist')
        .select('id')
        .eq('user_id', user.user.id)
        .eq('property_id', propertyId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsInWatchlist(!!watchlistEntry);
  }, [watchlistEntry]);

  // Add to watchlist mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('propertyId', propertyId);
      return addToWatchlist(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist-check', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      setIsInWatchlist(true);
    },
  });

  // Remove from watchlist mutation
  const removeMutation = useMutation({
    mutationFn: async () => {
      return removeFromWatchlist(propertyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist-check', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      setIsInWatchlist(false);
    },
  });

  const handleClick = () => {
    if (isInWatchlist) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  };

  const isLoading = addMutation.isPending || removeMutation.isPending;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      {isInWatchlist ? (
        <>
          <BookmarkCheck className="h-4 w-4 mr-2" />
          In Watchlist
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4 mr-2" />
          Add to Watchlist
        </>
      )}
    </Button>
  );
}

