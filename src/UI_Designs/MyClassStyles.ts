import { StyleSheet } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';
import { FacultyColors } from '../Utilities/Theme';

const myClass = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f8f4',          // matches facultyDashboard.safeArea
  },
  insideContainer: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    paddingHorizontal: sw(16),
  },

  // ─── Header Section ───────────────────────────────────────────────────────
  headerSection: {
    marginTop: sh(16),
    marginBottom: sh(20),
  },
  pageTitle: {
    fontSize: sf(32),
    fontFamily: 'Nunito-Black',
    color: FacultyColors.ink,
    marginBottom: sh(4),
  },
  pageSubtitle: {
    fontSize: sf(15),
    fontFamily: 'Nunito-Medium',
    color: FacultyColors.inkLight,
  },

  // ─── Create Button ────────────────────────────────────────────────────────
  createButton: {
    backgroundColor: FacultyColors.primary,
    borderRadius: sw(14),
    marginBottom: sh(20),
    elevation: 4,
    shadowColor: FacultyColors.primaryDeep,
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.25,
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
    backgroundColor: 'rgba(255,255,255,0.25)',
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
    fontFamily: 'Nunito-ExtraBold',
    fontSize: sf(16),
  },

  // ─── Class Count ──────────────────────────────────────────────────────────
  classCount: {
    fontSize: sf(15),
    fontFamily: 'Nunito-Bold',
    color: FacultyColors.ink,
    marginBottom: sh(12),
  },

  // ─── Class Cards ──────────────────────────────────────────────────────────
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
    borderRadius: sw(16),
    elevation: 2,
    shadowColor: FacultyColors.primaryDeep,
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.07,
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
    fontFamily: 'Nunito-Bold',
    color: FacultyColors.ink,
    lineHeight: sf(22),
  },
  classMetaRow: {
    flexDirection: 'row',
    gap: sw(8),
    flexWrap: 'wrap',
  },
  classMetaChip: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: sw(10),
    paddingVertical: sh(4),
    borderRadius: sw(8),
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(4),
  },
  classMetaLabel: {
    fontSize: sf(11),
    fontFamily: 'Nunito-Medium',
    color: FacultyColors.inkLight,
  },
  classMetaValue: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
    color: FacultyColors.primaryDeep,
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

  // ─── Archived Class Variants ──────────────────────────────────────────────
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
    color: FacultyColors.slate,
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
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: sw(14),
    pointerEvents: 'none',
  },

  // ─── Context Menu ─────────────────────────────────────────────────────────
  fullScreenOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
  overlay: {
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'transparent',
  },
  contextMenu: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: sw(14),
    paddingVertical: sh(8),
    elevation: 8,
    shadowColor: FacultyColors.primaryDeep,
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.15,
    shadowRadius: sw(12),
    minWidth: sw(180),
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#E8F5E9',
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
    fontFamily: 'Nunito-Bold',
  },
  deleteMenuItem: {
    borderTopWidth: 1,
    borderTopColor: '#E8F5E9',
  },
  deleteMenuText: {
    color: '#EF4444',
  },
  archiveMenuItem: {
    borderTopWidth: 1,
    borderTopColor: '#E8F5E9',
  },
  archiveMenuText: {
    color: '#F59E0B',
  },

  // ─── Modals ───────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: sw(20),
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: sw(20),
    padding: sw(24),
    width: '100%',
    maxWidth: sw(420),
    maxHeight: '85%',
    shadowColor: FacultyColors.primaryDeep,
    shadowOffset: { width: 0, height: sw(8) },
    shadowOpacity: 0.15,
    shadowRadius: sw(16),
    elevation: 10,
  },
  modalTitle: {
    fontSize: sf(22),
    fontFamily: 'Nunito-ExtraBold',
    marginBottom: sh(24),
    color: FacultyColors.ink,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
    borderRadius: sw(12),
    padding: sw(14),
    fontSize: sf(16),
    fontFamily: 'Nunito-Medium',
    color: FacultyColors.ink,
    backgroundColor: '#F6FBF7',
  },
  formGroup: {
    marginBottom: sh(20),
  },
  formLabel: {
    fontSize: sf(14),
    fontFamily: 'Nunito-Bold',
    color: FacultyColors.ink,
    marginBottom: sh(8),
  },
  formHelperText: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Medium',
    color: FacultyColors.inkLight,
    marginTop: sh(6),
  },
  modalInfoBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: sw(12),
    padding: sw(16),
    marginTop: sh(8),
    marginBottom: sh(20),
    borderLeftWidth: 3,
    borderLeftColor: FacultyColors.primary,
  },
  modalInfoTitle: {
    fontSize: sf(14),
    fontFamily: 'Nunito-Bold',
    marginBottom: sh(8),
    color: FacultyColors.primaryDeep,
  },
  modalInfoText: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Medium',
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
    borderRadius: sw(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sh(48),
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: sf(16),
    fontFamily: 'Nunito-Bold',
    color: FacultyColors.inkLight,
  },
  saveButton: {
    backgroundColor: FacultyColors.primary,
    elevation: 3,
    shadowColor: FacultyColors.primaryDeep,
    shadowOffset: { width: 0, height: sw(3) },
    shadowOpacity: 0.22,
    shadowRadius: sw(6),
  },
  saveButtonText: {
    fontSize: sf(16),
    fontFamily: 'Nunito-Bold',
    color: '#fff',
  },
  createClassButton: {
    backgroundColor: FacultyColors.primary,
    elevation: 3,
    shadowColor: FacultyColors.primaryDeep,
    shadowOffset: { width: 0, height: sw(3) },
    shadowOpacity: 0.22,
    shadowRadius: sw(6),
  },
  createClassButtonDisabled: {
    backgroundColor: '#A5D6A7',
    opacity: 0.6,
  },
  createClassButtonText: {
    fontSize: sf(16),
    fontFamily: 'Nunito-Bold',
    color: '#fff',
  },

  // ─── Empty & Loading States ───────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: sh(80),
  },
  loadingText: {
    marginTop: sh(16),
    fontSize: sf(16),
    fontFamily: 'Nunito-Medium',
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
    fontFamily: 'Nunito-ExtraBold',
    color: FacultyColors.ink,
    marginBottom: sh(8),
    textAlign: 'center',
  },
  emptyText: {
    fontSize: sf(15),
    fontFamily: 'Nunito-Medium',
    color: FacultyColors.slate,
    textAlign: 'center',
    lineHeight: sf(22),
  },

  // ─── Legacy styles (backward compat) ─────────────────────────────────────
  item: {
    padding: sw(5),
    width: 'auto',
    height: 'auto',
    backgroundColor: '#fff',
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
    backgroundColor: '#E8F5E9',
    borderRadius: sw(10),
    marginBottom: sh(35),
  },
  classGrade: {
    fontFamily: 'Nunito-Medium',
    color: FacultyColors.inkLight,
    fontSize: sf(12),
  },
  classCode: {
    color: FacultyColors.inkLight,
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
  },
  contentContainer: {
    flex: 1,
    marginTop: sh(10),
    width: '100%',
  },
});

export default myClass;