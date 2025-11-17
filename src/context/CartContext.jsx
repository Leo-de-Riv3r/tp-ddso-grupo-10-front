// 1. Importa 'useEffect'
import React, { createContext, useState, useContext, useEffect } from 'react';
import {confirmAction,showSuccess} from '../utils/confirmAction.js';
import Swal from 'sweetalert2';

const CartContext = createContext();

export const useCart = () => {
 return useContext(CartContext);
};

export const CartProvider = ({ children }) => {

  // 2. Modifica el useState para leer de localStorage
 const [cartItems, setCartItems] = useState(() => {
    // Esta función se ejecuta solo una vez, al cargar el componente
      const storedCart = localStorage.getItem('cart');
      return storedCart ? JSON.parse(storedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]); 

 const cleanCart = async () =>{ 
  setCartItems([]); 
  };

 const addItemToCart = (producto, cantidad) => {
  if(!cantidad || cantidad === 0) return;

  const itemInCart = cartItems.find(
   (item) => item.productoId === producto._id
  );


  if (itemInCart) {
   if (Number(producto.stock) < Number(itemInCart.cantidad) + Number(cantidad)) return 0;
   setCartItems(
    cartItems.map((itemPedido) =>
     (itemPedido.productoId === producto._id)
      ? { ...itemPedido, cantidad: Number(itemPedido.cantidad) + Number(cantidad) }
      : itemPedido
    )
   );
  } else {
   if (Number(producto.stock) < Number(cantidad)) return 0;
   const newItemPedido = { productoId: producto._id, nombre: producto.titulo, cantidad, precioUnitario: producto.precio, moneda: producto.moneda, vendedor: producto.vendedor.id, foto: producto.fotos[0] };
   setCartItems([...cartItems, newItemPedido]);
  }
 };

 const totalCart = cartItems.reduce(
  (total, itemPedido) => Number(total) + Number(itemPedido.cantidad),
  0
 );

 const totalValueCart = Number.parseFloat(cartItems.reduce(
  (total, itemPedido) => Number(total) + Number(itemPedido.precioUnitario * itemPedido.cantidad),
  0
 )).toFixed(2)

 const removeItem = (productoId) => {
  setCartItems(cartItems.filter((item) => item.productoId !== productoId));
 };

 const groupItemsByVendedor = () => {
  const groupedItems = [];
//{[vendedorId: xxxx, items: [] ], ...}
  cartItems.forEach((item) => {
    const vendedorId = item.vendedor;
    const existingGroup = groupedItems.find((group) => group.vendedorId === vendedorId);
    if (existingGroup) {
      existingGroup.items.push(item);
      } else {
      groupedItems.push({ vendedorId, items: [item] });
    }
  });


  return groupedItems
 } 

 const value = {
  cartItems,
  addItemToCart,
  totalCart,
  totalValueCart,
  cleanCart,
  removeItem,
  groupItemsByVendedor
 };

 return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};