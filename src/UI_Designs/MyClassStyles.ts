import { StyleSheet } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';

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
    paddingHorizontal: sw(16),
  },

  // HEADER SECTION
  headerSection: {
    marginTop: sh(16),
    marginBottom: sh(20),
  },
  pageTitle: {
    fontSize: sf(32),
    fontFamily: 'Satoshi-Black',
    color: '#1A1A1A',
    marginBottom: sh(4),
  },
  pageSubtitle: {
    fontSize: sf(15),
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },

  // CREATE BUTTON
  createButton: {
    backgroundColor: '#3D71D9',
    borderRadius: sw(12),
    marginBottom: sh(20),
    elevation: 3,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.2,
    shadowRadius: sw(8),
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sh(14),
    paddingHorizontal: sw(20),
  },
  createButtonIconWrapper: {
    width: sw(24),
    height: sw(24),
    borderRadius: sw(12),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: sw(10),
  },
  createButtonIcon: {
    width: sw(16),
    height: sw(16),
    tintColor: '#fff',
  },
  createButtonText: {
    color: '#fff',
    fontFamily: 'Satoshi-Bold',
    fontSize: sf(16),
  },

  // CLASS COUNT
  classCount: {
    fontSize: sf(15),
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
    marginBottom: sh(12),
  },

  // CLASS CARDS
  listWrapper: {
    flex: 1,
  },
  classListContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: sh(24),
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: sw(14),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.06,
    shadowRadius: sw(8),
    overflow: 'hidden',
  },
  classCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sw(16),
  },
  classIconContainer: {
    width: sw(48),
    height: sw(48),
    borderRadius: sw(12),
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: sw(16),
  },
  classIcon: {
    fontSize: sf(24),
  },
  classInfo: {
    flex: 1,
    gap: sh(8),
  },
  className: {
    fontSize: sf(18),
    fontFamily: 'Satoshi-Bold',
    color: '#1F2937',
    lineHeight: sf(22),
  },
  classMetaRow: {
    flexDirection: 'row',
    gap: sw(8),
    flexWrap: 'wrap',
  },
  classMetaChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: sw(10),
    paddingVertical: sh(4),
    borderRadius: sw(8),
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(4),
  },
  classMetaLabel: {
    fontSize: sf(11),
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },
  classMetaValue: {
    fontSize: sf(12),
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
  },
  ellipsisButton: {
    width: sw(32),
    height: sw(32),
    borderRadius: sw(16),
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: sw(12),
  },
  ellipsisIcon: {
    width: sw(16),
    height: sw(16),
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
    fontSize: sf(24),
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
    borderRadius: sw(14),
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
    borderRadius: sw(12),
    paddingVertical: sh(8),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.15,
    shadowRadius: sw(12),
    minWidth: sw(180),
    zIndex: 1000,
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sw(16),
    paddingVertical: sh(12),
  },
  contextMenuIcon: {
    width: sw(20),
    height: sw(20),
    marginRight: sw(12),
    tintColor: '#374151',
  },
  contextMenuText: {
    fontSize: sf(15),
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
    padding: sw(20),
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: sw(16),
    padding: sw(24),
    width: '100%',
    maxWidth: sw(420),
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: sf(22),
    fontFamily: 'Satoshi-Bold',
    marginBottom: sh(24),
    color: '#1F2937',
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: sw(10),
    padding: sw(14),
    fontSize: sf(16),
    fontFamily: 'Satoshi-Medium',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  formGroup: {
    marginBottom: sh(20),
  },
  formLabel: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
    marginBottom: sh(8),
  },
  formHelperText: {
    fontSize: sf(13),
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
    marginTop: sh(6),
  },
  modalInfoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: sw(12),
    padding: sw(16),
    marginTop: sh(8),
    marginBottom: sh(20),
  },
  modalInfoTitle: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Bold',
    marginBottom: sh(8),
    color: '#1E40AF',
  },
  modalInfoText: {
    fontSize: sf(13),
    fontFamily: 'Satoshi-Medium',
    color: '#374151',
    marginBottom: sh(4),
    lineHeight: sf(18),
  },
  modalButtons: {
    flexDirection: 'row',
    gap: sw(12),
    marginTop: sh(20),
  },
  modalButton: {
    flex: 1,
    paddingVertical: sh(14),
    borderRadius: sw(10),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sh(48),
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: sf(16),
    fontFamily: 'Satoshi-Bold',
    color: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  saveButtonText: {
    fontSize: sf(16),
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
    fontSize: sf(16),
    fontFamily: 'Satoshi-Bold',
    color: '#fff',
  },

  // EMPTY & LOADING STATES
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: sh(80),
  },
  loadingText: {
    marginTop: sh(16),
    fontSize: sf(16),
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },
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

  // LEGACY STYLES (for backwards compatibility)
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
  itemWrapper: {
    margin: sw(5),
  },
  insideClassListContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    padding: sw(5),
  },
  withinInsideClassListContiner: {
    flex: 1,
  },
  gradeAndCode: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: sh(15),
  },
  ellipsisContainer: {
    width: sw(25),
    height: sw(25),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D4F1E8',
    borderRadius: sw(10),
    marginBottom: sh(35),
  },
  classGrade: {
    fontFamily: 'Satoshi-Medium',
    color: '#666',
    fontSize: sf(12),
  },
  classCode: {
    color: '#666',
    fontSize: sf(12),
    fontFamily: 'Satoshi-Bold',
  },
  contentContainer: {
    flex: 1,
    marginTop: sh(10),
    width: '100%',
  },
});

export default myClass;