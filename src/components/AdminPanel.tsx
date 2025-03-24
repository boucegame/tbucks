import React, { useState, useEffect } from 'react';
import { ref, onValue, push, set, update } from 'firebase/database';
import { db } from '../firebase';
import { User, Order, StoreItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Gift, Package, Plus, Send, Eye } from 'lucide-react';

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [tBucksAmount, setTBucksAmount] = useState('');
  const [newItem, setNewItem] = useState<Partial<StoreItem>>({
    name: '',
    description: '',
    price: 0,
    imageUrl: ''
  });
  const [activeTab, setActiveTab] = useState<'users' | 'store' | 'orders'>('users');
  const [fulfillmentTextState, setFulfillmentTextState] = useState<Record<string, string>>({});

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const ordersRef = ref(db, 'orders');

    const unsubUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUsers(Object.entries(data).map(([uid, user]: [string, any]) => ({
          uid,
          ...user
        })));
      }
    });

    const unsubOrders = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setOrders(
          Object.entries(data)
            .map(([id, order]: [string, any]) => ({
              id,
              ...order
            }))
            .sort((a, b) => b.createdAt - a.createdAt)
        );
      }
    });

    return () => {
      unsubUsers();
      unsubOrders();
    };
  }, []);

  const handleGiftTBucks = async () => {
    if (!selectedUser || !tBucksAmount) {
      toast.error('Please select a user and enter an amount');
      return;
    }

    const amount = parseInt(tBucksAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const user = users.find(u => u.uid === selectedUser);
    if (!user) return;

    try {
      await set(ref(db, `users/${selectedUser}`), {
        ...user,
        tBucks: (user.tBucks || 0) + amount
      });

      toast.success(`Gifted ${amount} T-Bucks to ${user.username}`);
      setSelectedUser('');
      setTBucksAmount('');
    } catch (error) {
      toast.error('Failed to gift T-Bucks');
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.description || !newItem.imageUrl || !newItem.price) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const itemRef = push(ref(db, 'items'));
      await set(itemRef, newItem);
      toast.success('Item added to store');
      setNewItem({
        name: '',
        description: '',
        price: 0,
        imageUrl: ''
      });
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const handleUpdateOrderStatus = async (order: Order, status: 'seen' | 'shipped', fulfillmentText?: string) => {
    try {
      await update(ref(db, `orders/${order.id}`), {
        status,
        ...(fulfillmentText && { fulfillmentText })
      });
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleFulfillmentTextChange = (orderId: string, text: string) => {
    setFulfillmentTextState(prevState => ({
      ...prevState,
      [orderId]: text
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'store' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Manage Store
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Manage Orders
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-2xl font-bold mb-6">Gift T-Bucks</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select User</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.uid} value={user.uid}>
                        {user.username} ({user.tBucks} T-Bucks)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    value={tBucksAmount}
                    onChange={(e) => setTBucksAmount(e.target.value)}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGiftTBucks}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Gift className="h-5 w-5" />
                  <span>Gift T-Bucks</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === 'store' && (
            <motion.div
              key="store"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-2xl font-bold mb-6">Add Store Item</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price (T-Bucks)</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input
                    type="url"
                    value={newItem.imageUrl}
                    onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddItem}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Item</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold mb-6">Manage Orders</h2>
              {orders.map((order) => (
                <div key={order.id} className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Package className="h-6 w-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">{order.itemName}</h3>
                        <p className="text-sm text-gray-600">
                          Ordered by {order.username} • {order.price} T-Bucks
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      order.status === 'placed' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'seen' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  {order.status !== 'shipped' && (
                    <div className="flex space-x-4">
                      {order.status === 'placed' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order, 'seen')}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-5 w-5" />
                          <span>Mark as Seen</span>
                        </button>
                      )}
                      {order.status === 'seen' && (
                        <div className="w-full">
                          <textarea
                            placeholder="Enter fulfillment details..."
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-2"
                            rows={3}
                            value={fulfillmentTextState[order.id] || ''}
                            onChange={(e) => handleFulfillmentTextChange(order.id, e.target.value)}
                          />
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              handleUpdateOrderStatus(order, 'shipped', fulfillmentTextState[order.id]);
                            }}
                            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Send className="h-5 w-5" />
                            <span>Ship Order</span>
                          </motion.button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-center text-gray-600">No orders to manage.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPanel;
