import { StyleSheet } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';

const facultyStudentView = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
  },
  innerContainer: {
    padding: sw(10),
    paddingBottom: sh(40),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: sh(12),
    fontSize: sf(16),
    color: '#64748b',
  },
  errorText: {
    fontSize: sf(16),
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: sh(16),
    paddingHorizontal: sw(32),
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: sw(24),
    paddingVertical: sh(12),
    borderRadius: sw(8),
  },
  retryButtonText: {
    color: 'white',
    fontSize: sf(16),
    fontWeight: '600',
  },
  header: {
    position: 'relative',
    zIndex: 100,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sw(16),
    borderRadius: sw(12),
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: sh(24),
    backgroundColor: 'white',
    marginHorizontal: sw(16),
    marginTop: sh(16),
    borderRadius: sw(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.1,
    shadowRadius: sw(8),
    elevation: 4,
  },
  profileImageContainer: {
    width: sw(100),
    height: sw(100),
    borderRadius: sw(50),
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: sh(12),
    borderWidth: 3,
    borderColor: '#3b82f6',
  },
  profileImage: {
    width: sw(94),
    height: sw(94),
    borderRadius: sw(47),
  },
  studentName: {
    fontSize: sf(24),
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: sh(4),
  },
  studentRole: {
    fontSize: sf(16),
    color: '#64748b',
  },
  section: {
    backgroundColor: 'white',
    marginTop: sh(16),
    padding: sw(20),
    borderRadius: sw(16),
    elevation: 4,
  },
  sectionTitle: {
    fontSize: sf(20),
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: sh(16),
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: sh(16),
  },
  infoLabel: {
    fontSize: sf(14),
    color: '#64748b',
    marginBottom: sh(4),
  },
  infoValue: {
    fontSize: sf(16),
    fontWeight: '600',
    color: '#1e293b',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sh(16),
  },
  statCard: {
    backgroundColor: '#f1f5f9',
    padding: sw(10),
    borderRadius: sw(12),
    alignItems: 'center',
    marginHorizontal: sw(2),
  },
  statNumber: {
    fontSize: sf(20),
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: sh(4),
  },
  statLabel: {
    fontSize: sf(12),
    color: '#64748b',
    textAlign: 'center',
  },
  miscueCard: {
    backgroundColor: '#fef2f2',
    padding: sw(16),
    borderRadius: sw(12),
    marginTop: sh(12),
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  miscueTitle: {
    fontSize: sf(16),
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: sh(8),
  },
  miscuePassage: {
    fontSize: sf(14),
    color: '#1e293b',
    marginBottom: sh(8),
  },
  miscueStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miscueStat: {
    fontSize: sf(14),
    color: '#64748b',
  },
  miscueStatValue: {
    fontWeight: '600',
    color: '#1e293b',
  },
  wordList: {
    marginTop: sh(8),
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: sh(6),
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
  },
  wordText: {
    fontSize: sf(14),
    color: '#1e293b',
    fontStyle: 'italic',
  },
  wordCount: {
    fontSize: sf(12),
    color: '#64748b',
  },
  chartContainer: {
    marginBottom: sh(24),
  },
  chartSubtitle: {
    fontSize: sf(16),
    fontWeight: '600',
    color: '#475569',
    marginBottom: sh(12),
  },
  chartWrapper: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: sw(12),
    padding: sw(16),
    minHeight: sw(160),
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: sw(8),
    height: sw(120),
  },
  yAxisLabel: {
    fontSize: sf(10),
    color: '#94a3b8',
    fontWeight: '500',
  },
  chartScroll: {
    flex: 1,
  },
  chartBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: sw(120),
    paddingHorizontal: sw(4),
  },
  chartBarWrapper: {
    alignItems: 'center',
    marginHorizontal: sw(6),
  },
  chartBarColumn: {
    alignItems: 'center',
    position: 'relative',
  },
  chartValue: {
    fontSize: sf(11),
    fontWeight: '700',
    marginBottom: sh(4),
  },
  chartBar: {
    width: sw(16),
    borderTopLeftRadius: sw(8),
    borderTopRightRadius: sw(8),
    minHeight: sw(4),
  },
  chartConnector: {
    position: 'absolute',
    top: '55%',
    right: sw(-6),
    width: sw(12),
    height: sw(2),
    opacity: 0.4,
  },
  chartLabel: {
    fontSize: sf(10),
    color: '#64748b',
    textAlign: 'center',
  },
  wpmChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: sw(100),
    paddingHorizontal: sw(10),
    marginTop: sh(10),
  },

  wpmBar: {
    width: sw(20),
    backgroundColor: '#10b981',
    borderTopLeftRadius: sw(4),
    borderTopRightRadius: sw(4),
    marginBottom: sh(4),
  },

  statsSummaryContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: sw(12),
    padding: sw(16),
    marginTop: sh(10),
  },

  statsSummaryTitle: {
    fontSize: sf(16),
    fontWeight: '600',
    color: '#475569',
    marginBottom: sh(16),
  },

  statBox: {
    alignItems: 'center',
    flex: 1,
    padding: sw(12),
    backgroundColor: 'white',
    borderRadius: sw(8),
    marginHorizontal: sw(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.05,
    shadowRadius: sw(2),
    elevation: 1,
  },

  statBoxNumber: {
    fontSize: sf(20),
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: sh(4),
  },

  statBoxLabel: {
    fontSize: sf(12),
    color: '#64748b',
    textAlign: 'center',
  },

  trendContainer: {
    backgroundColor: 'white',
    borderRadius: sw(8),
    padding: sw(12),
  },

  trendTitle: {
    fontSize: sf(14),
    fontWeight: '600',
    color: '#475569',
    marginBottom: sh(8),
  },

  trendIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  trendText: {
    fontSize: sf(14),
    color: '#64748b',
  },

  trendArrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trendUp: {
    fontSize: sf(20),
    marginRight: sw(6),
  },

  trendUpText: {
    fontSize: sf(14),
    color: '#10b981',
    fontWeight: '600',
  },

  trendDown: {
    fontSize: sf(20),
    marginRight: sw(6),
  },

  trendDownText: {
    fontSize: sf(14),
    color: '#ef4444',
    fontWeight: '600',
  },

  trendNeutral: {
    fontSize: sf(20),
    marginRight: sw(6),
  },

  trendNeutralText: {
    fontSize: sf(14),
    color: '#f59e0b',
    fontWeight: '600',
  },
  // WPM Chart styles
  wpmBarWrapper: {
    alignItems: 'center',
    marginHorizontal: sw(4),
  },
  wpmValue: {
    fontSize: sf(11),
    fontWeight: '600',
    color: '#065f46',
    marginBottom: sh(4),
  },
  wpmLabel: {
    fontSize: sf(10),
    color: '#64748b',
    textAlign: 'center',
  },
  // Performance Summary styles
  summaryContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: sw(12),
    padding: sw(16),
    marginTop: sh(16),
  },
  summaryTitle: {
    fontSize: sf(16),
    fontWeight: '600',
    color: '#475569',
    marginBottom: sh(16),
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sh(16),
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: sw(12),
    borderRadius: sw(8),
    alignItems: 'center',
    marginHorizontal: sw(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.05,
    shadowRadius: sw(2),
    elevation: 1,
  },
  summaryNumber: {
    fontSize: sf(20),
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: sh(4),
  },
  summaryLabel: {
    fontSize: sf(12),
    color: '#64748b',
    textAlign: 'center',
  },
  trendContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendEmoji: {
    fontSize: sf(20),
    marginRight: sw(6),
  },

  // Refresh Button
  refreshButton: {
    backgroundColor: '#3b82f6',
    marginHorizontal: sw(16),
    marginVertical: sh(24),
    paddingVertical: sh(16),
    borderRadius: sw(12),
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.2,
    shadowRadius: sw(8),
    elevation: 4,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: sf(16),
    fontWeight: '600',
  },

  noDataText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: sh(16),
  },

  summarySubtext: {
    fontSize: sf(10),
    color: '#64748b',
    marginTop: sh(2),
  },

  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sh(8),
  },

  trendLabel: {
    fontSize: sf(14),
    color: '#475569',
    fontWeight: '500',
  },

  trendValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trendValue: {
    fontSize: sf(14),
    color: '#1e293b',
  },

  positiveTrend: {
    color: '#10b981',
    fontWeight: '600',
    marginLeft: sw(4),
  },

  negativeTrend: {
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: sw(4),
  },

  overallTrendContainer: {
    marginTop: sh(12),
    paddingTop: sh(12),
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },

  overallTrendLabel: {
    fontSize: sf(14),
    fontWeight: '600',
    color: '#475569',
    marginBottom: sh(8),
  },
  headerTitle: {
    fontSize: sf(18),
    fontWeight: '700',
    color: '#1e293b',
  },
  studentMeta: {
    fontSize: sf(14),
    color: '#64748b',
  },
});

export default facultyStudentView;
