'use client';

import { useState } from 'react';
import ProductList from '@/components/ProductList';
import CartView from '@/components/CartView';
import AddProductForm from '@/components/AddProductForm';
import ProductAdminTable from '@/components/ProductAdminTable';
import OrderHistory from '@/components/OrderHistory';

export default function Home() {
  const [refetchKey, setRefetchKey] = useState(0);

  const handleDataChange = () => {
    setRefetchKey(prevKey => prevKey + 1);
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 ">
        
        <div className="lg:col-span-2 ">
          <ProductList refetchKey={refetchKey} />
        </div>

        <div className="lg:col-span-1">
          <h2 className="text-3xl font-bold mb-6">Koszyk<span className="text-accent">.</span></h2>
          <div className="p-6 border border-gray-700 rounded-lg shadow-md bg-gray-800">
            <CartView onCheckoutSuccess={handleDataChange} />
          </div>
        </div>
      </div>

      <hr className="border-gray-700" />

      <div className="space-y-6">
        <AddProductForm onProductAdded={handleDataChange} />
        <ProductAdminTable refetchKey={refetchKey} onProductDeleted={handleDataChange} />
      </div>

      <hr className="border-gray-700" />

      <div className="space-y-6">
        <OrderHistory refetchKey={refetchKey} />
      </div>

    </div>
  );
}