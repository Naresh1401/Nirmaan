'use client';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-slate-400">Last updated: March 1, 2026</p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-gray prose-sm">
        <p className="text-gray-600 leading-relaxed">
          This policy explains what information we collect when you use Nirmaan, how we use it,
          and what choices you have. We&apos;ve tried to keep it readable — no walls of legal jargon.
        </p>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">What We Collect</h2>
        <p className="text-gray-600 leading-relaxed mb-3">When you create an account and use Nirmaan, we collect:</p>
        <ul className="text-gray-600 space-y-2 list-disc pl-5 text-sm">
          <li><strong>Account info</strong> — your name, phone number, email (if provided), city, and the type of account (buyer, supplier, delivery partner).</li>
          <li><strong>Order data</strong> — what you order, quantities, prices, delivery addresses, payment methods used.</li>
          <li><strong>Location</strong> — your city selection on the platform. For delivery partners, GPS location during active deliveries.</li>
          <li><strong>Device info</strong> — basic browser/device data that helps us keep the site working across different phones and computers.</li>
          <li><strong>Usage</strong> — pages you visit, searches you make, and how you interact with the site. This helps us improve things.</li>
        </ul>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">How We Use It</h2>
        <ul className="text-gray-600 space-y-2 list-disc pl-5 text-sm">
          <li><strong>To run the platform</strong> — processing orders, connecting you with suppliers, managing deliveries, handling payments.</li>
          <li><strong>To communicate with you</strong> — order confirmations, delivery updates, and important account notifications. We don&apos;t send marketing spam.</li>
          <li><strong>To improve Nirmaan</strong> — understanding what features people use, what they search for, and where things break.</li>
          <li><strong>For business credit</strong> — if you apply for credit, we use your order history and business details to assess eligibility.</li>
        </ul>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">Who We Share It With</h2>
        <ul className="text-gray-600 space-y-2 list-disc pl-5 text-sm">
          <li><strong>Suppliers</strong> — when you place an order, the supplier gets your name, delivery address, and order details so they can fulfill it.</li>
          <li><strong>Delivery partners</strong> — they get the pickup and delivery addresses and your phone number for coordination.</li>
          <li><strong>Payment providers</strong> — payment details are processed by third-party payment gateways. We don&apos;t store your full card numbers.</li>
          <li><strong>We don&apos;t sell your data</strong> to anyone. No ad networks, no data brokers, nothing like that.</li>
        </ul>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">Data Storage & Security</h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          Your data is stored on servers in India. We use standard security practices — encrypted
          connections (HTTPS), hashed passwords, and access controls. We&apos;re a small team, so we
          won&apos;t claim to be Fort Knox, but we take reasonable care to keep your information safe.
        </p>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">Your Choices</h2>
        <ul className="text-gray-600 space-y-2 list-disc pl-5 text-sm">
          <li>You can <strong>update your profile</strong> information anytime from your account settings.</li>
          <li>You can <strong>delete your account</strong> by emailing us at hello@nirmaan.co. We&apos;ll remove your personal data, though we may retain order records for accounting and legal purposes.</li>
          <li>You can <strong>opt out of non-essential emails</strong> by contacting us.</li>
        </ul>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">Cookies</h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          We use cookies to keep you logged in and remember your preferences (like your selected city).
          We don&apos;t use third-party tracking cookies for advertising.
        </p>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">Changes to This Policy</h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          If we make significant changes, we&apos;ll update the date at the top and try to notify
          active users. For minor wording changes, we&apos;ll just update the page.
        </p>

        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">Questions?</h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          Email us at <a href="mailto:hello@nirmaan.co" className="text-orange-600 underline">hello@nirmaan.co</a> if
          you have questions about how we handle your data.
        </p>
      </article>
    </div>
  );
}
