"use client";

import { Building } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="container py-12 md:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Building className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using LeaseLink's services, you agree to be bound
              by these Terms of Service. If you disagree with any part of the
              terms, you may not access the service.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">
              2. Description of Service
            </h2>
            <p>
              LeaseLink provides a platform for connecting property owners,
              tenants, and potential subletters. Our service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Property listings and search functionality</li>
              <li>User profiles and verification</li>
              <li>Messaging and communication tools</li>
              <li>Payment processing services</li>
              <li>Review and rating system</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate and
              complete information. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining the security of your account</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>
                Ensuring your account information is accurate and up-to-date
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Post false or misleading information</li>
              <li>Harass, abuse, or harm others</li>
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access</li>
              <li>Interfere with the proper functioning of the service</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">
              5. Content and Intellectual Property
            </h2>
            <p>
              The service and its original content, features, and functionality
              are owned by LeaseLink and are protected by international
              copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">6. Payment Terms</h2>
            <p>Payment terms include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All fees are non-refundable unless otherwise stated</li>
              <li>We may change our fees at any time</li>
              <li>You are responsible for all applicable taxes</li>
              <li>
                Payment processing is handled by secure third-party providers
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">
              7. Limitation of Liability
            </h2>
            <p>
              LeaseLink shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages resulting from your
              use or inability to use the service.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">
              8. Disclaimer of Warranties
            </h2>
            <p>
              The service is provided "as is" without any warranties, expressed
              or implied. We do not warrant that the service will be
              uninterrupted or error-free.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the service
              immediately, without prior notice, for any reason, including
              breach of these Terms.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">
              10. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these terms at any time. We will
              notify users of any material changes by posting the new Terms on
              this page.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the State of Wisconsin, without regard to its conflict
              of law provisions.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">
              12. Contact Information
            </h2>
            <p>For any questions about these Terms, please contact us at:</p>
            <ul className="list-none pl-6 space-y-2">
              <li>Email: legal@leaselink.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Address: 123 University Ave, Madison, WI 53715</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
