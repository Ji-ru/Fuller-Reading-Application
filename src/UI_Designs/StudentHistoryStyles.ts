import { StyleSheet } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';

const C = {
  bg: '#ECFBFF',
  primary: '#1B5E20',
  primaryLight: '#81C784',
  tabBg: '#c0e8f2',
  accent: '#38B6FF',
  card: '#FFFFFF',
  ink: '#1B2B22',
  inkLight: '#6B8E6B',
  border: '#E5E7EB',
  inputBg: '#F3F8FF',
  green: '#2CA96A',
  greenBg: '#D4F1E8',
};

const historyStyles = StyleSheet.create({
  // ==========================================
  // BASE CONTAINER & LAYOUT
  // ==========================================
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  insideContainer: {
    flex: 1,
    position: 'relative',
    paddingTop: sh(10),
    padding: sw(5),
    zIndex: 1,
  },

  // ==========================================
  // TITLE SECTION
  // ==========================================
  titleContainer: {
    alignItems: 'center',
    marginTop: sh(4),
    marginBottom: sh(8),
  },

  // ==========================================
  // SUMMARY STATS BAR
  // ==========================================
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: sw(16),
    marginBottom: sh(16),
    backgroundColor: C.card,
    borderRadius: sw(16),
    paddingVertical: sh(14),
    paddingHorizontal: sw(10),
    elevation: 3,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: sw(3) },
    shadowOpacity: 0.10,
    shadowRadius: sw(8),
    borderWidth: 2,
    borderColor: C.green,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: sf(22),
    fontFamily: 'Nunito-Bold',
    color: C.primary,
  },
  statLabel: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
    marginTop: sh(2),
  },
  statDivider: {
    width: 1,
    backgroundColor: C.border,
    marginVertical: sh(4),
  },

  // ==========================================
  // CONTENT AREA
  // ==========================================
  contentContainer: {
    flex: 1,
    paddingHorizontal: sw(16),
  },
  sectionLabel: {
    fontSize: sf(16),
    fontFamily: 'Nunito-Bold',
    color: C.primary,
    marginBottom: sh(12),
  },

  // ==========================================
  // PASSAGE CARD (Accordion Header)
  // ==========================================
  passageCard: {
    backgroundColor: C.card,
    borderRadius: sw(16),
    marginBottom: sh(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.08,
    shadowRadius: sw(8),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  passageCardExpanded: {
    borderColor: C.green,
  },
  passageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sw(14),
  },
  passageIconContainer: {
    width: sw(48),
    height: sw(48),
    borderRadius: sw(24),
    backgroundColor: C.tabBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: sw(12),
  },
  passageIconText: {
    fontSize: sf(22),
  },
  passageInfo: {
    flex: 1,
  },
  passageTitle: {
    fontSize: sf(15),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
    marginBottom: sh(3),
  },
  passageAttempts: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },
  passageArrowContainer: {
    width: sw(32),
    height: sw(32),
    borderRadius: sw(16),
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: sw(8),
  },
  passageArrow: {
    fontSize: sf(14),
    color: C.primary,
    fontFamily: 'Nunito-Bold',
  },

  // ==========================================
  // REPORT CARD (Expanded content)
  // ==========================================
  reportsContainer: {
    paddingHorizontal: sw(12),
    paddingBottom: sh(12),
  },
  reportCard: {
    backgroundColor: C.inputBg,
    borderRadius: sw(14),
    padding: sw(14),
    marginBottom: sh(10),
    borderWidth: 1,
    borderColor: C.primaryLight,
  },
  reportDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh(10),
  },
  reportDateIcon: {
    fontSize: sf(14),
    marginRight: sw(6),
  },
  reportDate: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: C.primary,
    flex: 1,
  },
  reportAttemptBadge: {
    backgroundColor: C.primary,
    borderRadius: sw(10),
    paddingHorizontal: sw(10),
    paddingVertical: sh(2),
  },
  reportAttemptText: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },

  // ==========================================
  // METRICS GRID
  // ==========================================
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sw(8),
    marginBottom: sh(10),
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: C.card,
    borderRadius: sw(12),
    padding: sw(10),
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.05,
    shadowRadius: sw(3),
    borderWidth: 1,
    borderColor: C.primaryLight,
  },
  metricIcon: {
    fontSize: sf(20),
    marginBottom: sh(4),
  },
  metricValue: {
    fontSize: sf(16),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
  },
  metricLabel: {
    fontSize: sf(10),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
    marginTop: sh(2),
    textAlign: 'center',
  },

  // ==========================================
  // MISCUE DETAILS SECTION
  // ==========================================
  miscueSection: {
    borderTopWidth: 1,
    borderTopColor: C.primaryLight,
    paddingTop: sh(10),
    marginTop: sh(4),
  },
  miscueSectionTitle: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: '#374151',
    marginBottom: sh(8),
  },
  miscueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: sh(6),
    backgroundColor: C.card,
    borderRadius: sw(10),
    padding: sw(10),
    borderWidth: 1,
    borderColor: C.primaryLight,
  },
  miscueTag: {
    borderRadius: sw(8),
    paddingHorizontal: sw(8),
    paddingVertical: sh(3),
    marginRight: sw(8),
    minWidth: sw(85),
    alignItems: 'center',
  },
  miscueTagSubstitution: { backgroundColor: '#FEF3C7' },
  miscueTagOmission:     { backgroundColor: '#FDE2E2' },
  miscueTagInsertion:    { backgroundColor: '#D1FAE5' },
  miscueTagRepetition:   { backgroundColor: '#E0E7FF' },
  miscueTagText: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  miscueDetail: {
    flex: 1,
    fontSize: sf(12),
    fontFamily: 'Nunito-Regular',
    color: C.inkLight,
    lineHeight: sf(18),
  },

  // ==========================================
  // PERFECT READING BADGE
  // ==========================================
  perfectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.greenBg,
    borderRadius: sw(12),
    padding: sw(12),
    marginTop: sh(4),
  },
  perfectIcon: {
    fontSize: sf(20),
    marginRight: sw(8),
  },
  perfectText: {
    flex: 1,
    flexShrink: 1,
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: C.green,
  },

  // ==========================================
  // LOADING STATE
  // ==========================================
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: sh(14),
    fontSize: sf(15),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },

  // ==========================================
  // EMPTY / FALLBACK STATE
  // ==========================================
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: sw(40),
  },
  emptyIconContainer: {
    width: sw(120),
    height: sw(120),
    borderRadius: sw(60),
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: sh(24),
  },
  emptyIcon: {
    fontSize: sf(52),
  },
  emptyTitle: {
    fontSize: sf(20),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
    marginBottom: sh(10),
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: sf(14),
    fontFamily: 'Nunito-Regular',
    color: C.inkLight,
    textAlign: 'center',
    lineHeight: sf(22),
    marginBottom: sh(28),
  },
  emptyButton: {
    backgroundColor: C.primary,
    borderRadius: sw(14),
    paddingVertical: sh(14),
    paddingHorizontal: sw(32),
    elevation: 4,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.3,
    shadowRadius: sw(8),
  },
  emptyButtonText: {
    fontSize: sf(15),
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },

  // ==========================================
  // SCROLL AREA
  // ==========================================
  scrollContent: {
    paddingBottom: sh(30),
  },
  nestedScroll: {
    maxHeight: sh(420),
  },
  viewMoreText: {
    textAlign: 'center',
    fontSize: sf(12),
    fontFamily: 'Nunito-Medium',
    color: C.primary,
    marginTop: sh(6),
    marginBottom: sh(4),
  },
});

export default historyStyles;
