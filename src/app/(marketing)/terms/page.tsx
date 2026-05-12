import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "FloraGuard Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: January 1, 2025</p>

        {[
          {
            title: "1. Acceptance of Terms",
            body: `By accessing or using FloraGuard ("Service"), you agree to be bound by these Terms.
            If you do not agree, do not use the Service.`,
          },
          {
            title: "2. Description of Service",
            body: `FloraGuard provides AI-powered plant disease detection. The Service uses machine
            learning models to analyze images and generate disease detections and treatment
            recommendations. These are informational tools only.`,
          },
          {
            title: "3. Disclaimer of Warranties — AI Suggestions",
            body: `FLORAGUARD'S AI DETECTIONS AND RECOMMENDATIONS ARE PROVIDED "AS IS" WITHOUT
            WARRANTY OF ANY KIND. THEY ARE NOT A SUBSTITUTE FOR PROFESSIONAL AGRONOMIC,
            BOTANICAL, OR PLANT PATHOLOGY ADVICE. FloraGuard does not guarantee the accuracy,
            completeness, or fitness for purpose of any detection or recommendation. Always
            consult a qualified expert before applying treatments.`,
          },
          {
            title: "4. User Responsibilities",
            body: `You are responsible for ensuring you have the right to upload any images you submit.
            You must not upload illegal content, content that infringes intellectual property
            rights, or content that could harm other users. You are responsible for any actions
            taken based on AI recommendations.`,
          },
          {
            title: "5. Account Security",
            body: `You are responsible for maintaining the security of your account. Notify us
            immediately at security@floraguard.ai if you believe your account has been compromised.`,
          },
          {
            title: "6. Limitation of Liability",
            body: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, FLORAGUARD SHALL NOT BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
            PROFITS OR REVENUES, ARISING FROM YOUR USE OF THE SERVICE.`,
          },
          {
            title: "7. Termination",
            body: `We may suspend or terminate your account for violation of these Terms. You may
            close your account at any time by contacting support@floraguard.ai.`,
          },
          {
            title: "8. Governing Law",
            body: `These Terms shall be governed by the laws of the State of California, USA, without
            regard to its conflict of law provisions.`,
          },
          {
            title: "9. Changes to Terms",
            body: `We may modify these Terms at any time. Material changes will be communicated via
            email or in-app notice at least 14 days before taking effect.`,
          },
          {
            title: "10. Contact",
            body: `For questions about these Terms, contact legal@floraguard.ai.`,
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
