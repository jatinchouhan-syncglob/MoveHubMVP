import { IMentalHealthPart, LikertValue } from './types';

export const MENTAL_HEALTH_OPTIONS: { label: string; value: LikertValue }[] = [
  { label: 'Always', value: 'Always' },
  { label: 'Often', value: 'Often' },
  { label: 'Sometimes', value: 'Sometimes' },
  { label: 'Rarely', value: 'Rarely' },
  { label: 'Never', value: 'Never' },
];

export const MENTAL_HEALTH_PARTS: IMentalHealthPart[] = [
  {
    partNumber: 1,
    partTitle: 'Symptom Screening',
    partSubtitle: 'Baseline screening for Anxiety, Depression, and Stress',
    badge: 'PART 1 OF 2',
    categories: [
      {
        id: 'anxiety',
        title: 'Anxiety',
        icon: '⚡',
        subtitle: 'Assessing patterns of worry, restlessness, and anticipation',
        questions: [
          {
            id: 'anx1',
            field: 'anx1',
            qNumber: 'Q1',
            text: 'I often find myself anticipating the worst even when things seem fine.',
          },
          {
            id: 'anx2',
            field: 'anx2',
            qNumber: 'Q2',
            text: 'I tend to overthink situations that are out of my control.',
          },
          {
            id: 'anx3',
            field: 'anx3',
            qNumber: 'Q3',
            text: 'I frequently feel uneasy or restless, even in familiar settings.',
          },
          {
            id: 'anx4',
            field: 'anx4',
            qNumber: 'Q4',
            text: 'I tend to feel nervous before doing everyday tasks that others find simple.',
          },
          {
            id: 'anx5',
            field: 'anx5',
            qNumber: 'Q5',
            text: 'I catch myself scanning for danger or things that might go wrong.',
          },
          {
            id: 'anx6',
            field: 'anx6',
            qNumber: 'Q6',
            text: 'I struggle to quiet my mind when I try to relax or take breaks.',
          },
        ],
      },
      {
        id: 'depression',
        title: 'Depression',
        icon: '🌧️',
        subtitle: 'Evaluating emotional flatness, withdrawal, and self-criticism',
        questions: [
          {
            id: 'dep1',
            field: 'dep1',
            qNumber: 'Q1',
            text: 'I have a tendency to feel emotionally flat, even during moments that should be joyful.',
          },
          {
            id: 'dep2',
            field: 'dep2',
            qNumber: 'Q2',
            text: 'I often find myself withdrawing from people or situations I once enjoyed.',
          },
          {
            id: 'dep3',
            field: 'dep3',
            qNumber: 'Q3',
            text: 'I sometimes feel like I’m moving through life in slow pace.',
          },
          {
            id: 'dep4',
            field: 'dep4',
            qNumber: 'Q4',
            text: 'I struggle to see purpose or meaning in my day-to-day activities.',
          },
          {
            id: 'dep5',
            field: 'dep5',
            qNumber: 'Q5',
            text: 'I often feel emotionally numb or disconnected from things around me.',
          },
          {
            id: 'dep6',
            field: 'dep6',
            qNumber: 'Q6',
            text: 'I tend to criticize myself harshly, even for minor mistakes.',
          },
        ],
      },
      {
        id: 'stress',
        title: 'Stress',
        icon: '🔥',
        subtitle: 'Monitoring physical tension, exhaustion, and workload reaction',
        questions: [
          {
            id: 'str1',
            field: 'str1',
            qNumber: 'Q1',
            text: 'I have a tendency to feel like I’m running out of time, even with simple tasks.',
          },
          {
            id: 'str2',
            field: 'str2',
            qNumber: 'Q2',
            text: 'I often find myself juggling too many responsibilities without a break.',
          },
          {
            id: 'str3',
            field: 'str3',
            qNumber: 'Q3',
            text: 'I experience physical symptoms like headaches, muscle tension, or fatigue during busy days.',
          },
          {
            id: 'str4',
            field: 'str4',
            qNumber: 'Q4',
            text: 'I find it difficult to switch off from work or responsibilities, even after hours.',
          },
          {
            id: 'str5',
            field: 'str5',
            qNumber: 'Q5',
            text: 'I have a tendency to react strongly when things don’t go as planned.',
          },
          {
            id: 'str6',
            field: 'str6',
            qNumber: 'Q6',
            text: 'I feel emotionally drained or overstimulated by the end of the day.',
          },
        ],
      },
    ],
  },
  {
    partNumber: 2,
    partTitle: 'Lifestyle & Coping',
    partSubtitle: 'Assessing Sleep Patterns, Substance Habits, and Emotional Regulation',
    badge: 'PART 2 OF 2',
    categories: [
      {
        id: 'sleep',
        title: 'Sleep Patterns',
        icon: '🌙',
        subtitle: 'Assessing sleep disruption, night waking, and daytime fatigue',
        questions: [
          {
            id: 'sle1',
            field: 'sle1',
            qNumber: 'Q1',
            text: 'I often find myself lying awake at night with my mind racing.',
          },
          {
            id: 'sle2',
            field: 'sle2',
            qNumber: 'Q2',
            text: 'I wake up feeling tired, even after what should be enough sleep.',
          },
          {
            id: 'sle3',
            field: 'sle3',
            qNumber: 'Q3',
            text: 'I tend to delay sleep or push through fatigue instead of resting.',
          },
          {
            id: 'sle4',
            field: 'sle4',
            qNumber: 'Q4',
            text: 'I rely on screens late into the night, which affects my sleep.',
          },
          {
            id: 'sle5',
            field: 'sle5',
            qNumber: 'Q5',
            text: 'I struggle with maintaining a consistent sleep-wake schedule.',
          },
          {
            id: 'sle6',
            field: 'sle6',
            qNumber: 'Q6',
            text: 'I find myself waking up multiple times during the night, feeling unsettled.',
          },
        ],
      },
      {
        id: 'substance',
        title: 'Substance Use',
        icon: '🍷',
        subtitle: 'Monitoring consumption habits as an emotional coping mechanism',
        noticeBanner:
          'Substance refers to the use of one or more of the following: Alcohol, Cannabis, PCP, LSD and other hallucinogens, Inhalants (such as paint thinners and glue), Opioid painkillers (such as codeine, oxycodone, heroin), Sedatives, hypnotics and anxiolytics, Stimulants (including cocaine, amphetamines), Tobacco, nicotine.',
        questions: [
          {
            id: 'sub1',
            field: 'sub1',
            qNumber: 'Q1',
            text: 'I sometimes rely on alcohol or other substances to unwind after a stressful day.',
          },
          {
            id: 'sub2',
            field: 'sub2',
            qNumber: 'Q2',
            text: "I tend to turn to substances when I'm feeling emotionally overwhelmed.",
          },
          {
            id: 'sub3',
            field: 'sub3',
            qNumber: 'Q3',
            text: 'I occasionally feel that my consumption habits might be slipping out of control.',
          },
          {
            id: 'sub4',
            field: 'sub4',
            qNumber: 'Q4',
            text: 'I’ve found myself needing more of a substance to feel the same effect I used to, when I first started.',
          },
          {
            id: 'sub5',
            field: 'sub5',
            qNumber: 'Q5',
            text: 'I sometimes feel guilty or conflicted after using substances.',
          },
          {
            id: 'sub6',
            field: 'sub6',
            qNumber: 'Q6',
            text: 'I have noticed my performance or relationships being subtly affected by my consumption habits.',
          },
        ],
      },
      {
        id: 'emotional',
        title: 'Emotional Regulation',
        icon: '⚖️',
        subtitle: 'Evaluating emotional resilience, reactivity, and mood shifts',
        questions: [
          {
            id: 'emo1',
            field: 'emo1',
            qNumber: 'Q1',
            text: 'I tend to bottle up emotions until they become too intense to manage.',
          },
          {
            id: 'emo2',
            field: 'emo2',
            qNumber: 'Q2',
            text: 'I find it difficult to bounce back quickly after emotional setbacks.',
          },
          {
            id: 'emo3',
            field: 'emo3',
            qNumber: 'Q3',
            text: 'I often feel like I’m being pulled by my emotions rather than guiding them.',
          },
          {
            id: 'emo4',
            field: 'emo4',
            qNumber: 'Q4',
            text: 'I struggle to express my feelings clearly without becoming overwhelmed.',
          },
          {
            id: 'emo5',
            field: 'emo5',
            qNumber: 'Q5',
            text: 'I tend to react strongly to criticism, rejection, or conflict.',
          },
          {
            id: 'emo6',
            field: 'emo6',
            qNumber: 'Q6',
            text: 'I sometimes feel emotionally unstable or like my mood shifts unexpectedly.',
          },
        ],
      },
    ],
  },
];
