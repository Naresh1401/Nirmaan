'use client';

import Link from 'next/link';

export default function SupplierDetailPage() {
  const supplier = {
    name: 'Sri Ganesh Traders',
    city: 'Peddapalli, Telangana',
    rating: 4.5,
    orders: 1240,
    since: '2018',
    verified: true,
    phone: '+91 98765 43210',
    address: 'Shop No. 42, Main Road, Peddapalli 504195',
    gst: '36AABCS1429B1Z7',
    speciality: 'Cement & Aggregates',
    description: 'Leading supplier of construction materials in Peddapalli district. Authorized dealer for UltraTech, ACC, and Ambuja cements. Bulk orders welcome with competitive pricing.',
  };

  const products = [
    { name: 'UltraTech OPC 53 Grade', price: '₹380/bag', stock: 'In Stock', rating: 4.6 },
    { name: 'ACC Gold Cement', price: '₹375/bag', stock: 'Low Stock', rating: 4.3 },
    { name: 'Ambuja Plus Cement', price: '₹370/bag', stock: 'In Stock', rating: 4.4 },
    { name: 'River Sand (Fine)', price: '₹55/cft', stock: 'In Stock', rating: 4.2 },
    { name: 'Gravel 20mm', price: '₹48/cft', stock: 'In Stock', rating: 4.0 },
    { name: 'M-Sand', price: '₹42/cft', stock: 'In Stock', rating: 4.1 },
  ];

  const reviews = [
    { name: 'Ravi Kumar', rating: 5, date: '2 weeks ago', text: 'Excellent quality cement. Delivery was on time. Will order again!' },
    { name: 'Srinivas Reddy', rating: 4, date: '1 month ago', text: 'Good prices and reliable service. Sand quality was great.' },
    { name: 'Anil Builders', rating: 5, date: '1 month ago', text: 'Best supplier in Peddapalli for bulk orders. Very cooperative.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
                {supplier.verified && <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">✓ Verified</span>}
              </div>
              <p className="text-gray-500 mt-1">{supplier.city} · Since {supplier.since}</p>
              <p className="text-gray-600 mt-3 max-w-xl">{supplier.description}</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">⭐ {supplier.rating}</p>
                <p className="text-sm text-gray-500">{supplier.orders.toLocaleString()} orders</p>
              </div>
              <a href={`tel:${supplier.phone}`} className="bg-green-600 text-white text-center py-2 rounded-lg font-medium hover:bg-green-700 text-sm">
                📞 Call Supplier
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Products */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Products ({products.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <div key={p.name} className="bg-white rounded-xl border p-4 hover:shadow-md transition">
                <div className="h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-4xl">📦</div>
                <h3 className="font-medium text-gray-900">{p.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold text-orange-600">{p.price}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock === 'In Stock' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.stock}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-500">⭐ {p.rating}</span>
                  <Link href="/cart" className="text-sm bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700">
                    Add to Cart
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Reviews */}
          <h2 className="text-xl font-bold text-gray-900 pt-4">Customer Reviews</h2>
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <div key={i} className="bg-white rounded-xl border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-gray-900">{r.name}</span>
                    <span className="text-sm text-gray-400 ml-2">{r.date}</span>
                  </div>
                  <span className="text-sm">{'⭐'.repeat(r.rating)}</span>
                </div>
                <p className="text-gray-600 text-sm">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Business Info</h3>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-gray-500">Speciality</dt><dd className="font-medium">{supplier.speciality}</dd></div>
              <div><dt className="text-gray-500">Address</dt><dd className="font-medium">{supplier.address}</dd></div>
              <div><dt className="text-gray-500">GST</dt><dd className="font-medium font-mono text-xs">{supplier.gst}</dd></div>
              <div><dt className="text-gray-500">Phone</dt><dd className="font-medium">{supplier.phone}</dd></div>
            </dl>
          </div>

          <div className="bg-orange-50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-2">🚚 Delivery</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>Free delivery on orders above ₹5,000</li>
              <li>Same-day dispatch for in-stock items</li>
              <li>Serves: Peddapalli, Sultanabad, Manthani</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
