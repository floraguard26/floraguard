import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "FloraGuard Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose prose-gray max-w-none">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: January 1, 2025</p>

        {[
          {
            title: "1. Information We Collect",
            body: `We collect information you provide directly to us, including your phone number for
            OTP authentication, your name, and images you upload for disease detection. We also
            collect usage data such as scan history, timestamps, and browser/device information
            for service improvement.`,
          },
          {
            title: "2. How We Use Your Information",
            body: `We use your information to provide and improve the FloraGuard service, authenticate
            your identity, process your plant images, generate disease detections and AI recommendations,
            and communicate with you about your account. We do not sell your personal information
            to third parties.`,
          },
          {
            title: "3. Image Data",
            body: `Images you upload are stored securely in Supabase Storage with access controls.
            Images are only accessible by you (via signed URLs) and by our ML inference service
            during processing. We may retain images for up to 12 months for your scan history,
            unless you delete them.`,
          },
          {
            title: "4. Data Security",
            body: `We use industry-standard security measures including HTTPS encryption in transit,
            encryption at rest for stored data, and access controls. However, no system is
            completely secure, and we cannot guarantee absolute security.`,
          },
          {
            title: "5. Third-Party Services",
            body: `FloraGuard uses Supabase (database and storage), Twilio (OTP verification), and
            Google Gemini (AI recommendations). Each of these providers has their own privacy
            policies. We encourage you to review them.`,
          },
          {
            title: "6. Your Rights",
            body: `You may request access to, correction of, or deletion of your personal data by
            contacting us at privacy@floraguard.ai. You can delete your scan history from your
            account at any time.`,
          },
          {
            title: "7. Changes to This Policy",
            body: `We may update this Privacy Policy from time to time. We will notify registered users
            of material changes via email or in-app notification. Continued use of FloraGuard
            after changes constitutes acceptance of the updated policy.`,
          },
          {
            title: "8. Contact",
            body: `For privacy-related questions, contact us at privacy@floraguard.ai or
            FloraGuard, Inc., 123 Innovation Drive, San Francisco, CA 94105.`,
          },
        ].map(({ title, body }) => (
          <section key={title} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
            <p className="text-gray-600 leading-relaxed">{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
