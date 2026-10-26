import {
  ISegmentConfig,
  UserSegmentKey,
  IMetricStrategyItem,
  ITournamentBracketStage,
  IBiophysicalCalibrationProfile,
} from './types';

export const SEGMENT_ORDERED_KEYS: UserSegmentKey[] = [
  'MASS_INDIVIDUALS',
  'FRIENDS_FAMILY',
  'RESIDENTIAL_COMPLEX',
  'COLLEGE_YOUTH',
  'GYM_NETWORK',
  'CLINICAL_LABS',
  'HEALTH_RETAIL',
];

export const ARENA_GLOBAL_TITLE =
  '🏟️ THE ARENA: THE ULTIMATE CARDIOMETABOLIC WAITING LOUNGE & HABIT WAR ROOM';
export const ARENA_GLOBAL_SUBTITLE =
  'Before the tournament gates open, this page must lower the entry barriers to tracking, resolve any confusion about metrics, and deliver immediate value. It serves as a visual hub that primes the user\'s mind for behavioral change while driving viral growth for the platform.';

export const SEGMENT_CONFIGS: Record<UserSegmentKey, ISegmentConfig> = {
  // 1. Mass Individuals (B2C Core)
  MASS_INDIVIDUALS: {
    key: 'MASS_INDIVIDUALS',
    segmentNumber: '01',
    name: 'Mass Individuals',
    shortLabel: 'Mass Individuals',
    icon: '💻',
    targetAudience: 'White-collar Office Workers & Remote Desk Workers',
    title: '🏟️ THE ARENA: THE CARDIOMETABOLIC WAR ROOM & WORKSPACE RECOVERY LOUNGE',
    statusTag: 'Focus: Active',
    statusIcon: '🎯',
    theme: {
      canvasBase: '#1A1F26',
      coreAccent: '#00E5FF',
      secondaryAura: '#3A414A',
      mutedBorders: '#3A414A',
      cardBg: '#14181F',
      textPrimary: '#FFFFFF',
      textSecondary: '#CBD5E1',
      badgeBg: 'rgba(0, 229, 255, 0.16)',
      accentGlow: 'rgba(0, 229, 255, 0.3)',
    },
    initialTicker:
      'Total Mumbai desk-stasis minutes avoided today: 14,200... User X from Bandra calibrated cadence.',
    tickerStream: [
      'Total Mumbai desk-stasis minutes avoided today: 14,200.',
      'User X from Bandra just calibrated their base step cadence...',
      'Taking 60 steps in 90 seconds resets your sitting run back to 0 instantly.',
      'Fixing poor walking posture boosts daily calorie burn economy without gym time.',
    ],
    focusTrackers: [
      {
        title: 'S-DEX™ STASIS RUN',
        value: '0.00',
        subLabel: 'STASIS INTERCEPTED',
        statusBadge: '🚶 RESET ACTIVE',
        badgeType: 'active',
      },
      {
        title: 'MHP: Modified Heart Points',
        value: '20',
        subLabel: 'MODERATE RISK',
        statusBadge: '🔥 SILVER',
        badgeType: 'optimal',
      },
    ],
    standings: {
      title: 'METABOLIC LEAK RADAR',
      historyItems: [
        {
          label: 'Sedentary Block Interception',
          detail: '9 of 10 sitting blocks reset under 60 minutes',
          status: 'OPTIMAL',
        },
        {
          label: 'Cadence Velocity Calibration',
          detail: '118 steps/min baseline stride efficiency',
          status: 'ACTIVE',
        },
      ],
      bannerStatusText: '',
    },
    actions: [
      {
        id: 'launch_alarm',
        label: '90-Second Movement Break Radar Monitoring is Activated',
        icon: '⏱️',
        type: 'audit',
      },
      {
        id: 'share_corporate',
        label: 'Create Your Inner Circle',
        icon: '👥',
        type: 'share',
      },
    ],
    psychologicalHook:
      'Appeals directly to busy white-collar office desk workers. It frames the app page as an active tool built to combat the physical exhaustion and metabolic damage of long, sedentary sitting runs.',
    contentHookTitle: "Desk Worker's Metabolic Leak Radar",
    bottomNavTabs: ['War Room', 'Metrics', 'Cadence', 'Profile'],
    category: 'Mass Individuals',
    tagline: 'The Metabolic Leak Radar',
    headline: 'THE CARDIOMETABOLIC WAR ROOM & WORKSPACE RECOVERY LOUNGE.',
    summary:
      'Displays the "Metabolic Leak Radar." It teaches busy individuals how fixing poor walking posture and avoiding long sitting blocks boosts daily calorie burn economy without requiring more gym time.',
    facts: [
      '60-STEP / 90s RADAR',
      'S-DEX™ RUN 0.00',
      'MHP: Modified Heart Points',
      'CARDIO/METABOLIC ALIGNMENT',
    ],
  },

  // 2. Friends & Family Cohorts
  FRIENDS_FAMILY: {
    key: 'FRIENDS_FAMILY',
    segmentNumber: '02',
    name: 'Friends & Family Cohorts',
    shortLabel: 'Friends & Family',
    icon: '👨‍👩‍👧',
    targetAudience: 'Inner Circles, Social Squads & Micro-Influencers',
    title: '🏟️ THE ARENA: THE FAMILY HABIT WAR ROOM & CIRCADIAN SHIELD',
    statusTag: 'Multi: 1.4x',
    statusIcon: '✨',
    theme: {
      canvasBase: '#1F0F3D',
      coreAccent: '#FF6B6B',
      secondaryAura: '#5C4B75',
      mutedBorders: '#5C4B75',
      cardBg: '#2B1552',
      textPrimary: '#FFFFFF',
      textSecondary: '#F3E8FF',
      badgeBg: 'rgba(255, 107, 107, 0.18)',
      accentGlow: 'rgba(255, 107, 107, 0.3)',
    },
    initialTicker:
      'Your inner circle has hit 48 hours of sync uniformity! Multiplier active.',
    tickerStream: [
      'Your inner circle has hit 48 hours of sync uniformity! Multiplier active.',
      'Team Multiplier boosted current tournament scoring by 1.4x.',
      'Priya & Rahul synchronized rest routines for 3 consecutive days.',
      'Copy your personal code to unlock 5% direct cash clip rewards.',
    ],
    focusTrackers: [
      {
        title: 'IS™ INTERDAILY STAMINA',
        value: '0.89',
        subLabel: 'SCHEDULE UNIFORMITY',
        statusBadge: '⚡ HIGH SYNC',
        badgeType: 'active',
      },
      {
        title: 'BSE™ MASTER SCORE',
        value: '91/100',
        subLabel: 'CIRCADIAN SYNERGY',
        statusBadge: '🟢 PARASYMP-TONE',
        badgeType: 'optimal',
      },
    ],
    standings: {
      title: 'CIRCADIAN SYNERGY SHIELD & LEADERBOARD',
      team1: {
        name: 'Family Squad Alpha',
        points: '145,000 pts',
        progressPercent: 82,
        barColor: '#FF6B6B',
      },
      team2: {
        name: 'Your Circle Team',
        points: '94,200 pts',
        progressPercent: 58,
        barColor: '#A855F7',
      },
      bannerStatusText:
        'Features the "Circadian Synergy Shield." It shows the combined team routine stability score and runs competitive prompts: "Can your family maintain perfect schedule uniformity for 3 consecutive days to unlock the Team Multiplier?"',
    },
    actions: [
      {
        id: 'copy_code',
        label: 'Copy Your Personal Code (5% Cash Clip Inside)',
        icon: '📋',
        type: 'share',
      },
      {
        id: 'invite_whatsapp',
        label: 'Invite a New Group Captain via WhatsApp',
        icon: '💬',
        type: 'share',
      },
    ],
    psychologicalHook:
      'Focuses entirely on mutual support and group routines. It drops dry clinical terms to emphasize protecting their inner circle\'s collective sleep, routine uniformity, and daily health score milestones.',
    contentHookTitle: 'Circadian Synergy Shield',
    bottomNavTabs: ['Circle', 'Leaderboard', 'Logs', 'Profile'],
    category: 'Friends & Family Cohorts',
    tagline: 'CIRCADIAN SYNERGY SHIELD',
    headline: 'THE FAMILY HABIT WAR ROOM & CIRCADIAN SHIELD.',
    summary:
      'Features the "Circadian Synergy Shield." It shows the combined team routine stability score and runs competitive prompts: "Can your family maintain perfect schedule uniformity for 3 consecutive days to unlock the Team Multiplier?"',
    facts: [
      '1.4x TEAM MULTIPLIER',
      'CIRCADIAN SYNERGY SHIELD',
      'IS™ STAMINA UNIFORMITY',
      '5% REWARD COMMISSIONS',
    ],
  },

  // 3. Mega Residential Complexes & Gated Communities
  RESIDENTIAL_COMPLEX: {
    key: 'RESIDENTIAL_COMPLEX',
    segmentNumber: '03',
    name: 'Mega Residential Complexes & Gated Communities',
    shortLabel: 'Mega Residential',
    icon: '🏘️',
    targetAudience: 'Apartment Towers, RWAs & Gated Communities',
    title: '🏟️ THE ARENA: THE FAMILY HEALTH SHIELD & HABIT WAR ROOM',
    statusTag: 'Wing: A',
    statusIcon: '📍',
    theme: {
      canvasBase: '#121212',
      coreAccent: '#D4AF37',
      secondaryAura: '#0F4C3A',
      mutedBorders: '#2A3B32',
      cardBg: '#1A241E',
      textPrimary: '#FFFFFF',
      textSecondary: '#E2E8F0',
      badgeBg: 'rgba(212, 175, 55, 0.18)',
      accentGlow: 'rgba(212, 175, 55, 0.3)',
    },
    initialTicker:
      'Tower 3 bypassed 5k stasis minutes today! Community balance restored.',
    tickerStream: [
      'Tower 3 bypassed 5k stasis minutes today! Balance restored.',
      'Wing A added 12 new families to the evening stairwell pacing challenge.',
      'Wing B closed the gap with 4,200 collective steps in 30 minutes.',
      'Complex Welfare Association officially registered for the National Podium.',
    ],
    focusTrackers: [
      {
        title: 'S-DEX™ COMMUNITY STASIS',
        value: '0.05',
        subLabel: 'STASIS AVOIDED',
        statusBadge: '🟢 OPTIMAL DECOMP',
        badgeType: 'optimal',
      },
      {
        title: 'BARI™ BIO-AGE RESILIENCE',
        value: '92/100',
        subLabel: 'FAMILY ARRAYS',
        statusBadge: '✨ CELLULAR RECOVERY',
        badgeType: 'optimal',
      },
    ],
    standings: {
      title: 'SOCIETY TOWER STANDINGS: WING A vs. WING B',
      team1: {
        name: 'Wing A: The Alphas',
        points: '112,400 pts',
        progressPercent: 78,
        barColor: '#D4AF37',
      },
      team2: {
        name: 'Wing B: Elite Group',
        points: '98,900 pts',
        progressPercent: 66,
        barColor: '#10B981',
      },
      bannerStatusText:
        'Displays the "Society Tower Standings." It shows a mock-up scoreboard of Wing A vs. Wing B or Complex X vs. Complex Y, making community fitness a point of neighborhood pride.',
    },
    actions: [
      {
        id: 'form_circle',
        label: 'Form Your 4-User Household Circle',
        icon: '👨‍👩‍👧‍👦',
        type: 'register',
      },
      {
        id: 'register_rwa',
        label: 'Register Your Complex Welfare Association (RWA)',
        icon: '🏛️',
        type: 'refer',
      },
    ],
    psychologicalHook:
      'Focus on protective health and family longevity. Intra-complex rivalry (Wing A vs. Wing B) makes community fitness a point of neighborhood pride.',
    contentHookTitle: 'Society Tower Standings',
    bottomNavTabs: ['Hub', 'Standings', 'Activity', 'Family'],
    category: 'Mega Residential Complexes',
    tagline: 'SOCIETY TOWER STANDINGS',
    headline: 'THE FAMILY HEALTH SHIELD & HABIT WAR ROOM.',
    summary:
      'Displays the "Society Tower Standings." It shows a mock-up scoreboard of Wing A vs. Wing B or Complex X vs. Complex Y, making community fitness a point of neighborhood pride.',
    facts: [
      'SOCIETY TOWER DERBY',
      'FAMILY S-DEX™ MATRIX',
      'BARI™ RESILIENCE ARRAYS',
      'RWA TOURNAMENT ENTRY',
    ],
  },

  // 4. Colleges & Universities
  COLLEGE_YOUTH: {
    key: 'COLLEGE_YOUTH',
    segmentNumber: '04',
    name: 'Colleges & Universities',
    shortLabel: 'Colleges & Universities',
    icon: '🎓',
    targetAudience: 'College Students & Campus Athletic Brackets',
    title: '🏟️ THE ARENA: THE FITNESS TOURNAMENT WAR ROOM & LEADERBOARD GATE',
    statusTag: 'Rank: #4',
    statusIcon: '🏆',
    theme: {
      canvasBase: '#0B001A',
      coreAccent: '#FF0055',
      secondaryAura: '#8B00FF',
      mutedBorders: '#8B00FF',
      cardBg: '#1A0336',
      textPrimary: '#FFFFFF',
      textSecondary: '#D8B4FE',
      badgeBg: 'rgba(255, 0, 85, 0.18)',
      accentGlow: 'rgba(139, 0, 255, 0.35)',
    },
    initialTicker:
      'Team MET just added 45 captains... Total Mumbai desk-stasis avoided today: 14,200.',
    tickerStream: [
      'Team MET just added 45 captains... Knockout gate closing soon!',
      'IIT Bombay Campus Cohort logged 22,000 brisk cadence steps.',
      'Rival Tech Academy is trailing by 16,500 points in Bracket 2.',
      'Campus Captain Aryan unlocked the 5% viral syndication reward.',
    ],
    focusTrackers: [
      {
        title: 'MHP™ HEART POINTS',
        value: '145',
        subLabel: 'SUSTAINED BRISK INTENSITY',
        statusBadge: '⚡ BRISK INTENSITY',
        badgeType: 'active',
      },
      {
        title: 'FFS™ PILLAR WHEEL',
        value: '88/100',
        subLabel: 'WORKOUT FREQUENCY',
        statusBadge: '🔒 STRENGTH LOCKED',
        badgeType: 'locked',
      },
    ],
    standings: {
      title: 'CAMPUS CAPTAINS LEADERBOARD: MET MUMBAI vs. RIVAL CAMPUS',
      team1: {
        name: 'MET Mumbai Cohort',
        points: '62,400 pts',
        progressPercent: 65,
        barColor: '#FF0055',
      },
      team2: {
        name: 'Rival Tech Academy',
        points: '78,900 pts',
        progressPercent: 82,
        barColor: '#8B00FF',
      },
      bannerStatusText:
        'Features the "Campus Captains Leaderboard." It highlights top peer-to-peer referral champions, showcases competitive campus sports brackets, and offers a tap button to invite rival student bodies into the tournament.',
    },
    actions: [
      {
        id: 'share_invite',
        label: 'Share Your Invite Link (5% Commission Clip)',
        icon: '🔗',
        type: 'share',
      },
      {
        id: 'challenge_campus',
        label: 'Challenge Another College Campus',
        icon: '⚔️',
        type: 'challenge',
      },
    ],
    psychologicalHook:
      'Engineered to drive viral, high-velocity social competition among students, turning fitness tracking into an intense team esport.',
    contentHookTitle: 'Campus Captains Leaderboard',
    bottomNavTabs: ['Arena', 'Leaderboard', 'Logs', 'Profile'],
    category: 'Colleges & Universities',
    tagline: 'CAMPUS CAPTAINS LEADERBOARD',
    headline: 'THE FITNESS TOURNAMENT WAR ROOM & LEADERBOARD GATE.',
    summary:
      'Features the "Campus Captains Leaderboard." It highlights top peer-to-peer referral champions, showcases competitive campus sports brackets, and offers a tap button to invite rival student bodies into the tournament.',
    facts: [
      'CAMPUS BRACKET GAUNTLET',
      'MHP™ INTENSITY POINTS',
      'FFS™ PILLAR WHEEL',
      '5% COMMISSION CLIP',
    ],
  },

  // 5. Premium Gym Networks
  GYM_NETWORK: {
    key: 'GYM_NETWORK',
    segmentNumber: '05',
    name: 'Premium Gym Networks',
    shortLabel: 'Premium Gyms',
    icon: '🏋️',
    targetAudience: 'Athletes, Bodybuilders & Trainers',
    title: '🏟️ THE ARENA: THE ATHLETIC PERFORMANCE GATE & RECOVERY WAR ROOM',
    statusTag: 'Mode: Pro',
    statusIcon: '⚡',
    theme: {
      canvasBase: '#1C1C1E',
      coreAccent: '#DFFF00',
      secondaryAura: '#48484A',
      mutedBorders: '#48484A',
      cardBg: '#28282B',
      textPrimary: '#FFFFFF',
      textSecondary: '#E4E4E7',
      badgeBg: 'rgba(223, 255, 0, 0.16)',
      accentGlow: 'rgba(223, 255, 0, 0.3)',
    },
    initialTicker:
      'System friction minimized. Your internal cardiac overhead has dropped.',
    tickerStream: [
      'System friction minimized. Your internal cardiac overhead has dropped.',
      'Gym workouts are 4% of your day. Uncurl tracks the remaining 96%.',
      'Power Squats: 4 Sets Logged Natively (FFS Upward vector aligned).',
      'Coach Vikram verified 180s Spine Decompression post-session.',
    ],
    focusTrackers: [
      {
        title: 'PPI™ PULSE-PACE INDEX',
        value: '0.34',
        subLabel: 'CARDIAC FRICTION RATIO',
        statusBadge: '🟢 LOW BIODRAG (CLEAN)',
        badgeType: 'optimal',
      },
      {
        title: 'BIOMECHANICAL FFS™ PILLARS',
        value: '3.2 kcal/km',
        subLabel: 'MOVEMENT EFFICIENCY',
        statusBadge: '🏃 HIGH ECONOMY',
        badgeType: 'optimal',
      },
    ],
    standings: {
      title: 'THE 96% BACKGROUND RECOVERY MATRIX',
      historyItems: [
        {
          label: 'Power Squats',
          detail: '4 Sets Logged Natively (FFS Upward)',
          status: 'LOGGED',
        },
        {
          label: 'Asana Cooldown',
          detail: '180s Spine Decompression Confirmed',
          status: 'CONFIRMED',
        },
      ],
      bannerStatusText:
        'Displays the "Background Recovery Matrix." It teaches athletes that gym workouts account for only 4% of their day. It shows them how Uncurl: AI Tech tracks their movement efficiency during the remaining 96% of the day to maximize muscle building and fat loss.',
    },
    actions: [
      {
        id: 'view_audit',
        label: 'View Your 96% Off-Body Biomechanical Leak Audit',
        icon: '📊',
        type: 'audit',
      },
      {
        id: 'connect_trainer',
        label: 'Connect Your Head Trainer / Elite Gym Owner',
        icon: '🤝',
        type: 'refer',
      },
    ],
    psychologicalHook:
      'Speaks the language of competitive fitness. Gym members and trainers don\'t want a "waiting lounge"; they want an active Performance Gate and a data-driven recovery space that optimizes their habits outside gym hours to maximize active muscle building and fat loss.',
    contentHookTitle: 'Background Recovery Matrix',
    bottomNavTabs: ['Engine', 'Logger', 'Metrics', 'Profile'],
    category: 'Premium Gym Networks',
    tagline: 'THE 96% BACKGROUND RECOVERY MATRIX',
    headline: 'THE ATHLETIC PERFORMANCE GATE & RECOVERY WAR ROOM.',
    summary:
      'Displays the "Background Recovery Matrix." It teaches athletes that gym workouts account for only 4% of their day. It shows them how Uncurl: AI Tech tracks their movement efficiency during the remaining 96% of the day to maximize muscle building and fat loss.',
    facts: [
      'PPI™ DRAG < 0.40',
      '96% RECOVERY AUDIT',
      'BIOMECHANICAL FFS™',
      'TRAINER CONNECT',
    ],
  },

  // 6. Healthcare Facilities (Labs, Clinics, Hospitals)
  CLINICAL_LABS: {
    key: 'CLINICAL_LABS',
    segmentNumber: '06',
    name: 'Healthcare Facilities (Labs, Clinics, Hospitals)',
    shortLabel: 'Healthcare Facilities',
    icon: '🧬',
    targetAudience: 'Patients & Preventative Care Cohorts',
    title: '🏟️ THE ARENA: THE CARDIOMETABOLIC WAITING LOUNGE & HABIT WAR ROOM',
    statusTag: 'Secure',
    statusIcon: '🔒',
    theme: {
      canvasBase: '#07111E',
      coreAccent: '#00D4B2',
      secondaryAura: '#0A2540',
      mutedBorders: '#1A334E',
      cardBg: '#0D1D2F',
      textPrimary: '#FFFFFF',
      textSecondary: '#94A3B8',
      badgeBg: 'rgba(0, 212, 178, 0.16)',
      accentGlow: 'rgba(0, 212, 178, 0.3)',
    },
    initialTicker:
      'Nutrition profile updated... Blood chemistry curves normalized.',
    tickerStream: [
      'Nutrition profile updated... Glycemic clearance curves normalized.',
      'Active 90-second movement breaks kept sitting runs near zero today.',
      'Fasting glucose vulnerability slope down 12% across enrolled patients.',
      'Lab biomarker OCR verified: Baseline HbA1c trajectory stabilized.',
    ],
    focusTrackers: [
      {
        title: 'POSI™ RISK RADAR',
        value: '94/100',
        subLabel: 'OPTIMAL SHIELD',
        statusBadge: '🟢 OPTIMAL SHIELD',
        badgeType: 'optimal',
      },
      {
        title: 'S-DEX™ SEDENTARY INDEX',
        value: '0.12',
        subLabel: 'RESET ACTIVE',
        statusBadge: '🚶 RESET ACTIVE',
        badgeType: 'active',
      },
    ],
    standings: {
      title: 'THE PREVENTATIVE HEALTH VAULT: OCR LAB MARKER INTERSECTIONS',
      biomarkerIntersection: {
        gatewayLabel: 'Fasting Blood Glucose Tracking Gateway:',
        trendLabel: 'Current Lifestyle Trend:',
        trendValue: 'REVERSING VULNERABILITY',
        status: 'PROTECTED',
      },
      bannerStatusText:
        'Features "The Preventative Health Vault." It cross-references their OCR-parsed blood work markers with their lifestyle scores. It explains how hitting their upcoming S-DEX™ and nutrition targets acts as a non-drug behavioral therapeutic to safely lower borderline HbA1c and blood pressure lines.',
    },
    actions: [
      {
        id: 'view_menu',
        label: 'View Your Hyper-Personalized 7-Day Menu',
        icon: '📋',
        type: 'menu',
      },
      {
        id: 'refer_clinic',
        label: 'Refer Your Treatment Clinic or Lab Network',
        icon: '🏥',
        type: 'refer',
      },
    ],
    psychologicalHook:
      'Strips away all loud competitive elements, shifting instead to a calm, high-authority medical interface tailored for users joining via labs, diagnostic clinics, or hospitals. Demonstrates non-drug behavioral therapeutics to safely lower borderline HbA1c and blood pressure lines.',
    contentHookTitle: 'The Preventative Health Vault',
    bottomNavTabs: ['Arena', 'Calendar', 'Trends', 'Vault'],
    category: 'Healthcare Facilities',
    tagline: 'THE PREVENTATIVE HEALTH VAULT',
    headline: 'THE CARDIOMETABOLIC WAITING LOUNGE & HABIT WAR ROOM.',
    summary:
      'Features "The Preventative Health Vault." It cross-references their OCR-parsed blood work markers with their lifestyle scores. It explains how hitting their upcoming S-DEX™ and nutrition targets acts as a non-drug behavioral therapeutic to safely lower borderline HbA1c and blood pressure lines.',
    facts: [
      'OCR LAB SYNC',
      'PREVENTATIVE VAULT',
      'POSI™ RISK RADAR',
      'NON-DRUG THERAPEUTIC',
    ],
  },

  // 7. Premium Health & Consumer Retail Outlets
  HEALTH_RETAIL: {
    key: 'HEALTH_RETAIL',
    segmentNumber: '07',
    name: 'Premium Health & Consumer Retail Outlets',
    shortLabel: 'Health Retail',
    icon: '🌿',
    targetAudience: 'Organic Food Shoppers & Clean Nutrition Enthusiasts',
    title: '🌿 THE ARENA: THE CLEAN NUTRITION PANTRY & METABOLIC SHIELD',
    statusTag: 'Tokens: 12',
    statusIcon: '🪙',
    theme: {
      canvasBase: '#0D2619',
      coreAccent: '#F5EBE6',
      secondaryAura: '#A3C9A8',
      mutedBorders: '#1E4D34',
      cardBg: '#143825',
      textPrimary: '#FFFFFF',
      textSecondary: '#D1E7DD',
      badgeBg: 'rgba(163, 201, 168, 0.2)',
      accentGlow: 'rgba(163, 201, 168, 0.3)',
    },
    initialTicker:
      'Glycemic clearance is active. Metabolic fuel curves normalized.',
    tickerStream: [
      'Glycemic clearance is active. Metabolic fuel curves normalized.',
      'Raw Indian food substrates: Sprouted ragi upma balanced blood sugar.',
      'Claimed 10% co-branded partnership voucher at Nature Basket Store.',
      '12 shopping tokens unlocked for organic cold-pressed oil basket.',
    ],
    focusTrackers: [
      {
        title: 'E3™ CALORIC ECONOMY',
        value: '4.1 kcal/km',
        subLabel: 'HIGH MET-EFFICIENCY',
        statusBadge: '🟢 HIGH MET-EFFICIENCY',
        badgeType: 'optimal',
      },
      {
        title: '7-DAY INDIAN MENU ALIGNMENT',
        value: '95/100',
        subLabel: 'UNREFINED SUBSTRATES',
        statusBadge: '🛡️ INFLAM-SHIELD',
        badgeType: 'optimal',
      },
    ],
    standings: {
      title: 'CLEAN NUTRITION FUEL COUNTER: AFFILIATE TOKEN & WALLET',
      rewardPill: {
        code: 'NUTR-ORGANIC-10',
        text: '10% Off Token: Unrefined Ragi/Sprouts Basket Active',
      },
      historyItems: [
        {
          label: 'Active Reward Voucher',
          detail: 'Verified Clean Macro Fuel Voucher (Redeemable)',
          status: 'ACTIVE',
        },
        {
          label: 'Glycemic Stabilization',
          detail: 'Postprandial peak reduced by 22% with millet fuel',
          status: 'CONFIRMED',
        },
      ],
      bannerStatusText:
        'Displays the "Clean Nutrition Fuel Counter." It maps out how raw, unrefined Indian food substrates (like ragi upma, sprouted pulses, and warm turmeric-ashwagandha mixes) balance blood sugar profiles. It rewards users with custom shopping-list tokens they can redeem for healthy items at their local partner store.',
    },
    actions: [
      {
        id: 'open_plan',
        label: 'Open Your Hyper-Personalized 7-Day Menu Plan',
        icon: '🥗',
        type: 'menu',
      },
      {
        id: 'scan_qr',
        label: 'Scan Your In-Store Counter Checkout QR Code',
        icon: '📲',
        type: 'scan',
      },
    ],
    psychologicalHook:
      'Focuses directly on high-quality nutrition. Swapping the stadium emoji for a clean leaf icon, this title appeals to consumers visiting high-end organic stores, highlighting how smart food choices actively protect their metabolic systems.',
    contentHookTitle: 'Clean Nutrition Fuel Counter',
    bottomNavTabs: ['Pantry', 'Nutrition', 'Wallet', 'Profile'],
    category: 'Premium Health & Consumer Retail',
    tagline: 'CLEAN NUTRITION FUEL COUNTER',
    headline: 'THE CLEAN NUTRITION PANTRY & METABOLIC SHIELD.',
    summary:
      'Displays the "Clean Nutrition Fuel Counter." It maps out how raw, unrefined Indian food substrates (like ragi upma, sprouted pulses, and warm turmeric-ashwagandha mixes) balance blood sugar profiles. It rewards users with custom shopping-list tokens they can redeem for healthy items at their local partner store.',
    facts: [
      'MHP: Modified Heart Points',
      '7-DAY INDIAN MENU',
      'QR CHECKOUT 10% TOKEN',
      'CLEAN MACRO FUEL',
    ],
  },
};

export const TOURNAMENT_STAGES: ITournamentBracketStage[] = [
  {
    stageNumber: 1,
    title: '🏢 STAGE 1: QUALIFY-THE BEHAVIORAL FOUNDATION TRACK',
    daysRange: 'DAYS 1–7',
    cutoffText: '25% Knockout Gate (Top 75% Advance)',
    dropPercent: 'Top 75% Advance',
    survivalGate: '25% Knockout Gate (Top 75% Advance).',
    whatWeMeasure:
      'Daily movement volume, exercise intensity, and your defence against physical stagnation [AHA].',
    howScoreCalculated:
      'Blends your aerobic quality (Norm_MHP™), baseline steps (Norm_Steps), and active penalty points for continuous immobility (S-DEX™). Crucially, your scores are derived entirely as a percentage of your demographically calibrated, personalized targets.',
    howToScoreHigh:
      'Focus strictly on hitting 100% of your personalized activity targets. Avoid staying immobile for over 60 minutes [AHA]. When prompted, complete a 90-to-180 second vascular breakout walk (logging a minimum of 60 pocket-sensor paces) [AHA]. This rapid micro-intervention instantly activates your skeletal muscle pumps, forces pooled blood back to your heart, and resets your S-DEX™ stasis counter to zero—instantly maximizing your percentage of target achievement to secure your rank safely above the Axe Line.',
    survivalRules:
      'Focus strictly on hitting 100% of your personalized activity targets. Avoid staying immobile for over 60 minutes [AHA]. When prompted, complete a 90-to-180 second vascular breakout walk (logging a minimum of 60 pocket-sensor paces) [AHA].',
    bracketResetDetails:
      'At the stroke of midnight on Day 7, bottom 25% are eliminated. Remaining 75% advance to Stage 2.',
    accentColor: '#3B82F6',
  },
  {
    stageNumber: 2,
    title: '🧠 STAGE 2: CONQUER-THE AUTONOMIC COST NEXUS',
    daysRange: 'DAYS 8–14',
    cutoffText: '50% Knockout Gate (Top 25% Advance)',
    dropPercent: 'Top 25% Advance',
    survivalGate: '50% Knockout Gate (Top 25% Advance).',
    whatWeMeasure:
      'Your cumulative lifestyle alignment, nervous system recovery, and daily biological clock uniformity [AHA].',
    howScoreCalculated:
      'Your score is the direct summation of your Stage 1 CMAS™ baseline and your Stage 2 BSE™ (Bio-Sync Efficiency) score. Your standing depends entirely on what percentage you achieve of your personalized sleep uniformity targets and your customized functional physical targets.',
    howToScoreHigh:
      'You must try to execute every single customized exercise routine specified for you and hit your personalized circadian sleep windows. Failing to complete your custom routines or experiencing erratic sleep shifts will crash your target achievement percentage and drop your ranking. Actively complete your personalized targets to maximize your cumulative score and qualify for the final week.',
    survivalRules:
      'You must try to execute every single customized exercise routine specified for you and hit your personalized circadian sleep windows to protect your cumulative score.',
    bracketResetDetails:
      '50% Knockout Gate cuts the bottom competitors. Only top 25% cumulative achievers advance to the National Podium.',
    accentColor: '#EC4899',
  },
  {
    stageNumber: 3,
    title: '🏋️ STAGE 3: MASTER-THE FUNCTIONAL RESILIENCE WHEEL FOR NATIONAL PODIUM)',
    daysRange: 'DAYS 15–21',
    cutoffText: 'The Final Battle (Remaining 25% Compete)',
    dropPercent: 'Podium 1st / 2nd / 3rd',
    survivalGate: 'The Final Battle (Only the remaining 25% compete for the crown).',
    whatWeMeasure:
      'Your complete body resilience, structural health adoption tracking, and long-term biological longevity.',
    howScoreCalculated:
      'Computes your master BARI™ (Bio-Age Resilience Index) Score by blending your Stage 1 cardio, Stage 2 sleep data, and active muscle logs relative to your personal targets. In this final week, your data-driven compliance with both your personalized nutrition and specialized physical plans is woven directly into the scoring core.',
    howToScoreHigh:
      'To secure the championship, you must comply as closely as possible with your hyper-personalized exercise prescriptions, customized nutrition choices, and exact meal substrates provided to you. This final gauntlet is strategically designed to help you internalize permanent, lifelong behavioural habits. By seamlessly adopting these protocols, you lock down long-term immunity against chronic lifestyle diseases, dramatically elevate your daily energy, and achieve the ultimate quality of life (QOL).',
    survivalRules:
      'Comply as closely as possible with your hyper-personalized exercise prescriptions, customized nutrition choices, and exact meal substrates.',
    bracketResetDetails:
      'Podium ceremony awards Top 3 National Trophies, certified medical longevity credentials, and perpetual leaderboard induction.',
    accentColor: '#F59E0B',
  },
];

export const METRIC_STRATEGIES: IMetricStrategyItem[] = [
  {
    id: 'mhp',
    code: 'MHP™',
    name: 'Modified Heart Points',
    target: 'Target: 150+ pts/week (>129 steps/min)',
    simpleRule:
      'Awards double points for brisk cadence blocks (>129 steps/min) that induce cardiovascular adaptation.',
    actionStrategy:
      'Dedicate one 15-minute brisk walk daily where cadence stays consistently above 129 steps per minute.',
    accentColor: '#FF0055',
    category: 'cardiovascular',
  },
  {
    id: 's-dex',
    code: 'S-DEX™',
    name: 'Sedentary Drag Index',
    target: 'Target: 0.00 (Zero Continuous Stasis)',
    simpleRule:
      'If you sit still at your desk for 60 minutes, your score drops. Taking 60 steps in 90 seconds resets your sitting run back to 0 instantly.',
    actionStrategy:
      'Set the 90 second radar break. Place your smartphone in your pocket or hold it in your hand and take a quick walk to grab a glass of water, print a document, or step down a corridor, if possible. This easily hits the 60-step, 90-second target and will reset your S-DEX™ stasis counter back to zero, clear lower-limb blood pooling, release arterial nitric oxide, and instantly protect your leaderboard rank.',
    accentColor: '#00E5FF',
    category: 'metabolic',
  },
  {
    id: 'e3',
    code: 'E3™',
    name: 'Energy Expenditure Economy',
    target: 'Target: 3.5 - 4.2 kcal/km',
    simpleRule:
      'Calculates mechanical caloric economy per distance traveled, optimizing fat-burn efficiency.',
    actionStrategy:
      'Avoid slouching. An upright spine and light ground strike improve walking economy by 18%.',
    accentColor: '#38BDF8',
    category: 'metabolic',
  },
];

export const MOCK_CALIBRATION_PROFILE: IBiophysicalCalibrationProfile = {
  cadenceVelocity: '118 steps/min',
  restingStrideLength: '74 cm',
  sedentaryDropRate: '0.04 pts/hr',
  auditScore: '94 / 100',
  status: 'OPTIMAL SENSOR LOCK',
};

export const MANDATORY_MEDICAL_DISCLAIMER =
  'The information, including but not limited to, text, graphics, images, nutritional recommendations, exercise targets, and other material generated or contained within the UNCURL: Health platform, is for informational and educational purposes only. This digital platform serves to promote healthy behavioral and lifestyle modifications and does not constitute medical advice, definitive diagnosis, clinical treatment protocols, or specialized prescription for infants, minors, or chronic pathological conditions. No material generated by the PySpark analytical processing core is intended to serve as a substitute for professional medical advice, evaluation, or direct supervision by a qualified healthcare provider, licensed physician, or accredited dietitian. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a physical injury, cardiovascular strain, metabolic anomaly, or underlying medical condition before undertaking a new dietary regime or physical fitness schedule. Never disregard professional medical advice or delay in seeking it because of automated tracking metrics displayed on your mobile interface viewport.';
