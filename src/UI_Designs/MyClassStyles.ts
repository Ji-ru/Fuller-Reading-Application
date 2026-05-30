import { StyleSheet } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';
import { FacultyColors, Radii, Shadows } from '../Utilities/Theme';

const myClass = StyleSheet.create({
  // Updated to FacultyColors palette for the faculty theme
  container: {
    flex: 1,
    backgroundColor: FacultyColors.bg,
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
    color: FacultyColors.ink,
    marginBottom: sh(4),
  },
  pageSubtitle: {
    fontSize: sf(15),
    fontFamily: 'Satoshi-Medium',
    color: FacultyColors.inkLight,
  },

  // CREATE BUTTON
  createButton: {
    backgroundColor: FacultyColors.primary,
    borderRadius: sw(12),
    marginTop: sh(5),
    marginBottom: sh(20),
    elevation: 3,
    shadowColor: FacultyColors.primary,
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
    color: FacultyColors.inkLight,
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
    gap: sh(12),
  },
  classCard: {
    backgroundColor: FacultyColors.white,
    borderRadius: Radii.md,
    borderLeftWidth: sw(4),
    borderLeftColor: FacultyColors.primary,
    ...Shadows.subtle,
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
    borderRadius: Radii.sm,
    backgroundColor: 'rgba(0,132,67,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: sw(14),
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
    color: FacultyColors.ink,
    lineHeight: sf(22),
  },
  classMetaRow: {
    flexDirection: 'row',
    gap: sw(8),
    flexWrap: 'wrap',
  },
  classMetaChip: {
    backgroundColor: 'rgba(0,132,67,0.08)',
    paddingHorizontal: sw(10),
    paddingVertical: sh(4),
    borderRadius: Radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(4),
  },
  classMetaLabel: {
    fontSize: sf(10),
    fontFamily: 'Satoshi-Medium',
    color: FacultyColors.inkLight,
  },
  classMetaValue: {
    fontSize: sf(11),
    fontFamily: 'Satoshi-Bold',
    color: FacultyColors.primary,
  },
  ellipsisButton: {
    width: sw(34),
    height: sw(34),
    borderRadius: sw(17),
    backgroundColor: 'rgba(0,132,67,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: sw(10),
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
    borderColor: FacultyColors.slate,
    borderStyle: 'dashed',
  },
  archivedClassCardContent: {
    opacity: 0.75,
  },
  archivedClassIconContainer: {
    backgroundColor: FacultyColors.yellow,
  },
  archivedClassIcon: {
    fontSize: sf(24),
    opacity: 0.6,
  },
  archivedClassName: {
    color: FacultyColors.inkLight,
  },
  archivedClassEmail: {
    color: '#9CA3AF',
  },
  archivedMetaChip: {
    backgroundColor: FacultyColors.yellow,
  },
  archivedMetaLabel: {
    color: FacultyColors.orange,
  },
  archivedMetaValue: {
    color: FacultyColors.orange,
  },
  archivedEllipsisButton: {
    backgroundColor: FacultyColors.yellow,
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
    zIndex: 9998,
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
    backgroundColor: FacultyColors.white,
    borderRadius: sw(12),
    paddingVertical: sh(8),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.15,
    shadowRadius: sw(12),
    minWidth: sw(180),
    zIndex: 9999,
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
    tintColor: FacultyColors.ink,
  },
  contextMenuText: {
    fontSize: sf(15),
    color: FacultyColors.ink,
    fontFamily: 'Satoshi-Bold',
  },
  deleteMenuItem: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  deleteMenuText: {
    color: FacultyColors.red,
  },
  archiveMenuItem: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  archiveMenuText: {
    color: FacultyColors.orange,
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
    backgroundColor: FacultyColors.white,
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
    color: FacultyColors.ink,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: FacultyColors.slate,
    borderRadius: sw(10),
    padding: sw(14),
    fontSize: sf(16),
    fontFamily: 'Satoshi-Medium',
    color: FacultyColors.ink,
    backgroundColor: FacultyColors.bg,
  },
  formGroup: {
    marginBottom: sh(20),
  },
  formLabel: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Bold',
    color: FacultyColors.ink,
    marginBottom: sh(8),
  },
  formHelperText: {
    fontSize: sf(13),
    fontFamily: 'Satoshi-Medium',
    color: FacultyColors.inkLight,
    marginTop: sh(6),
  },
  modalInfoBox: {
    backgroundColor: FacultyColors.primaryPale,
    borderRadius: sw(12),
    padding: sw(16),
    marginTop: sh(8),
    marginBottom: sh(20),
  },
  modalInfoTitle: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Bold',
    marginBottom: sh(8),
    color: FacultyColors.primaryDeep,
  },
  modalInfoText: {
    fontSize: sf(13),
    fontFamily: 'Satoshi-Medium',
    color: FacultyColors.ink,
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
    backgroundColor: FacultyColors.primaryPale,
  },
  cancelButtonText: {
    fontSize: sf(16),
    fontFamily: 'Satoshi-Bold',
    color: FacultyColors.inkLight,
  },
  saveButton: {
    backgroundColor: FacultyColors.primary,
  },
  saveButtonText: {
    fontSize: sf(16),
    fontFamily: 'Satoshi-Bold',
    color: '#fff',
  },
  createClassButton: {
    backgroundColor: FacultyColors.primary,
  },
  createClassButtonDisabled: {
    backgroundColor: FacultyColors.slate,
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
    color: FacultyColors.inkLight,
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
    color: FacultyColors.ink,
    marginBottom: sh(8),
    textAlign: 'center',
  },
  emptyText: {
    fontSize: sf(15),
    fontFamily: 'Satoshi-Medium',
    color: FacultyColors.slate,
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
    backgroundColor: FacultyColors.primaryPale,
    borderRadius: sw(10),
    marginBottom: sh(35),
  },
  classGrade: {
    fontFamily: 'Satoshi-Medium',
    color: FacultyColors.inkLight,
    fontSize: sf(12),
  },
  classCode: {
    color: FacultyColors.inkLight,
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
