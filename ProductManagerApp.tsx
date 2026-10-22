import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Tag,
  DollarSign,
  Boxes,
  Trash2,
  Edit2,
  CheckCircle2,
  Download,
  Upload,
  ShoppingCart,
  Receipt,
  X,
  Sparkles,
} from 'lucide-react';
import { ProductItem } from '../../types/phone';
import { soundEffects } from '../../utils/soundEffects';

interface ProductManagerAppProps {
  products: ProductItem[];
  onAddProduct: (prod: ProductItem) => void;
  onUpdateProduct: (prod: ProductItem) => void;
  onDeleteProduct: (id: string) => void;
  soundEnabled: boolean;
}

export const ProductManagerApp: React.FC<ProductManagerAppProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  soundEnabled,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('دیجیتال و موبایل');
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState<'تومان' | '$'>('تومان');
  const [stock, setStock] = useState<number>(10);
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');

  // POS / Order modal
  const [orderModalProduct, setOrderModalProduct] = useState<ProductItem | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalValue = products.reduce((acc, p) => acc + (p.currency === 'تومان' ? p.price * p.stock : p.price * 65000 * p.stock), 0);
  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);

  const handleOpenAddModal = () => {
    soundEffects.click(soundEnabled);
    setEditingProduct(null);
    setName('');
    setCategory('دیجیتال و موبایل');
    setPrice(1000000);
    setCurrency('تومان');
    setStock(10);
    setSku(`ALI-${Date.now().toString().slice(-4)}`);
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: ProductItem) => {
    soundEffects.click(soundEnabled);
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setCurrency(p.currency);
    setStock(p.stock);
    setSku(p.sku || '');
    setDescription(p.description);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.click(soundEnabled);

    if (editingProduct) {
      const updated: ProductItem = {
        ...editingProduct,
        name,
        category,
        price,
        currency,
        stock,
        sku,
        description,
        status: stock > 0 ? 'active' : 'out_of_stock',
      };
      onUpdateProduct(updated);
    } else {
      const newProd: ProductItem = {
        id: `prod_${Date.now()}`,
        name,
        category,
        price,
        currency,
        stock,
        sku,
        description,
        status: stock > 0 ? 'active' : 'out_of_stock',
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddProduct(newProd);
    }

    setIsModalOpen(false);
  };

  const handleOrderSubmit = () => {
    if (!orderModalProduct) return;
    soundEffects.notification(soundEnabled);
    // Decrease stock by 1
    onUpdateProduct({
      ...orderModalProduct,
      stock: Math.max(0, orderModalProduct.stock - 1),
      status: orderModalProduct.stock - 1 <= 0 ? 'out_of_stock' : 'active',
    });
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setOrderModalProduct(null);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-white select-none">
      {/* Top Header */}
      <div className="pt-14 px-5 pb-3 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">ALI Phone Inventory</span>
          <h1 className="text-xl font-bold tracking-tight text-white">مدیریت محصولات من</h1>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold flex items-center gap-1 shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن محصول</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-900 border-b border-neutral-800 text-xs">
        <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/50">
          <p className="text-[10px] text-neutral-400">ارزش کل انبار محصولات</p>
          <p className="text-sm font-bold text-amber-400 font-mono mt-0.5 truncate">
            {totalValue.toLocaleString('fa-IR')} تومان
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/50">
          <p className="text-[10px] text-neutral-400">تعداد تنوع / موجودی کل</p>
          <p className="text-sm font-bold text-white font-mono mt-0.5">
            {products.length} کالا ({totalStockCount} عدد)
          </p>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="p-3 space-y-2 border-b border-neutral-800">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی نام کالا یا شناسه کالا (SKU)..."
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'همه محصولات' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 text-xs">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>محصولی با این مشخصات یافت نشد.</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-3 text-amber-400 underline font-medium"
            >
              افزودن اولین محصول
            </button>
          </div>
        ) : (
          filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col justify-between gap-2.5 shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-snug">{prod.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-1">
                      <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">{prod.category}</span>
                      {prod.sku && <span className="font-mono text-neutral-500">#{prod.sku}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <p className="text-xs font-bold text-amber-400 font-mono">
                    {prod.price.toLocaleString('fa-IR')} {prod.currency}
                  </p>
                  <p className={`text-[10px] mt-0.5 font-medium ${prod.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    موجودی: {prod.stock} عدد
                  </p>
                </div>
              </div>

              {prod.description && (
                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>
              )}

              {/* Actions strip */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
                <button
                  onClick={() => setOrderModalProduct(prod)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 flex items-center gap-1 text-[11px] font-semibold"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>ثبت فاکتور / فروش</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(prod)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                    title="ویرایش"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      soundEffects.click(soundEnabled);
                      onDeleteProduct(prod.id);
                    }}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 select-none">
          <div
            className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white">
                {editingProduct ? 'ویرایش کالا یا ابزار' : 'افزودن محصول جدید به علی‌فون'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">نام محصول یا ابزار</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: دستگاه لیزر، ساعت هوشمند، کاتالوگ ابزار..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">دسته‌بندی</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="مثال: دیجیتال، صنعتی، پوشاک"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">کد محصول (SKU)</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="کد کالا"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">قیمت واحد</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">واحد پول</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="تومان">تومان</option>
                    <option value="$">دلار ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">تعداد موجودی انبار</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">توضیحات و مشخصات کالا</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ویژگی‌ها، گارانتی، ابعاد و نکات کالا..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <Package className="w-4 h-4" />
                <span>ذخیره در بانک اطلاعاتی علی‌فون</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POS / Quick Order Modal */}
      {orderModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 select-none">
          <div
            className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-3xl p-5 space-y-3.5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>صدور رسید و ثبت سفارش</span>
              </h3>
              <button
                onClick={() => setOrderModalProduct(null)}
                className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {orderSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <p className="text-sm font-bold text-white">فروش با موفقیت ثبت شد!</p>
                <p className="text-xs text-neutral-400">یک عدد از موجودی انبار کسر گردید.</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-neutral-800 border border-neutral-700/60 space-y-1">
                  <p className="text-xs font-semibold text-white">{orderModalProduct.name}</p>
                  <p className="text-amber-400 font-mono font-bold">
                    {orderModalProduct.price.toLocaleString('fa-IR')} {orderModalProduct.currency}
                  </p>
                  <p className="text-[11px] text-neutral-400">موجودی فعلی: {orderModalProduct.stock} عدد</p>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px]">
                  <span>رسید رسمی به نام مشتری صادر خواهد شد و در حافظه علی‌فون ثبت می‌گردد.</span>
                </div>

                <button
                  onClick={handleOrderSubmit}
                  disabled={orderModalProduct.stock <= 0}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-black font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Receipt className="w-4 h-4" />
                  <span>تأیید فاکتور و کسر موجودی</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
