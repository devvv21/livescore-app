import type { Metadata } from 'next';
import Header from '@/components/Header';
import SportsNav from '@/components/SportsNav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'TodayLiveScores | Privacy Policy',
  description: 'Read the Today Live Scores Privacy Policy to learn how we protect your data and ensure your privacy while using our sports score services.',
  keywords: ['Privacy Policy'],
  authors: [{ name: 'TodayLiveScores' }],
  publisher: 'TodayLiveScores',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://todaylivescores.com/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#1d222d] text-white min-h-screen">
    <Header />
    <SportsNav />
        <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p><strong>Website:</strong> todaylivescores.com</p>
        <p>
            We are todaylivescores.com, operated by Today Live Scores (Pty) Ltd, a company registered under the laws of the Republic of South Africa, with our principal place of business at [Insert Updated South African Address Here] (“we”, “our”, or “us”).
            We operate a website and mobile application that bring you real-time sports results, news, and related content (collectively, the “platform”).
        </p>
        <p>
            By using our platform, your personal data may be processed. We process this personal data as the data controller, and this Privacy Policy explains how we collect, use, disclose, and protect your personal data. If you have any questions or would like to exercise your rights, you can contact us at: <a href="mailto:privacy@todaylivescores.com">privacy@todaylivescores.com</a>.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Summary</h2>
        <ul className="list-disc list-inside mb-4">
            <li>Ensuring the platform’s functionality and technical operation</li>
            <li>Registration and use of user accounts and services</li>
            <li>Compliance with South African legal obligations</li>
            <li>Targeted marketing</li>
            <li>Communication with users</li>
            <li>Researching user feedback</li>
            <li>Legal protection and enforcement</li>
            <li>Other purposes disclosed in the privacy settings</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Personal Data We Process</h2>
        <ul className="list-disc list-inside mb-4">
            <li>Information on age</li>
            <li>Marketing information</li>
            <li>Technical data (e.g., IP address, device type, browser info)</li>
            <li>Pseudonymized identifiers (e.g., cookies, tracking pixels)</li>
            <li>Communication data (e.g., email address, message content)</li>
            <li>User account usage data</li>
            <li>Registration and login data</li>
            <li>Survey results and user feedback</li>
            <li>Generated identifiers for technical monitoring</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Purposes of Processing</h2>
        <ol className="list-decimal list-inside mb-4">
            <li><strong>To Ensure Functionality & Technical Operation:</strong> We process technical data and system identifiers to ensure stable, secure, and optimized access to our platform.</li>
            <li><strong>Registration & Use of Services:</strong> We process data necessary for account access and personalization.</li>
            <li><strong>Compliance with Legal Obligations:</strong> We comply with South African laws such as tax and consumer protection.</li>
            <li><strong>Targeted Marketing:</strong> Personalized communication based on behavior, with opt-out options.</li>
            <li><strong>User Communication:</strong> Data is used for contact responses, retained for 1 year post-interaction.</li>
            <li><strong>Feedback & Surveys:</strong> Based on consent; consent may be withdrawn anytime.</li>
            <li><strong>Legal Rights & Claims:</strong> Data may be retained to enforce legal rights.</li>
            <li><strong>Other Uses:</strong> As disclosed via privacy settings and consent preferences.</li>
        </ol>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Sharing Personal Data</h2>
        <p>We may share data with:</p>
        <ul className="list-disc list-inside mb-4">
            <li>Hosting and technical service providers</li>
            <li>Marketing and analytics partners</li>
            <li>Affiliated entities of Today Live Scores (Pty) Ltd</li>
            <li>Social login providers (e.g., Google, Facebook, Apple)</li>
            <li>Regulatory and legal authorities (if required by law)</li>
            <li>Legal, tax, and accounting consultants</li>
            <li>Feedback and research partners</li>
        </ul>
        <p>
            Where data is transferred outside South Africa, we ensure adequate safeguards are implemented in line with POPIA and international best practices.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Your Rights Under POPIA</h2>
        <ul className="list-disc list-inside mb-4">
            <li><strong>Right of access:</strong> Request details of personal data we hold about you.</li>
            <li><strong>Right to correction:</strong> Ask us to update or correct inaccurate data.</li>
            <li><strong>Right to object:</strong> Object to certain types of processing.</li>
            <li><strong>Right to withdraw consent:</strong> Withdraw previously given consent.</li>
            <li><strong>Right to data deletion:</strong> Request deletion of data, subject to legal obligations.</li>
            <li><strong>Right to complain:</strong> Lodge a complaint with the South African Information Regulator.</li>
        </ul>
        </div>
    <Footer />
    </div>
  
  );
}
