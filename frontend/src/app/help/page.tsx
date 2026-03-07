'use client';

import Link from 'next/link';
import { ShoppingCart, CreditCard, Truck, User, HelpCircle, ChevronDown, ChevronUp, Mail, Phone } from 'lucide-react';
import { useState } from 'react';

interface FAQ {
  q: string;
  a: string;
}

const sections: { title: string; icon: React.ReactNode; faqs: FAQ[] }[] = [
  {
    title: 'Ordering',
    icon: <ShoppingCart className="w-5 h-5 text-orange-500" />,
    faqs: [
      {
        q: 'How do I place an order?',
        a: 'Search for the material you need on the Products page, add it to your cart, and checkout. You can choose a delivery slot and payment method during checkout. You\'ll need to be logged in to place an order.',
      },
      {
        q: 'Can I order from multiple suppliers?',
        a: 'Yes. Your cart can have items from different suppliers. Each supplier will dispatch their materials separately, so delivery times might differ.',
      },
      {
        q: 'What\'s the minimum order amount?',
        a: 'There\'s no minimum order amount, but delivery is free only on orders above ₹10,000. For smaller orders, a delivery charge applies based on distance.',
      },
      {
        q: 'Can I cancel an order?',
        a: 'You can cancel an order as long as it hasn\'t been dispatched yet. Go to your Orders page and tap "Cancel" on the order. If the material has already been loaded onto a truck, cancellation may not be possible.',
      },
      {
        q: 'The price I see is different from what the supplier quoted me directly. Why?',
        a: 'Suppliers set their own prices on Nirmaan. Sometimes these differ from walk-in rates because of delivery costs, platform commission, or simply different pricing for online orders. If the difference seems wrong, let us know.',
      },
    ],
  },
  {
    title: 'Delivery',
    icon: <Truck className="w-5 h-5 text-blue-500" />,
    faqs: [
      {
        q: 'How long does delivery take?',
a: 'Most orders are delivered same-day or next-day, depending on when you place the order and what the supplier has in stock. Orders placed before 2 PM have a better chance of same-day delivery.',
      },
      {
        q: 'Can I track my delivery?',
        a: 'Yes. Once the material is dispatched, you\'ll see GPS tracking on your order page. You\'ll get updates when the truck is on the way and when it\'s nearby.',
      },
      {
        q: 'What if the material arrives damaged or wrong?',
        a: 'Check the material when it arrives. If something\'s off — wrong quantity, damaged bags, wrong grade — don\'t accept it. Contact us immediately through the order page or call us. We\'ll sort it out with the supplier.',
      },
      {
        q: 'Do you deliver on Sundays?',
        a: 'Currently no. Deliveries are Mon-Sat. Some suppliers may also not deliver on certain holidays.',
      },
    ],
  },
  {
    title: 'Payments',
    icon: <CreditCard className="w-5 h-5 text-green-500" />,
    faqs: [
      {
        q: 'What payment methods do you accept?',
        a: 'Cash on delivery, UPI (Google Pay, PhonePe, etc.), credit/debit cards, net banking, and business credit (for approved businesses).',
      },
      {
        q: 'How does business credit work?',
        a: 'Eligible businesses can apply for a credit line. After approval (usually 24-48 hours), you can order materials and pay later — within 30, 60, or 90 days. The first 30 days are interest-free. You need GST registration and some order history to qualify.',
      },
      {
        q: 'When is COD payment collected?',
        a: 'Cash on delivery is collected at the time of delivery. The delivery partner will collect the payment and give you a receipt.',
      },
    ],
  },
  {
    title: 'Account',
    icon: <User className="w-5 h-5 text-purple-500" />,
    faqs: [
      {
        q: 'How do I create an account?',
        a: 'Go to the Sign Up page. You\'ll need a phone number and some basic details. Registration is free.',
      },
      {
        q: 'I forgot my password. What do I do?',
        a: 'Currently, please contact us directly at hello@nirmaan.co or call us. We\'ll help you reset it. We\'re working on adding a self-service password reset.',
      },
      {
        q: 'Can I have both a buyer and supplier account?',
        a: 'Not with the same phone number. If you\'re both a buyer and supplier, you\'d need separate accounts for now.',
      },
    ],
  },
];

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full text-left py-4 flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-gray-900">{faq.q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />}
      </button>
      {open && (
        <p className="text-sm text-gray-600 pb-4 leading-relaxed">{faq.a}</p>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Help Center</h1>
          <p className="text-slate-300 text-lg">
            Common questions and answers. If you can&apos;t find what you need, reach out to us directly.
          </p>
        </div>
      </section>

      {/* FAQ sections */}
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        {sections.map((section, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 flex items-center gap-3 border-b border-gray-200">
              {section.icon}
              <h2 className="font-bold text-gray-900">{section.title}</h2>
            </div>
            <div className="px-6">
              {section.faqs.map((faq, j) => (
                <FAQItem key={j} faq={faq} />
              ))}
            </div>
          </div>
        ))}

        {/* Still need help */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 text-center">
          <HelpCircle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-2">Still have questions?</h3>
          <p className="text-gray-600 text-sm mb-4">We&apos;re available Mon-Sat, 9 AM to 7 PM.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a href="tel:+918555501401" className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-orange-600 transition-colors">
              <Phone className="w-4 h-4" /> Call: +91 99898 60375
            </a>
            <a href="mailto:hello@nirmaan.co" className="inline-flex items-center justify-center gap-2 border border-orange-300 text-orange-700 font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-orange-100 transition-colors">
              <Mail className="w-4 h-4" /> hello@nirmaan.co
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
