import React, { useState } from 'react';
import { Bot, Send, Sparkles, X, ShoppingBag, ArrowRight, Zap, Check } from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import { useNavigationContext } from '../../context/NavigationContext';
import { getProductImage } from '../../utils/productAssets';

export default function AIShoppingAssistantModal({ isOpen, onClose }) {
  const { addToCart } = useCartContext();
  const { navigateTo } = useNavigationContext();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Namaste! 👋 I am your BuyZo AI Shopping Assistant. Ask me anything like:\n• "Best wireless headphones under ₹2000"\n• "Traditional Rakhi gifts for sister"\n• "Top rated kitchen appliances"',
      products: []
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const mockCatalog = [
    { id: 1, title: 'boAt Rockerz 450 Bluetooth Headphones', price: 1499, originalPrice: 3990, rating: 4.8, category: 'Electronics', image: getProductImage('boAt Rockerz', '') },
    { id: 2, title: 'Sony WH-CH520 Wireless Headphones', price: 4490, originalPrice: 5990, rating: 4.9, category: 'Electronics', image: getProductImage('Sony Headphones', '') },
    { id: 3, title: 'Designer Rakhi Gift Set for Brother', price: 499, originalPrice: 999, rating: 4.7, category: 'Rakhi', image: getProductImage('Rakhi Collection', '') },
    { id: 4, title: 'Hawkins 3L Stainless Steel Pressure Cooker', price: 1899, originalPrice: 2490, rating: 4.8, category: 'Home & Kitchen', image: getProductImage('Pressure Cooker', '') },
    { id: 5, title: 'Noise ColorFit Pulse 2 Smartwatch', price: 1299, originalPrice: 4999, rating: 4.6, category: 'Electronics', image: getProductImage('Noise Smartwatch', '') }
  ];

  const handleSend = (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query, products: [] };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      const q = query.toLowerCase();
      let matched = [];

      if (q.includes('headphone') || q.includes('earphone') || q.includes('sound') || q.includes('2000')) {
        matched = mockCatalog.filter((p) => p.price <= 2000 && p.category === 'Electronics');
      } else if (q.includes('rakhi') || q.includes('sister') || q.includes('brother') || q.includes('gift')) {
        matched = mockCatalog.filter((p) => p.category === 'Rakhi');
      } else if (q.includes('kitchen') || q.includes('cooker') || q.includes('appliance')) {
        matched = mockCatalog.filter((p) => p.category === 'Home & Kitchen');
      } else {
        matched = mockCatalog.slice(0, 2);
      }

      const aiMsg = {
        sender: 'ai',
        text: `Here are the top matches I found based on your request:`,
        products: matched
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full h-[580px] shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#063328] via-[#094839] to-emerald-950 text-white p-4 px-6 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-black text-white">BuyZo AI Shopping Assistant</h3>
                <span className="bg-amber-400 text-amber-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                  GPT-4o
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 font-medium">Real-time catalog recommendation engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar bg-gray-50/60">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs whitespace-pre-line shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-brand-800 text-white font-medium rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>

              {/* Recommended Products Carousel */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {msg.products.map((prod) => (
                    <div key={prod.id} className="bg-white border border-gray-200 rounded-2xl p-3 shadow-2xs flex flex-col justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center shrink-0">
                          <img src={prod.image} alt={prod.title} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{prod.title}</h4>
                          <span className="text-[10px] text-amber-600 font-bold">★ {prod.rating}</span>
                          <div className="flex items-baseline space-x-1.5 mt-0.5">
                            <span className="font-black text-xs text-gray-900">₹{prod.price.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-gray-400 line-through">₹{prod.originalPrice.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          addToCart(prod);
                          onClose();
                        }}
                        className="mt-2.5 w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 bg-white border border-gray-200 p-3 rounded-2xl w-fit">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
              <span>BuyZo AI is finding best deals...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompt Chips */}
        <div className="p-2.5 bg-white border-t border-gray-100 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {[
            'Headphones under ₹2000',
            'Rakhi gifts for sister',
            'Smartwatches under ₹1500',
            'Pressure Cooker deals'
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-bold text-brand-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask AI for product recommendations..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-brand-700 focus:bg-white transition-colors"
          />
          <button
            type="submit"
            className="p-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl transition-all cursor-pointer shrink-0 shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
