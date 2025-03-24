import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { User, Order } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, Eye, Check } from 'lucide-react';

interface OrdersProps {
  user: User;
}

const Orders: React.FC<OrdersProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    return onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userOrders = Object.entries(data)
          .map(([id, order]: [string, any]) => ({
            id,
            ...order
          }))
          .filter((order) => order.userId === user.uid)
          .sort((a, b) => b.createdAt - a.createdAt);
        setOrders(userOrders);
      }
    });
  }, [user.uid]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placed':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'seen':
        return <Eye className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed':
        return 'bg-yellow-100 text-yellow-800';
      case 'seen':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
        <AnimatePresence>
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Package className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-semibold">{order.itemName}</h3>
                </div>
                <div className={`px-4 py-2 rounded-full flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="capitalize">{order.status}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Order #{order.id.slice(0, 8)}</span>
                <span>{order.price} T-Bucks</span>
              </div>
              {order.fulfillmentText && order.status === 'shipped' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-gray-50 rounded-lg"
                >
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {order.fulfillmentText}
                  </pre>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No orders yet.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Orders;