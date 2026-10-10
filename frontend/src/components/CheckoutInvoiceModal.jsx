import React from 'react';
import { ThermalReceiptPrinter } from './ThermalReceiptPrinter';

export const CheckoutInvoiceModal = ({
  isOpen = true,
  invoice,
  order,
  orderDetails,
  onClose,
}) => {
  if (isOpen === false) return null;
  const activeOrder = order || orderDetails || invoice || {};

  return (
    <ThermalReceiptPrinter
      invoice={activeOrder}
      order={activeOrder}
      orderDetails={activeOrder}
      onClose={onClose}
    />
  );
};

export default CheckoutInvoiceModal;
