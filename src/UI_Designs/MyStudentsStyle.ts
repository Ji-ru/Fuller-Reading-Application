import { StyleSheet } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';

const myStudents = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  insideContainer: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    paddingHorizontal: sw(16),
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: sw(20),
  },
  loadingText: {
    marginTop: sh(16),
    fontSize: sf(16),
    color: '#666',
    fontFamily: 'Satoshi-Medium',
  },

  // CLASS INFO HEADER
  classInfoHeader: {
    backgroundColor: '#fff',
    borderRadius: sw(16),
    padding: sw(20),
    marginTop: sh(16),
    marginBottom: sh(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.05,
    shadowRadius: sw(8),
  },
  classInfoMain: {
    gap: sh(12),
  },
  className: {
    fontSize: sf(24),
    fontFamily: 'Satoshi-Bold',
    color: '#1A1A1A',
    lineHeight: sf(30),
  },
  classMetaRow: {
    flexDirection: 'row',
    gap: sw(16),
    flexWrap: 'wrap',
  },
  classMetaItem: {
    gap: sh(4),
  },
  classMetaLabel: {
    fontSize: sf(12),
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  classMetaValue: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
  },

  // SEARCH BAR
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: sw(12),
    paddingHorizontal: sw(16),
    paddingVertical: sh(12),
    marginBottom: sh(16),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.03,
    shadowRadius: sw(4),
  },
  searchIcon: {
    width: sw(20),
    height: sw(20),
    tintColor: '#9CA3AF',
    marginRight: sw(12),
  },
  searchInput: {
    flex: 1,
    fontSize: sf(16),
    fontFamily: 'Satoshi-Medium',
    color: '#1F2937',
    padding: 0,
  },
  clearButton: {
    fontSize: sf(20),
    color: '#9CA3AF',
    paddingHorizontal: sw(8),
  },

  // STUDENT COUNT
  studentCountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: sh(12),
    gap: sw(6),
  },
  studentCount: {
    fontSize: sf(16),
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
  },
  studentCountSubtext: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Medium',
    color: '#9CA3AF',
  },

  // STUDENT CARDS
  studentListWrapper: {
    flex: 1,
  },
  listContent: {
    paddingBottom: sh(24),
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: sw(14),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.06,
    shadowRadius: sw(8),
    overflow: 'hidden',
  },
  studentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sw(16),
  },
  profileImage: {
    width: sw(56),
    height: sw(56),
    borderRadius: sw(28),
    backgroundColor: '#E5E7EB',
  },
  defaultProfile: {
    width: sw(56),
    height: sw(56),
    borderRadius: sw(28),
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultProfileText: {
    color: '#fff',
    fontSize: sf(20),
    fontFamily: 'Satoshi-Bold',
  },
  studentInfo: {
    flex: 1,
    marginLeft: sw(16),
    gap: sh(8),
  },
  studentName: {
    fontSize: sf(18),
    fontFamily: 'Satoshi-Bold',
    color: '#1F2937',
    lineHeight: sf(22),
  },
  detailsRow: {
    flexDirection: 'row',
    gap: sw(8),
    flexWrap: 'wrap',
  },
  detailChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: sw(10),
    paddingVertical: sh(4),
    borderRadius: sw(8),
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(4),
  },
  detailLabel: {
    fontSize: sf(11),
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: sf(12),
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
  },
  arrowContainer: {
    width: sw(32),
    height: sw(32),
    borderRadius: sw(16),
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: sw(8),
  },
  arrowIcon: {
    fontSize: sf(24),
    color: '#4CAF50',
    fontFamily: 'Satoshi-Bold',
  },

  // EMPTY STATE
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: sh(80),
    paddingHorizontal: sw(40),
  },
  emptyIcon: {
    fontSize: sf(64),
    marginBottom: sh(16),
  },
  emptyTitle: {
    fontSize: sf(20),
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
    marginBottom: sh(8),
    textAlign: 'center',
  },
  emptyText: {
    fontSize: sf(15),
    fontFamily: 'Satoshi-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: sf(22),
  },

  // LEGACY STYLES (for backwards compatibility if needed)
  itemWrapper: {
    margin: sw(5),
  },
  item: {
    padding: sw(5),
    width: 'auto',
    height: 'auto',
    backgroundColor: '#ffff',
    borderRadius: sw(10),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.23,
    shadowRadius: sw(2.62),
  },
  contentContainer: {
    marginTop: sh(10),
    width: '100%',
  },
  classListContainer: {
    justifyContent: 'center',
  },
  insideStudentListContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    padding: sw(5),
  },
  acadYear: {
    color: '#666',
    fontSize: sf(15),
  },
  classCode: {
    color: '#666',
    fontSize: sf(12),
  },
  classInfoContainer: {
    padding: sw(20),
    backgroundColor: '#fff',
    marginHorizontal: sw(20),
    marginTop: sh(20),
    borderRadius: sw(10),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.2,
    shadowRadius: sw(1.41),
  },
  studentDetails: {
    fontSize: sf(14),
    color: '#666',
    fontFamily: 'Satoshi-Medium',
    marginBottom: sh(2),
  },
  studentInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  studentListContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    padding: sw(5),
  },
});

export default myStudents;