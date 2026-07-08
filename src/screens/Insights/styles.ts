import { ScaledSheet } from 'react-native-size-matters';

export const styles = ScaledSheet.create({
  emptyChartContainer: {
    padding: '20@ms',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  emptyChartIconContainer: {
    width: '48@ms',
    height: '48@ms',
    borderRadius: '24@ms',
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '8@ms',
  },
  emptyChartIcon: {
    fontSize: '20@ms',
  },
  emptyChartTitle: {
    fontSize: '12@ms',
    color: '#94A3B8',
    fontWeight: '600',
  },
  scrollIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: '12@ms',
    marginBottom: '4@ms',
  },
  scrollIndicatorText: {
    fontSize: '9@ms',
    color: '#94A3B8',
    fontWeight: '600',
  },
  scrollIndicatorArrow: {
    fontSize: '9@ms',
    color: '#94A3B8',
    marginLeft: '2@ms',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16@ms',
    padding: '16@ms',
    marginBottom: '16@ms',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  performanceCard: {
    // optional specific style
  },
  efficiencyCard: {
    // optional specific style
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '12@ms',
  },
  cardIconContainer: {
    width: '32@ms',
    height: '32@ms',
    borderRadius: '8@ms',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '10@ms',
  },
  cardTitle: {
    fontSize: '15@ms',
    fontWeight: '700',
    color: '#0F172A',
  },
  speedometerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '12@ms',
  },
  speedometerCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: '12@ms',
    padding: '12@ms',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  speedometerLabel: {
    fontSize: '10@ms',
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: '8@ms',
  },
  speedometerValueLabel: {
    fontSize: '18@ms',
    fontWeight: '800',
    color: '#0F172A',
    marginTop: '4@ms',
  },
  legendContainer: {
    marginTop: '10@ms',
    alignSelf: 'stretch',
  },
  legendRows: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '4@ms',
  },
  legendDot: {
    width: '6@ms',
    height: '6@ms',
    borderRadius: '3@ms',
    marginRight: '6@ms',
  },
  legendText: {
    fontSize: '8.5@ms',
    color: '#64748B',
    fontWeight: '500',
  },
  stepsCard: {
    // optional steps specific styles
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: '10@ms',
  },
  caption: {
    fontSize: '10.5@ms',
    color: '#94A3B8',
    marginTop: '6@ms',
    textAlign: 'center',
    fontWeight: '500',
  },
  summaryMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '8@ms',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: '8@ms',
  },
  summaryMetricTarget: {
    fontSize: '10@ms',
    fontWeight: '600',
    color: '#64748B',
  },
  summaryMetricActual: {
    fontSize: '10@ms',
    fontWeight: '600',
    color: '#64748B',
  },
  summaryMetricPerformance: {
    fontSize: '10@ms',
    fontWeight: '700',
    color: '#10B981',
  },
  heartPointsCard: {
    //
  },
  sectionTitle: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '8@ms',
  },
  sdexCard: {
    //
  },
  insightContainer: {
    backgroundColor: 'rgba(14, 165, 233, 0.04)',
    borderRadius: '10@ms',
    padding: '12@ms',
    marginTop: '8@ms',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.08)',
  },
  insightItem: {
    //
  },
  insightText: {
    fontSize: '12@ms',
    lineHeight: '18@ms',
    fontWeight: '500',
  },
  donutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '16@ms',
    marginTop: '10@ms',
  },
  donutChartWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutScoreContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  trafficLightDot: {
    width: '6@ms',
    height: '6@ms',
    borderRadius: '3@ms',
    marginRight: '4@ms',
    alignSelf: 'center',
  },
  donutScoreValue: {
    fontSize: '22@ms',
    fontWeight: '800',
    color: '#0F172A',
  },
  donutScorePercent: {
    fontSize: '11@ms',
    fontWeight: '600',
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: '8@ms',
    paddingVertical: '4@ms',
    borderRadius: '6@ms',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: '9.5@ms',
    fontWeight: '800',
  },
  cardSub: {
    fontSize: '11.5@ms',
    color: '#64748B',
    lineHeight: '16@ms',
  },
  pillarCardContent: {
    gap: '12@ms',
  },
  pillarRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4@ms',
  },
  pillarLabel: {
    fontSize: '11.5@ms',
    fontWeight: '600',
    color: '#334155',
  },
  pillarValue: {
    fontSize: '11.5@ms',
    fontWeight: '700',
  },
  pillarProgressBackground: {
    width: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: '6@ms',
    overflow: 'hidden',
  },
  pillarProgressFill: {
    borderRadius: '6@ms',
  },
  pillarHealthText: {
    fontSize: '12@ms',
    fontWeight: '700',
    color: '#334155',
    marginTop: '8@ms',
    textAlign: 'right',
  },
  circadianCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
    borderRadius: '10@ms',
    padding: '12@ms',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.08)',
  },
  circadianTitle: {
    fontSize: '10.5@ms',
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.5,
    marginBottom: '4@ms',
  },
  circadianDescription: {
    fontSize: '11.5@ms',
    color: '#B91C1C',
    lineHeight: '16@ms',
    fontWeight: '500',
  },
  stackedChartContainer: {
    flexDirection: 'row',
    height: '200@ms',
    marginTop: '10@ms',
  },
  yAxis: {
    justifyContent: 'space-between',
    height: '160@ms',
    paddingBottom: '15@ms',
    width: '28@ms',
  },
  yAxisLabel: {
    fontSize: '7.5@ms',
    color: '#64748B',
    textAlign: 'right',
  },
  stackedChartWrapper: {
    flex: 1,
    position: 'relative',
  },
  scrollIndicatorAbsolute: {
    position: 'absolute',
    top: 0,
    right: '10@ms',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  dayColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  trendTopText: {
    fontSize: '7.5@ms',
    fontWeight: '700',
    color: '#10B981',
    marginBottom: '4@ms',
  },
  barWrapper: {
    width: '14@ms',
    height: '160@ms',
    backgroundColor: '#F1F5F9',
    justifyContent: 'flex-end',
  },
  stackPiece: {
    width: '100%',
  },
  dayLabel: {
    fontSize: '9.5@ms',
    color: '#64748B',
    marginTop: '6@ms',
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: '12@ms',
    marginTop: '10@ms',
  },
  consistencyGuideTitle: {
    fontSize: '10.5@ms',
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginTop: '16@ms',
    marginBottom: '8@ms',
  },
  consistencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '12@ms',
  },
  consistencyIconBox: {
    width: '28@ms',
    height: '28@ms',
    borderRadius: '6@ms',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '10@ms',
  },
  consistencyIconText: {
    fontSize: '11@ms',
    fontWeight: '800',
  },
  consistencyInfo: {
    flex: 1,
  },
  consistencyLabel: {
    fontSize: '11.5@ms',
    fontWeight: '700',
    color: '#334155',
  },
  consistencyDescription: {
    fontSize: '9.5@ms',
    color: '#64748B',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '16@ms',
    backgroundColor: '#F8FAFC',
    borderRadius: '12@ms',
    padding: '12@ms',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  metricValue: {
    fontSize: '14@ms',
    fontWeight: '800',
    color: '#0F172A',
  },
  metricArrow: {
    fontSize: '9@ms',
    color: '#10B981',
    marginVertical: '2@ms',
  },
  metricArrowDown: {
    color: '#EF4444',
  },
  metricLabel: {
    fontSize: '8.5@ms',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metricItemLast: {
    borderRightWidth: 0,
  },
  recommendationContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.04)',
    borderRadius: '10@ms',
    padding: '12@ms',
    marginTop: '8@ms',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.08)',
  },
  recommendationText: {
    color: '#4F46E5',
    lineHeight: '18@ms',
  },
});
