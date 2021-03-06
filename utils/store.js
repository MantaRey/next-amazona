import Cookies from 'js-cookie';
import { createContext, useReducer } from 'react';

export const Store = createContext();
const initialState = {
  darkMode: Cookies.get('darkMode') === 'ON' ? true : false,
  cart: {
    cartItems: Cookies.get('cartItems')
      ? JSON.parse(Cookies.get('cartItems'))
      : [],
    shippingAddress: Cookies.get('shippingAddress')
      ? JSON.parse(Cookies.get('shippingAddress'))
      : {},
    paymentMethod: Cookies.get('paymentMethod')
      ? JSON.parse(Cookies.get('paymentMethod'))
      : '',
  },
  userInfo: Cookies.get('userInfo')
    ? JSON.parse(Cookies.get('userInfo'))
    : null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'DARK_MODE_ON':
      return { ...state, darkMode: true };
    case 'DARK_MODE_OFF':
      return { ...state, darkMode: false };
    case 'CART_ADD_ITEM': {
      const newItem = action.payload;
      const existItem = state.cart.cartItems.find(
        (item) => item._id === newItem._id
      );
      const cartItems = existItem
        ? state.cart.cartItems.map((item) =>
            item.name === existItem.name ? newItem : item
          )
        : [...state.cart.cartItems, newItem];
      Cookies.set('cartItems', JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case 'CART_REMOVE_ITEM': {
      const cartItems = state.cart.cartItems.filter(
        (item) => item._id !== action.payload._id
      );
      Cookies.set('cartItems', JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case 'CART_CLEAR': {
      Cookies.remove('cartItems');
      return { ...state, cart: { ...state.cart, cartItems: [] } };
    }
    case 'SAVE_SHIPPING_ADDRESS': {
      Cookies.set('shippingAddress', JSON.stringify(action.payload));
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: { ...state.cart.shippingAddress, ...action.payload },
        },
      };
    }
    case 'SAVE_SHIPPING_ADDRESS_MAP_LOCATION': {
      Cookies.set('shippingAddress', JSON.stringify(action.payload));
      const locationArray = action.payload.address.split(',');
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: {
            ...state.cart.shippingAddress,
            address: locationArray[0],
            city: locationArray[1],
            state: locationArray[2].split(' ')[1],
            postalCode: locationArray[2].split(' ')[2],
            country: locationArray[3],
            location: action.payload,
          },
        },
      };
    }
    case 'SAVE_PAYMENT_METHOD': {
      Cookies.set('paymentMethod', JSON.stringify(action.payload));
      return {
        ...state,
        cart: { ...state.cart, paymentMethod: action.payload },
      };
    }
    case 'USER_LOGIN': {
      Cookies.set('userInfo', JSON.stringify(action.payload));
      return { ...state, userInfo: action.payload };
    }

    case 'USER_LOGOUT': {
      Cookies.remove('userInfo');
      Cookies.remove('cartItems');
      Cookies.remove('shippingAddress');
      Cookies.remove('paymentMethod');
      Cookies.set('darkMode', 'OFF');
      return {
        ...state,
        userInfo: null,
        darkMode: false,
        cart: {
          cartItems: [],
          shippingAddress: {},
          paymentMethod: '',
        },
      };
    }
    default:
      return state;
  }
};

export const StoreProvider = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
};
