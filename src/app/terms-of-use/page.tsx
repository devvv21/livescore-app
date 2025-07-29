import type { Metadata } from 'next';
import Header from '@/components/Header';
import SportsNav from '@/components/SportsNav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Today Live Scores | Terms of Use',
  description: 'Discover the Today Live Scores Terms of Use. Review our policies to ensure your experience with live scores is secure and informed.',
  keywords: ['terms of use'],
  authors: [{ name: 'TodayLiveScores' }],
  publisher: 'TodayLiveScores',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://todaylivescores.com/term-of-use',
  },
};

const TermsOfUsePage = () => {
  return (
    <div className="bg-[#1d222d] text-white min-h-screen">
      <Header />
      <SportsNav />
      <div className="container mx-auto px-4 py-8">
      
      <h1 className="text-3xl font-bold mb-4">TERMS OF USE</h1>
      <p className="mb-4">
        <strong>Today Live Scores</strong> todaylivescores.com
        <br />
        <strong>Address:</strong> 19 Oakworth Rd, South End, Gqeberha, 6001, Republic of South Africa
      </p>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mt-6 mb-3">1. INTRODUCTORY PROVISIONS</h2>
        <div className="space-y-4">
          <p>
            <strong>1.1. Identification of the parties.</strong> These terms of use (“Terms of Use”) govern the mutual rights and obligations between <strong>Today Live Scores</strong>, with its registered office at 19 Oakworth Rd, South End, Gqeberha, 6001, Republic of South Africa (“we”, “us” or “our”) and third party individuals (“User”, “you” or “your”) when using our website https://todaylivescores.com/ (the “Site”).
          </p>
          <p>
            <strong>1.2. Applicability of Terms of Use.</strong> If you are a non-registered User of the Site, only the provisions on the nature and use of the Site, in particular clauses 1, 2 and 10 of these Terms of Use, shall apply to you. For registered Users, these Terms of Use shall apply in full.
          </p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mt-6 mb-3">2. USER REGISTRATION</h2>
        <p>
          To access certain features of the Site, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. We reserve the right to suspend or terminate your account if any information provided during the registration process or thereafter proves to be inaccurate, not current, or incomplete. [23]
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mt-6 mb-3">3. INTELLECTUAL PROPERTY RIGHTS</h2>
        <p>
          The Site and its original content, features, and functionality are owned by Today Live Scores and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. [35] You are granted a limited license only for purposes of viewing the material contained on this Site. Facts such as sports data and statistics are not typically protected by copyright. [31] However, the presentation and compilation of this data are our intellectual property.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mt-6 mb-3">4. USER CONTENT</h2>
        <p>
          If you post, upload, or make available any content on the Site (“User Content”), you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display such User Content in connection with the Site. [19] You are responsible for the User Content that you post to the Site, including its legality, reliability, and appropriateness. [39]
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mt-6 mb-3">5. LIMITATION OF LIABILITY</h2>
        <p>
          The information on our Site is for general information purposes only. [8] While we strive to provide accurate information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose. [2] Any reliance you place on such information is therefore strictly at your own risk. In no event will we be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this Site. [4, 12, 13]
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mt-6 mb-3">6. DISPUTE RESOLUTION</h2>
        <p>
          Any dispute arising out of or in connection with these Terms of Use, including any question regarding its existence, validity, or termination, shall be referred to and finally resolved by arbitration in the Republic of South Africa. [22, 34] The language of the arbitration shall be English.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mt-6 mb-3">7. DATA PROCESSING</h2>
        <p>
          We will process your personal data in accordance with our Privacy Policy. Our Privacy Policy explains what personal data we collect and how we use it. [24, 43] By using our Site, you consent to such processing and you warrant that all data provided by you is accurate. [26]
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mt-6 mb-3">8. TERMINATION</h2>
        <p>
          We may terminate or suspend your access to our Site immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms of Use. [1, 3, 9] Upon termination, your right to use the Site will immediately cease. [7, 10]
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mt-6 mb-3">9. AUTHORIZATION TO DO BUSINESS</h2>
        <p>
          We are authorized to do business under the applicable trade and business licensing laws of the Republic of South Africa. Oversight and regulatory compliance is subject to the relevant South African authorities. Supervision over personal data protection is exercised by the supervisory authority in your place of habitual residence, place of work, or the place of the alleged infringement.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mt-6 mb-3">10. GOVERNING LAW</h2>
        <div className="space-y-4">
          <p>
            The relationship created by the service contract shall be governed by the laws of the Republic of South Africa.
          </p>
          <p>
            The choice of law under the preceding sentence does not deprive you of the protection afforded by the provisions of the legal order which cannot be derogated from by contract, and which would otherwise apply in the absence of a choice of law under applicable conflict-of-law rules.
          </p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mt-6 mb-3">11. JURISDICTION OF COURTS</h2>
        <p>
          We agree to the jurisdiction and venue of the courts of the Republic of South Africa. [32]
        </p>
      </section>
    </div>
     <Footer />
    </div>
    
  );
};

export default TermsOfUsePage;