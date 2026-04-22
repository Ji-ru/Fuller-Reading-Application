import { StyleSheet } from 'react-native';

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
    paddingHorizontal: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Satoshi-Medium',
  },

  // CLASS INFO HEADER
  classInfoHeader: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  classInfoMain: {
    gap: 12,
  },
  className: {
    fontSize: 24,
    fontFamily: 'Satoshi-Bold',
    color: '#1A1A1A',
    lineHeight: 30,
  },
  classMetaRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  classMetaItem: {
    gap: 4,
  },
  classMetaLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  classMetaValue: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
  },

  // SEARCH BAR
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#9CA3AF',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#1F2937',
    padding: 0,
  },
  clearButton: {
    fontSize: 20,
    color: '#9CA3AF',
    paddingHorizontal: 8,
  },

  // STUDENT COUNT
  studentCountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
    gap: 6,
  },
  studentCount: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
  },
  studentCountSubtext: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#9CA3AF',
  },

  // STUDENT CARDS
  studentListWrapper: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  studentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
  },
  defaultProfile: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultProfileText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Satoshi-Bold',
  },
  studentInfo: {
    flex: 1,
    marginLeft: 16,
    gap: 8,
  },
  studentName: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#1F2937',
    lineHeight: 22,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  detailChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  arrowIcon: {
    fontSize: 24,
    color: '#3498db',
    fontFamily: 'Satoshi-Bold',
  },

  // EMPTY STATE
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },

  // LEGACY STYLES (for backwards compatibility if needed)
  itemWrapper: {
    margin: 5,
  },
  item: {
    padding: 5,
    width: 'auto',
    height: 'auto',
    backgroundColor: '#ffff',
    borderRadius: 10,
    elevation: 4,
  },
  contentContainer: {
    marginTop: 10,
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
    padding: 5,
  },
  acadYear: {
    color: '#666',
    fontSize: 15,
  },
  classCode: {
    color: '#666',
    fontSize: 12,
  },
  classInfoContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    elevation: 2,
  },
  studentDetails: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Satoshi-Medium',
    marginBottom: 2,
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
    padding: 5,
  },
});

export default myStudents;