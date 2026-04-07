import { useState, useEffect, useCallback } from 'react';
import { Coordinates, UserLocationState } from '../types/location';

export const useUserLocation = () => {
  const [state, setState] = useState<UserLocationState>({
    coordinates: null,
    loading: false,
    error: null,
    permission: 'prompt'
  });

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        permission: 'denied'
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        setState({
          coordinates,
          loading: false,
          error: null,
          permission: 'granted'
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        let permission: 'granted' | 'denied' | 'prompt' = 'denied';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            permission = 'denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
            break;
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          permission
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, []);

  // Watch user's location (continuous updates)
  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return null;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        const coordinates: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        setState(prev => ({
          ...prev,
          coordinates,
          loading: false,
          error: null,
          permission: 'granted'
        }));
      },
      (error) => {
        console.error('Error watching location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1 minute
      }
    );
  }, []);

  // Stop watching location
  const stopWatching = useCallback((watchId: number) => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Request permission (for better UX)
  const requestPermission = useCallback(async (): Promise<'granted' | 'denied' | 'prompt'> => {
    if (!navigator.permissions) {
      return 'prompt';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setState(prev => ({ ...prev, permission: permission.state as any }));
      return permission.state as 'granted' | 'denied' | 'prompt';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return 'prompt';
    }
  }, []);

  // Check if location is available
  const isLocationAvailable = useCallback(() => {
    return !!navigator.geolocation;
  }, []);

  // Reset location state
  const resetLocation = useCallback(() => {
    setState({
      coordinates: null,
      loading: false,
      error: null,
      permission: 'prompt'
    });
  }, []);

  // Get distance from user to a point
  const getDistanceTo = useCallback((point: Coordinates): number | null => {
    if (!state.coordinates) return null;

    const R = 6371; // Earth's radius in kilometers
    const dLat = (point.lat - state.coordinates.lat) * Math.PI / 180;
    const dLng = (point.lng - state.coordinates.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(state.coordinates.lat * Math.PI / 180) * Math.cos(point.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, [state.coordinates]);

  return {
    ...state,
    getCurrentLocation,
    watchLocation,
    stopWatching,
    requestPermission,
    isLocationAvailable,
    resetLocation,
    getDistanceTo
  };
};
