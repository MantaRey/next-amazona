import React, { useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Store } from '../utils/store';
import useStyles from '../utils/styles';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { getError } from '../utils/error';
import { useSnackbar } from 'notistack';
import { CircularProgress } from '@material-ui/core';
import {
  GoogleMap,
  LoadScript,
  Marker,
  StandaloneSearchBox,
} from '@react-google-maps/api';

const defaultLocation = { lat: 45.516, lng: -73.56 };
const libs = ['places'];

const Map = () => {
  const router = useRouter();
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { state, dispatch } = useContext(Store);
  const { userInfo } = state;
  const [googleApiKey, setGoogleApiKey] = useState('');

  useEffect(() => {
    const fetchGoogleApiKey = async () => {
      try {
        const { data } = await axios('/api/keys/google', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        setGoogleApiKey(data);
        getUserCurrentLocation();
      } catch (err) {
        enqueueSnackbar(getError(err), { variant: 'error' });
      }
    };
    fetchGoogleApiKey();
  }, []);

  const [center, setCenter] = useState(defaultLocation);
  const [location, setLocation] = useState(center);

  const getUserCurrentLocation = () => {
    if (!navigator.geolocation) {
      enqueueSnackbar('Geolocation is not supported by this browser', {
        variant: 'error',
      });
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  };

  const mapRef = useRef(null);
  const placeRef = useRef(null);
  const markerRef = useRef(null);

  const onLoad = (map) => {
    mapRef.current = map;
  };
  const onIdle = () => {
    setLocation({
      lat: mapRef.current.center.lat(),
      lng: mapRef.current.center.lng(),
    });
  };

  const onLoadPlaces = (place) => {
    placeRef.current = place;
  };
  const onPlacesChanged = () => {
    const place = placeRef.current.getPlaces()[0].geometry.location;
    setCenter({ lat: place.lat(), lng: place.lng() });
    setLocation({ lat: place.lat(), lng: place.lng() });
  };

  const onConfirm = () => {
    const places = placeRef.current.getPlaces();
    if (places && places.length === 1) {
      dispatch({
        type: 'SAVE_SHIPPING_ADDRESS_MAP_LOCATION',
        payload: {
          lat: location.lat,
          lng: location.lng,
          address: places[0].formatted_address,
          name: places[0].name,
          vicinity: places[0].vicinity,
          googleAddressId: places[0].id,
        },
      });
      enqueueSnackbar('Location selected successfully', { variant: 'success' });
      router.push('/shipping');
    }
  };

  const onMarkerLoad = (marker) => {
    markerRef.current = marker;
  };

  return googleApiKey ? (
    <div className={classes.fullContainer}>
      <LoadScript libraries={libs} googleMapsApiKey={googleApiKey}>
        <GoogleMap
          id="sample-map"
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={center}
          zoom={16}
          onLoad={onLoad}
          onIdle={onIdle}
        >
          <StandaloneSearchBox
            onLoad={onLoadPlaces}
            onPlacesChanged={onPlacesChanged}
          >
            <div className={classes.mapInputBox}>
              <input type="text" placeholder="Enter your address"></input>
              <button type="button" className="primary" onClick={onConfirm}>
                Confirm
              </button>
            </div>
          </StandaloneSearchBox>
          <Marker position={location} onLoad={onMarkerLoad}></Marker>
        </GoogleMap>
      </LoadScript>
    </div>
  ) : (
    <CircularProgress />
  );
};

//Dynamic is used when we do not want something rendered on Server-Side
//Instead we want it on Client-Side where SEO does not matter, Google Maps does not need to be Indexed, it is personalized for each user
export default dynamic(() => Promise.resolve(Map), { ssr: false });
