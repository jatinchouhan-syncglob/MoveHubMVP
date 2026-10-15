import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleEmailPress = () => {
    Linking.openURL('mailto:grievance@livingscopehealth.com').catch(err =>
      console.warn('Failed to open email client:', err),
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F17" />

      {/* Screen Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= HERO / ENTITY INFO ================= */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Official Legal Document</Text>
          </View>
          <Text style={styles.heroTitle}>Privacy Policy</Text>
          <Text style={styles.heroSubtitle}>
            This Privacy Policy ("Policy") describes the policies and procedures on the collection, use, disclosure and protection of your information when you use the App known as 'Uncurl: health' (available on iOS, Android platforms and WebApp) made available by Living Scope Health Pvt. Ltd. ("Living Scope Health", "Company", "we", "us" and "our").
          </Text>

          <View style={styles.registeredOfficeBox}>
            <Text style={styles.registeredOfficeLabel}>Registered Office</Text>
            <Text style={styles.registeredOfficeText}>
              HD-090, WeWork Chromium, Jogeshwari-Vikhroli Link Road (JVLR), Near L&T Junction, Milind Nagar, Powai, Mumbai, MH 400076, India.
            </Text>
          </View>
        </View>

        {/* ================= 1. INTRODUCTION ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionNumberBadge}>
              <Text style={styles.sectionNumberText}>01</Text>
            </View>
            <Text style={styles.sectionTitle}>Introduction & Scope</Text>
          </View>
          <Text style={styles.bodyText}>
            Both the Mobile App and Web App rendering Uncurl Health Services are hereinafter referred to as <Text style={styles.bodyTextBold}>"App"</Text> or <Text style={styles.bodyTextBold}>"Application"</Text>.
          </Text>
          <Text style={styles.bodyText}>
            The terms <Text style={styles.bodyTextBold}>"you"</Text> and <Text style={styles.bodyTextBold}>"your"</Text> refer to the user of the App. The term <Text style={styles.bodyTextBold}>"Services"</Text> refers to any services offered by Living Scope Health through the App.
          </Text>
          <Text style={styles.bodyText}>
            We, Living Scope Health Pvt. Ltd., value the trust you place in us. That's why we insist upon the highest standards for secure transactions and customer information privacy. Please read the following statement to learn about our information gathering and dissemination practices.
          </Text>
          <Text style={styles.bodyText}>
            Please read this Policy before using the App or submitting any personal information to Living Scope Health. This Policy is a part of and incorporated within, and is to be read along with, the Terms of Use.
          </Text>
        </View>

        {/* ================= 2. YOUR CONSENT ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionNumberBadge}>
              <Text style={styles.sectionNumberText}>02</Text>
            </View>
            <Text style={styles.sectionTitle}>Your Consent</Text>
          </View>
          <Text style={styles.bodyText}>
            By using the App and the Services, you agree and consent to the collection, transfer, use, storage, disclosure and sharing of your information as described and collected by us in accordance with this Policy. If you do not agree with the Policy, please do not use or access the App.
          </Text>
        </View>

        {/* ================= 3. POLICY CHANGES ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionNumberBadge}>
              <Text style={styles.sectionNumberText}>03</Text>
            </View>
            <Text style={styles.sectionTitle}>Policy Changes</Text>
          </View>
          <Text style={styles.bodyText}>
            We may occasionally update this Policy and such changes will be posted on this page. If we make any significant changes to this Policy we will endeavour to provide you with reasonable notice of such changes, such as via prominent notice on the App or to your email address on record and where required by applicable law, we will obtain your consent.
          </Text>
          <Text style={styles.bodyText}>
            To the extent permitted under the applicable law, your continued use of our Services after we publish or send a notice about our changes to this Policy shall constitute your consent to the updated Policy.
          </Text>
        </View>

        {/* ================= 4. COLLECTION OF INFORMATION ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionNumberBadge}>
              <Text style={styles.sectionNumberText}>04</Text>
            </View>
            <Text style={styles.sectionTitle}>
              Collection of Personally Identifiable Information
            </Text>
          </View>
          <Text style={styles.bodyText}>
            When you use our App, we collect and store your personal information which is provided by you from time to time. We collect several types of information from and about users of our App (collectively "Personal Information"), including, specifically:
          </Text>

          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                <Text style={styles.bodyTextBold}>Registration & Contact Info:</Text> Name, home, work and shipping addresses, telephone number, email address, contact information and password.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                <Text style={styles.bodyTextBold}>Medical & Health Data:</Text> Birthdate, racial or ethnic origin, health information, health insurance information, medical history (including diagnoses and symptoms duration), and any information provided when accessing Services.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                <Text style={styles.bodyTextBold}>App Usage & Diagnostics:</Text> Browser info, referring URL, destination URL, location, and IP address tracked on an aggregated basis for research and security.
              </Text>
            </View>
          </View>

          <Text style={styles.bodyText}>
            Our primary goal is to provide you a safe, efficient, smooth, effective and customized health experience. We collect personal and medical information from you on a continuous basis that we consider necessary for achieving this purpose.
          </Text>

          {/* AI Disclosure Highlight */}
          <View style={styles.highlightBox}>
            <Text style={styles.highlightTitle}>Important AI Technology Disclosure</Text>
            <Text style={styles.highlightText}>
              All health information and insights generated about your health through our App are produced by Artificial Intelligence (AI) technologies and NOT an individual physician or doctor. We do not employ clinical staff for direct clinical consultation. We maintain an independent Medical Board of External Advisors (prominent physicians and doctors) who oversee our overall services and guide product development.
            </Text>
          </View>
        </View>

        {/* ================= 5. PAYMENT & BANKING ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionNumberBadge}>
              <Text style={styles.sectionNumberText}>05</Text>
            </View>
            <Text style={styles.sectionTitle}>
              Credit Card, Debit Card and Banking Information
            </Text>
          </View>
          <Text style={styles.bodyText}>
            We do not collect or store Credit Card, Debit Card or banking information. Such information may be provided by you during the purchase transaction; however, this data does not come to us. It is directly transmitted through the payment gateway provider to the payment network or bank. No payment instrument information is stored on our servers.
          </Text>
        </View>

        {/* ================= 6. DATA HOSTING & SECURITY STANDARDS ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionNumberBadge}>
              <Text style={styles.sectionNumberText}>06</Text>
            </View>
            <Text style={styles.sectionTitle}>Data Hosting & Cloud Infrastructure</Text>
          </View>
          <Text style={styles.bodyText}>
            All data and information collected in the App are stored on-cloud with Amazon Web Services (AWS). Information collected is kept on servers owned and managed by AWS, which may be located in India or overseas, including the United States of America.
          </Text>
          <Text style={styles.bodyText}>
            Third-party hosting partners used by us are expected to be PCI compliant (The Payment Card Industry Data Security Standard) and maintain security procedures in compliance with US HIPAA (Health Insurance Portability and Accountability Act of 1996) standards.
          </Text>
        </View>

        {/* ================= 7. USE OF INFORMATION ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionNumberBadge}>
              <Text style={styles.sectionNumberText}>07</Text>
            </View>
            <Text style={styles.sectionTitle}>Use of Demographic & Profile Data</Text>
          </View>
          <Text style={styles.bodyText}>
            We use your Personal Information to provide requested services, process payments, respond to inquiries, detect and prevent error, fraud and other criminal activity, and customize your experience.
          </Text>
          <Text style={styles.bodyText}>
            With your explicit consent, we may access SMS, contacts directory, call history, location, and device information, or request PAN details to evaluate eligibility for wellness products or partner credit programs. In the event consent is withdrawn, we cease collection but may retain anonymized data for internal improvements as permitted by law.
          </Text>
          <Text style={styles.bodyText}>
            Aggregated and de-identified information is not restricted by this Policy and may be used with academic research partners to improve healthcare solutions.
          </Text>
        </View>

        {/* ================= 8. COOKIES ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionNumberBadge}>
              <Text style={styles.sectionNumberText}>08</Text>
            </View>
            <Text style={styles.sectionTitle}>Cookies & Tracking Devices</Text>
          </View>
          <Text style={styles.bodyText}>
            A "cookie" is a small piece of information stored on your web browser or device. Cookies enable our systems to recognize your preferences and remember session information. We use both session and persistent cookies. You may decline cookies in your browser settings, though certain app features may require authentication re-entry.
          </Text>
        </View>

        {/* ================= 9. SHARING OF INFORMATION ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionNumberBadge}>
              <Text style={styles.sectionNumberText}>09</Text>
            </View>
            <Text style={styles.sectionTitle}>Sharing of Personal Information</Text>
          </View>
          <Text style={styles.bodyText}>
            <Text style={styles.bodyTextBold}>We do not sell, rent or disclose your personal information</Text> to third parties for their marketing and advertising purposes without your explicit consent.
          </Text>
          <Text style={styles.bodyText}>
            We may disclose personal information if required to do so by law, court order, or in good faith belief that such disclosure is reasonably necessary to respond to legal summonses, enforce our Terms, or protect public safety.
          </Text>
          <Text style={styles.bodyText}>
            In the event of a merger, acquisition, or business restructuring, consumer information will continue to be governed by the protections in this Privacy Policy.
          </Text>
        </View>

        {/* ================= 10. SECURITY PRECAUTIONS ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionNumberBadge}>
              <Text style={styles.sectionNumberText}>10</Text>
            </View>
            <Text style={styles.sectionTitle}>Security Precautions</Text>
          </View>
          <Text style={styles.bodyText}>
            Our App has stringent security measures in place to protect against the loss, misuse, and alteration of information under our control. Whenever you access account information, we offer the use of secure encrypted servers. While we adhere to rigorous safeguards, no Internet data transmission can be guaranteed 100% impenetrable.
          </Text>
        </View>

        {/* ================= 11. CHILDREN'S PRIVACY ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionNumberBadge}>
              <Text style={styles.sectionNumberText}>11</Text>
            </View>
            <Text style={styles.sectionTitle}>Children's Privacy</Text>
          </View>
          <Text style={styles.bodyText}>
            The Services are not designed or intended for individuals under eighteen (18) years of age directly. Minors may join our services strictly under a family plan with verified parental consent. If we learn that personal data of a minor was received without parental authorization, such information is immediately purged.
          </Text>
        </View>

        {/* ================= 12. OPT OUT & GRIEVANCE ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionNumberBadge}>
              <Text style={styles.sectionNumberText}>12</Text>
            </View>
            <Text style={styles.sectionTitle}>How to Opt Out & Grievances</Text>
          </View>
          <Text style={styles.bodyText}>
            You may opt out of our services at any time by cancelling your account directly within the Application settings.
          </Text>

          <View style={styles.grievanceBox}>
            <Text style={styles.grievanceTitle}>Grievance Officer</Text>
            <Text style={styles.grievanceSubtitle}>
              In case of questions, concerns or grievances regarding this Policy, please contact our team:
            </Text>
            <TouchableOpacity
              style={styles.emailButton}
              onPress={handleEmailPress}
              activeOpacity={0.8}
            >
              <Text style={styles.emailButtonText}>
                ✉ grievance@livingscopehealth.com
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= 13. SOCIAL MEDIA NOTICES ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionNumberBadge}>
              <Text style={styles.sectionNumberText}>13</Text>
            </View>
            <Text style={styles.sectionTitle}>Concerning Facebook & Social Media</Text>
          </View>
          <Text style={styles.bodyText}>
            On our web portals, buttons linking to Facebook and Instagram pages are provided. Data transmission to external social networks is governed by respective third-party policies:
          </Text>
          <Text style={styles.bodyText}>
            • Facebook Privacy: facebook.com/about/privacy{'\n'}
            • Instagram Privacy: help.instagram.com/155833707900388
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;
