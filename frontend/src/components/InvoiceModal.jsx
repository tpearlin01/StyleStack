import React from 'react';
import { ThermalReceiptPrinter } from './ThermalReceiptPrinter';

export const InvoiceModal = ({ invoice, onClose }) => {
  return <ThermalReceiptPrinter invoice={invoice} onClose={onClose} />;
};

export default InvoiceModal;
