import React, { useState } from 'react';
import { X, Plus, Minus, Package } from 'lucide-react';
import { Product } from '../types';

interface QuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (
    quantity: number,
    discountType?: 'percentage' | 'amount',
    discountValue?: number,
    serialNumbers?: string[]
  ) => void;
}

const QuantityModal: React.FC<QuantityModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm
}) => {
  const [quantity, setQuantity] = useState(1);
  const [specialPriceEnabled, setSpecialPriceEnabled] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);

  const [serialNumbers, setSerialNumbers] = useState<string[]>([""]);

  React.useEffect(() => {
    setSerialNumbers((prev) => {
      const updated = [...prev];
      if (quantity > prev.length) {
        return [...updated, ...Array(quantity - prev.length).fill("")];
      } else if (quantity < prev.length) {
        return updated.slice(0, quantity);
      }
      return updated;
    });
  }, [quantity]);

  if (!isOpen || !product) return null;

  const handleSerialChange = (index: number, value: string) => {
    setSerialNumbers((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddSerialInput = () => {
    setSerialNumbers((prev) => [...prev, ""]);
  };

  const handleConfirm = () => {
    if (quantity > 0 && quantity <= product.stock) {
      onConfirm(
        quantity,
        specialPriceEnabled ? discountType : undefined,
        specialPriceEnabled ? discountValue : undefined,
        serialNumbers
      );
      setQuantity(1);
      setSerialNumbers(Array(quantity).fill(""));
      onClose();
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const basePrice = quantity * product.sellpricePerUnit;
  let totalPrice = basePrice;
  if (specialPriceEnabled && discountValue > 0) {
    if (discountType === 'percentage') {
      totalPrice = basePrice - basePrice * (discountValue / 100);
    } else {
      totalPrice = basePrice - discountValue;
    }
    if (totalPrice < 0) totalPrice = 0;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Select Quantity</h2>
                <p className="text-slate-400 text-sm">Choose amount to sell</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

  {/* Content */}
  <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-slate-800">
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h3 className="text-white font-semibold">{product.name}</h3>
                <p className="text-slate-400 text-sm">ID: {product.id}</p>
                <p className="text-emerald-400 font-medium">
                  Buy Price: ৳{product.buypricePerUnit}/{product.unit}
                </p>
                <p className="text-emerald-400 font-medium">
                  Sell Price: ৳{product.sellpricePerUnit}/{product.unit}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Quantity Selection */}
            <div>
              <label className="block text-slate-400 text-sm mb-3">
                Quantity ({product.unit})
              </label>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-5 h-5 text-white" />
                </button>
                <div className="bg-white/10 border border-white/20 rounded-lg px-6 py-3 min-w-[100px] text-center">
                  <span className="text-white text-xl font-bold">{quantity}</span>
                </div>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="text-center mt-2">
                <p className="text-slate-400 text-sm">
                  Available: {product.stock} {product.unit}
                </p>
              </div>
            </div>

            {/* Serial Number(s) */}
            <div>
              <label className="block text-slate-400 text-sm mb-2 font-semibold">
                Inter Product Serial Number(s):
              </label>
              <div className="space-y-2">
                {serialNumbers.map((serial, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={serial}
                    onChange={e => handleSerialChange(idx, e.target.value)}
                    placeholder={`Serial Number ${idx + 1}`}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 outline-none"
                  />
                ))}
              </div>
            </div>

            {/* Special Price Section */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="specialPrice"
                  checked={specialPriceEnabled}
                  onChange={e => setSpecialPriceEnabled(e.target.checked)}
                  className="mr-2 accent-yellow-500"
                />
                <label htmlFor="specialPrice" className="text-yellow-400 font-medium cursor-pointer">
                  Enable Special Price
                </label>
              </div>
              {specialPriceEnabled && (
                <div className="flex flex-col md:flex-row items-center gap-3 mt-2">
                  <input
                    type="number"
                    min="0"
                    value={discountValue}
                    onChange={e => setDiscountValue(Number(e.target.value))}
                    placeholder={discountType === 'percentage' ? 'Discount (%)' : 'Discount Amount'}
                    className="px-4 py-2 rounded-lg border border-yellow-400 bg-white/10 text-white w-32"
                  />
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as 'percentage' | 'amount')}
                    className="px-3 py-2 rounded-lg border border-yellow-400 bg-white/10 text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="amount">Amount (৳)</option>
                  </select>
                  <span className="text-slate-400 text-xs">
                    {discountType === 'percentage'
                      ? 'Deducts % from total'
                      : 'Deducts amount from total'}
                  </span>
                </div>
              )}
            </div>

            {/* Total Price */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex flex-col items-center justify-between">
                <span className="text-slate-400 text-sm mb-1">
                  {quantity} {product.unit} × ৳{product.sellpricePerUnit} ={' '}
                  <span className="font-bold text-white">৳{basePrice.toFixed(2)}</span>
                </span>
                {specialPriceEnabled && discountValue > 0 && (
                  <span className="text-yellow-400 text-sm mb-1">
                    - {discountType === 'percentage'
                      ? `${discountValue}%`
                      : `৳${discountValue}`}{' '}
                    Special Discount
                  </span>
                )}
                <span className="text-emerald-400 text-2xl font-bold mt-2">
                  Total Price:{' '}
                  <span className="text-emerald-400 text-2xl font-bold">
                    ৳{totalPrice.toFixed(2)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white/5 border-t border-white/10 p-6">
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-slate-900 font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02]"
            >
              Add to Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantityModal;