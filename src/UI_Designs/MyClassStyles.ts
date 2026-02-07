import { StyleSheet } from 'react-native';

const myClass = StyleSheet.create({
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

  // HEADER SECTION
  headerSection: {
    marginTop: 16,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 32,
    fontFamily: 'Satoshi-Black',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },

  // CREATE BUTTON
  createButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  createButtonIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  createButtonIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
  },
  createButtonText: {
    color: '#fff',
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
  },

  // CLASS COUNT
  classCount: {
    fontSize: 15,
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
    marginBottom: 12,
  },

  // CLASS CARDS
  listWrapper: {
    flex: 1,
  },
  classListContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  classCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  classIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  classIcon: {
    fontSize: 24,
  },
  classInfo: {
    flex: 1,
    gap: 8,
  },
  className: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#1F2937',
    lineHeight: 22,
  },
  classMetaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  classMetaChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  classMetaLabel: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },
  classMetaValue: {
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
  },
  ellipsisButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  ellipsisIcon: {
    width: 16,
    height: 16,
  },

  // ==========================================
  // ARCHIVED CLASSES SPECIFIC STYLES
  // ==========================================
  archivedClassCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  archivedClassCardContent: {
    opacity: 0.75,
  },
  archivedClassIconContainer: {
    backgroundColor: '#FEF3C7',
  },
  archivedClassIcon: {
    fontSize: 24,
    opacity: 0.6,
  },
  archivedClassName: {
    color: '#6B7280',
  },
  archivedClassEmail: {
    color: '#9CA3AF',
  },
  archivedMetaChip: {
    backgroundColor: '#FEF3C7',
  },
  archivedMetaLabel: {
    color: '#92400E',
  },
  archivedMetaValue: {
    color: '#B45309',
  },
  archivedEllipsisButton: {
    backgroundColor: '#FEF3C7',
  },
  archivedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 14,
    pointerEvents: 'none',
  },
  // ==========================================

  // CONTEXT MENU
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
  overlay: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  contextMenu: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    minWidth: 180,
    zIndex: 1000,
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contextMenuIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: '#374151',
  },
  contextMenuText: {
    fontSize: 15,
    color: '#374151',
    fontFamily: 'Satoshi-Bold',
  },
  deleteMenuItem: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  deleteMenuText: {
    color: '#EF4444',
  },
  archiveMenuItem: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  archiveMenuText: {
    color: '#F59E0B',
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 24,
    color: '#1F2937',
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
    marginBottom: 8,
  },
  formHelperText: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
    marginTop: 6,
  },
  modalInfoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  modalInfoTitle: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 8,
    color: '#1E40AF',
  },
  modalInfoText: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#374151',
    marginBottom: 4,
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#fff',
  },
  createClassButton: {
    backgroundColor: '#4CAF50',
  },
  createClassButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  createClassButtonText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#fff',
  },

  // EMPTY & LOADING STATES
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },
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

  // LEGACY STYLES (for backwards compatibility)
  item: {
    padding: 5,
    width: 'auto',
    height: 'auto',
    backgroundColor: '#ffff',
    borderRadius: 10,
    elevation: 4,
  },
  itemWrapper: {
    margin: 5,
  },
  insideClassListContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    padding: 5,
  },
  withinInsideClassListContiner: {
    flex: 1,
  },
  gradeAndCode: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  ellipsisContainer: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D4F1E8',
    borderRadius: 10,
    marginBottom: 35,
  },
  classGrade: {
    fontFamily: 'Satoshi-Medium',
    color: '#666',
    fontSize: 12,
  },
  classCode: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
  },
  contentContainer: {
    flex: 1,
    marginTop: 10,
    width: '100%',
  },
});

export default myClass;