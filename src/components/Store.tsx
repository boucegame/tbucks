import React, { useEffect, useState } from 'react';
import { ref, onValue, push, set, get } from 'firebase/database';
import { db } from '../firebase';
import { User, StoreItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';

interface StoreProps {
  user: User;
}

const Store: React.FC<StoreProps> = ({ user }) => {
  const [items, setItems] = useState<StoreItem[]>([]);

  useEffect(() => {
    const itemsRef = ref(db, 'items');
    return onValue(itemsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setItems(Object.entries(data).map(([id, item]: [string, any]) => ({
          id,
          ...item
        })));
      }
    });
  }, []);

  const handlePurchase = async (item: StoreItem) => {
    if (user.tBucks < item.price) {
      toast.error('Not enough T-Bucks!');
      return;
    }

    try {
      const userRef = ref(db, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      const currentTBucks = userSnapshot.val().tBucks;

      if (currentTBucks < item.price) {
        toast.error('Not enough T-Bucks!');
        return;
      }

      const newOrderRef = push(ref(db, 'orders'));
      const order = {
        id: newOrderRef.key,
        userId: user.uid,
        username: user.username,
        itemId: item.id,
        itemName: item.name,
        price: item.price,
        status: 'placed',
        createdAt: Date.now()
      };

      await Promise.all([
        set(newOrderRef, order),
        set(userRef, {
          ...user,
          tBucks: currentTBucks - item.price
        })
      ]);

      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-bold">{item.price} T-Bucks</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePurchase(item)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={user.tBucks < item.price}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Purchase</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No items available in the store yet.</p>
        </div>
      )}
    </div>
  );
};

export default Store;