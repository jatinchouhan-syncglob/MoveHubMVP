import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Svg, { Path } from 'react-native-svg';

export interface IFaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_API_URL =
  'https://txsbp7baq1.execute-api.ap-south-1.amazonaws.com/backend/health-connect/challenge/faqs';

const FALLBACK_FAQS: IFaqItem[] = [
  {
    id: '01',
    question: 'Who can participate?',
    answer:
      'ECFL is designed smartphone-first, with no specialist equipment required. Full eligibility details will be confirmed before registration opens.',
    category: 'eligibility',
  },
  {
    id: '02',
    question: 'How does the 21-day tournament work?',
    answer:
      'The gauntlet runs across three stages: Qualify (days 1–7), Compete (days 8–14), and Conquer (days 15–21). Each stage narrows the field until only the National Podium remains.',
    category: 'tournament_format',
  },
  {
    id: '03',
    question: 'What are the five arenas?',
    answer:
      'Global Field — you vs India. The Inner Circle — your crew vs the field. Commercial Gyms — your gym vs every gym. Residential Enclaves — your community vs the city. Healthcare Facility — hospitals, clinics, and labs, for healthcare professionals. All five routes share the same 21-day journey.',
    category: 'arenas',
  },
  {
    id: '04',
    question: 'How is performance measured?',
    answer:
      'Movement, recovery, fitness, and behaviour — everyday signals from the phone already in your pocket. AI turns them into one score on a level playing field.',
    category: 'scoring',
  },
  {
    id: '05',
    question: 'How does elimination work?',
    answer:
      'After Qualify, the field is cut to 50%. After Compete, only 25% remain. The contenders who survive the cut fight for the National Podium.',
    category: 'elimination',
  },
  {
    id: '06',
    question: 'Do I need a smartwatch or fitness tracker?',
    answer:
      'No. ECFL is built smartphone-first — the device you already carry is the gateway. Supported devices will be detailed in the official rules.',
    category: 'hardware',
  },
  {
    id: '07',
    question: 'What happens if I miss a day?',
    answer:
      'The competition rewards consistency across the full 21 days. How missed days are handled will be confirmed in the final rules.',
    category: 'rules',
  },
  {
    id: '08',
    question: 'When will the final rules be published?',
    answer:
      'With registration. Everything above follows the current competition framework — the official rules will finalise it.',
    category: 'schedule',
  },
];

export const Faq: React.FC = () => {
  const [faqs, setFaqs] = useState<IFaqItem[]>(FALLBACK_FAQS);
  const [expandedId, setExpandedId] = useState<string | null>('01');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axios.get(FAQ_API_URL, { timeout: 8000 });
        if (
          response.data &&
          response.data.faqs &&
          Array.isArray(response.data.faqs)
        ) {
          setFaqs(response.data.faqs);
        }
      } catch (error) {
        console.warn('[Faq] Error fetching FAQs, using fallback:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const toggleAccordion = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <View style={styles.container}>
      {/* Header Block */}
      <View style={styles.headerBlock}>
        <Text style={styles.eyebrow}>THE DETAILS</Text>
        <Text style={styles.titleLine1}>KNOW BEFORE</Text>
        <View style={styles.titleLine2Row}>
          <Text style={styles.titleBlue}>YOU </Text>
          <Text style={styles.titleMagenta}>ENTER.</Text>
        </View>

        <Text style={styles.subtitle}>
          Final rules will be published with registration. Here is the current
          competition framework.
        </Text>

        {/* Specifications Pills */}
        <View style={styles.pillsRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>21 DAYS</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>3 STAGES</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>5 ARENAS</Text>
          </View>
          <View style={[styles.pill, styles.podiumPill]}>
            <Text style={styles.podiumPillText}>1 PODIUM</Text>
          </View>
        </View>
      </View>

      {/* Accordion FAQ List */}
      <View style={styles.faqListContainer}>
        {loading && faqs.length === 0 ? (
          <ActivityIndicator size="small" color="#A855F7" style={{ marginVertical: 20 }} />
        ) : (
          faqs.map(item => {
            const isExpanded = expandedId === item.id;

            return (
              <View
                key={item.id}
                style={[
                  styles.faqItemWrapper,
                  isExpanded && styles.faqItemWrapperExpanded,
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => toggleAccordion(item.id)}
                  style={styles.faqHeaderRow}
                >
                  <Text
                    style={[
                      styles.faqNumber,
                      isExpanded ? styles.faqNumberActive : styles.faqNumberInactive,
                    ]}
                  >
                    {item.id}
                  </Text>

                  <Text style={styles.faqQuestion}>{item.question}</Text>

                  <View
                    style={[
                      styles.toggleIconBtn,
                      isExpanded ? styles.toggleIconExpanded : styles.toggleIconCollapsed,
                    ]}
                  >
                    {isExpanded ? (
                      <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M18 6L6 18M6 6l12 12"
                          stroke="#FFFFFF"
                          strokeWidth={2.8}
                          strokeLinecap="round"
                        />
                      </Svg>
                    ) : (
                      <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M12 5v14M5 12h14"
                          stroke="#FFFFFF"
                          strokeWidth={2.4}
                          strokeLinecap="round"
                        />
                      </Svg>
                    )}
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 36,
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#0B0F17',
    borderWidth: 1.5,
    borderColor: '#A855F7', // Vibrant purple border matching FAQ
    overflow: 'hidden',
  },
  sectionBadgeRow: {
    marginBottom: 10,
  },
  sectionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderWidth: 1,
    borderColor: '#A855F7',
  },
  sectionBadgeText: {
    color: '#C084FC',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  headerBlock: {
    marginBottom: 20,
  },
  eyebrow: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  titleLine1: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
    lineHeight: 36,
  },
  titleLine2Row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleBlue: {
    color: '#3B82F6',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
    lineHeight: 36,
  },
  titleMagenta: {
    color: '#EC4899',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
    lineHeight: 36,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 16,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  pillText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  podiumPill: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  podiumPillText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  faqListContainer: {
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  faqItemWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingVertical: 14,
  },
  faqItemWrapperExpanded: {
    backgroundColor: '#170E24',
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 4,
    borderColor: '#7E22CE',
    borderWidth: 1,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqNumber: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    width: 26,
  },
  faqNumberActive: {
    color: '#F59E0B',
  },
  faqNumberInactive: {
    color: '#64748B',
  },
  faqQuestion: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginRight: 12,
    lineHeight: 20,
  },
  toggleIconBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleIconCollapsed: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  toggleIconExpanded: {
    backgroundColor: '#A855F7',
  },
  faqAnswerContainer: {
    paddingTop: 10,
    paddingLeft: 26,
    paddingRight: 8,
  },
  faqAnswerText: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
});

export default Faq;
