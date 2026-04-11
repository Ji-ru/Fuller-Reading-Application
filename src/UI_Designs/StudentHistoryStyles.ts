import { StyleSheet } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';

const historyStyles = StyleSheet.create({
  // ==========================================
  // BASE CONTAINER & LAYOUT
  // ==========================================
  container: {
    flex: 1,
    backgroundColor: '#ECFBFF',
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
    backgroundColor: '#FFFFFF',
    borderRadius: sw(16),
    paddingVertical: sh(14),
    paddingHorizontal: sw(10),
    elevation: 3,
    shadowColor: '#3B7FC9',
    shadowOffset: { width: 0, height: sw(3) },
    shadowOpacity: 0.10,
    shadowRadius: sw(8),
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: sf(22),
    fontFamily: 'Comfortaa-Bold',
    color: '#3B7FC9',
  },
  statLabel: {
    fontSize: sf(11),
    fontFamily: 'Comfortaa-Medium',
    color: '#6B7280',
    marginTop: sh(2),
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
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
    fontFamily: 'Comfortaa-Bold',
    color: '#3B7FC9',
    marginBottom: sh(12),
  },

  // ==========================================
  // PASSAGE CARD (Accordion Header)
  // ==========================================
  passageCard: {
    backgroundColor: '#FFFFFF',
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
    borderColor: '#3B7FC9',
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
    backgroundColor: '#bcdcff',
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
    fontFamily: 'Comfortaa-Bold',
    color: '#1F2937',
    marginBottom: sh(3),
  },
  passageAttempts: {
    fontSize: sf(12),
    fontFamily: 'Comfortaa-Medium',
    color: '#6B7280',
  },
  passageArrowContainer: {
    width: sw(32),
    height: sw(32),
    borderRadius: sw(16),
    backgroundColor: '#bcdcff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: sw(8),
  },
  passageArrow: {
    fontSize: sf(14),
    color: '#3B7FC9',
    fontFamily: 'Comfortaa-Bold',
  },

  // ==========================================
  // REPORT CARD (Expanded content)
  // ==========================================
  reportsContainer: {
    paddingHorizontal: sw(12),
    paddingBottom: sh(12),
  },
  reportCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: sw(14),
    padding: sw(14),
    marginBottom: sh(10),
    borderWidth: 1,
    borderColor: '#E0ECFA',
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
    fontFamily: 'Comfortaa-Bold',
    color: '#3B7FC9',
    flex: 1,
  },
  reportAttemptBadge: {
    backgroundColor: '#3B7FC9',
    borderRadius: sw(10),
    paddingHorizontal: sw(10),
    paddingVertical: sh(2),
  },
  reportAttemptText: {
    fontSize: sf(11),
    fontFamily: 'Comfortaa-Bold',
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
    backgroundColor: '#FFFFFF',
    borderRadius: sw(12),
    padding: sw(10),
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.05,
    shadowRadius: sw(3),
    borderWidth: 1,
    borderColor: '#F0F4FA',
  },
  metricIcon: {
    fontSize: sf(20),
    marginBottom: sh(4),
  },
  metricValue: {
    fontSize: sf(16),
    fontFamily: 'Comfortaa-Bold',
    color: '#1F2937',
  },
  metricLabel: {
    fontSize: sf(10),
    fontFamily: 'Comfortaa-Medium',
    color: '#6B7280',
    marginTop: sh(2),
    textAlign: 'center',
  },

  // ==========================================
  // MISCUE DETAILS SECTION
  // ==========================================
  miscueSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0ECFA',
    paddingTop: sh(10),
    marginTop: sh(4),
  },
  miscueSectionTitle: {
    fontSize: sf(13),
    fontFamily: 'Comfortaa-Bold',
    color: '#374151',
    marginBottom: sh(8),
  },
  miscueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: sh(6),
    backgroundColor: '#FFFFFF',
    borderRadius: sw(10),
    padding: sw(10),
    borderWidth: 1,
    borderColor: '#F0F4FA',
  },
  miscueTag: {
    borderRadius: sw(8),
    paddingHorizontal: sw(8),
    paddingVertical: sh(3),
    marginRight: sw(8),
    minWidth: sw(85),
    alignItems: 'center',
  },
  miscueTagSubstitution: {
    backgroundColor: '#FEF3C7',
  },
  miscueTagOmission: {
    backgroundColor: '#FDE2E2',
  },
  miscueTagInsertion: {
    backgroundColor: '#D1FAE5',
  },
  miscueTagRepetition: {
    backgroundColor: '#E0E7FF',
  },
  miscueTagText: {
    fontSize: sf(11),
    fontFamily: 'Comfortaa-Bold',
    color: '#374151',
  },
  miscueDetail: {
    flex: 1,
    fontSize: sf(12),
    fontFamily: 'Comfortaa-Regular',
    color: '#6B7280',
    lineHeight: sf(18),
  },

  // ==========================================
  // PERFECT READING BADGE
  // ==========================================
  perfectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4F1E8',
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
    fontFamily: 'Comfortaa-Bold',
    color: '#2CA96A',
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
    fontFamily: 'Comfortaa-Medium',
    color: '#6B7280',
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
    backgroundColor: '#E0ECFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: sh(24),
  },
  emptyIcon: {
    fontSize: sf(52),
  },
  emptyTitle: {
    fontSize: sf(20),
    fontFamily: 'Comfortaa-Bold',
    color: '#1F2937',
    marginBottom: sh(10),
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: sf(14),
    fontFamily: 'Comfortaa-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: sf(22),
    marginBottom: sh(28),
  },
  emptyButton: {
    backgroundColor: '#3B7FC9',
    borderRadius: sw(14),
    paddingVertical: sh(14),
    paddingHorizontal: sw(32),
    elevation: 4,
    shadowColor: '#3B7FC9',
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.3,
    shadowRadius: sw(8),
  },
  emptyButtonText: {
    fontSize: sf(15),
    fontFamily: 'Comfortaa-Bold',
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
    fontFamily: 'Comfortaa-Medium',
    color: '#3B7FC9',
    marginTop: sh(6),
    marginBottom: sh(4),
  },
});

export default historyStyles;
