'use client';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-slate-400">Last updated: March 1, 2026</p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-gray prose-sm">
        <p className="text-gray-600 leading-relaxed">
          These terms apply when you use the Nirmaan website and services. By creating an account
          or placing an order, you agree to these terms. Plain language version below — we&apos;ve
          kept it straightforward.
        </p>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">1. What Nirmaan Is</h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          Nirmaan is an online marketplace that connects construction material buyers with
          suppliers. We don&apos;t manufacture or own any materials ourselves. We help you find
          suppliers, compare prices, place orders, and track deliveries. The actual sale is
          between you and the supplier.
        </p>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">2. Your Account</h2>
        <ul className="text-gray-600 space-y-2 list-disc pl-5 text-sm">
          <li>You need to be at least 18 years old to create an account.</li>
          <li>The phone number and details you provide should be accurate.</li>
          <li>You&apos;re responsible for keeping your password secure. If someone else uses your account, orders placed are still your responsibility.</li>
          <li>We can suspend or close accounts that violate these terms or are involved in fraudulent activity.</li>
        </ul>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">3. Orders & Pricing</h2>
        <ul className="text-gray-600 space-y-2 list-disc pl-5 text-sm">
          <li>Prices on the platform are set by suppliers and may change without notice. The price at the time you place the order is what applies.</li>
          <li>Once you confirm an order, it&apos;s a commitment to buy. You can cancel before dispatch, but not after materials have been loaded.</li>
          <li>We try to keep prices accurate, but mistakes can happen. If there&apos;s a significant pricing error, we or the supplier may cancel the order and notify you.</li>
          <li>Quantities are approximate for bulk materials like sand and gravel. Minor variations (within 5%) are normal in the industry.</li>
        </ul>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">4. Delivery</h2>
        <ul className="text-gray-600 space-y-2 list-disc pl-5 text-sm">
          <li>Delivery timelines are estimates, not guarantees. Delays can happen due to weather, vehicle breakdowns, supplier stock issues, or road conditions.</li>
          <li>You (or someone you designate) need to be present at the delivery location to receive and verify the material.</li>
          <li>Check the material at delivery. Report any issues — wrong material, short quantity, damage — immediately to us. Once you accept delivery, returns are difficult for bulk construction materials.</li>
          <li>The delivery address must be accessible by truck. If the truck can&apos;t reach your site, the driver will deliver as close as possible.</li>
        </ul>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">5. Payments</h2>
        <ul className="text-gray-600 space-y-2 list-disc pl-5 text-sm">
          <li>Payments are processed through third-party payment gateways. We don&apos;t store your card details.</li>
          <li>For cash on delivery orders, payment is due when the material arrives. The delivery partner may refuse to unload if payment isn&apos;t made.</li>
          <li>Business credit is subject to separate terms. If you&apos;re on a credit plan and miss payments, we may pause your account until the balance is cleared.</li>
          <li>All prices include GST unless stated otherwise.</li>
        </ul>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">6. Cancellations & Refunds</h2>
        <ul className="text-gray-600 space-y-2 list-disc pl-5 text-sm">
          <li>You can cancel an order before it&apos;s dispatched. Full refund if you&apos;ve already paid online.</li>
          <li>Once dispatched, cancellation depends on whether the material can be returned. For cement, steel, and similar — returns usually aren&apos;t possible.</li>
          <li>For genuinely defective or wrong materials, we&apos;ll work with the supplier to arrange a replacement or refund.</li>
          <li>Refunds for online payments are processed within 5-7 business days back to your original payment method.</li>
        </ul>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">7. For Suppliers</h2>
        <ul className="text-gray-600 space-y-2 list-disc pl-5 text-sm">
          <li>Suppliers must have valid GST registration and necessary business licenses.</li>
          <li>Prices and stock levels you list should be accurate. Regularly cancelling orders due to stock-outs affects your rating and visibility.</li>
          <li>Nirmaan charges a commission (2-5%) on completed orders. This is deducted before settlement.</li>
          <li>We reserve the right to remove listings or suspend supplier accounts for repeated complaints, quality issues, or Terms violations.</li>
        </ul>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">8. What We&apos;re Not Responsible For</h2>
        <ul className="text-gray-600 space-y-2 list-disc pl-5 text-sm">
          <li>The quality of materials — that&apos;s the supplier&apos;s responsibility. We verify suppliers when onboarding them, but we can&apos;t inspect every bag of cement.</li>
          <li>Delays caused by weather, strikes, natural disasters, or other things beyond anyone&apos;s control.</li>
          <li>How you use the materials. We&apos;re a marketplace, not structural engineers. Consult professionals for load-bearing decisions.</li>
          <li>Third-party payment gateway issues. If a payment fails or is delayed on their end, take it up with them or your bank.</li>
        </ul>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">9. Disputes</h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          If there&apos;s a dispute between you and a supplier (or delivery partner), we&apos;ll try to
          help mediate. But ultimately, we&apos;re a marketplace connecting two parties. For legal
          disputes, the jurisdiction is Peddapalli, Telangana, and Indian laws apply.
        </p>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">10. Changes</h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          We may update these terms from time to time. If we make major changes, we&apos;ll try to
          notify you. Continued use of the platform after changes means you accept the new terms.
        </p>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">Questions?</h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          If something here doesn&apos;t make sense, email us at{' '}
          <a href="mailto:hello@nirmaan.co" className="text-orange-600 underline">hello@nirmaan.co</a>.
          We&apos;d rather explain things clearly than hide behind fine print.
        </p>
      </article>
    </div>
  );
}
