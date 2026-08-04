// adminUserManagementStyles.ts
import { StyleSheet, Platform } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';
import { FacultyColors, Radii, Shadows, Spacing } from '../Utilities/Theme';

const adminUserManagment = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7F5', // Off-white neutral with slight green tint
  },
  container: {
    flex: 1,
    paddingHorizontal: sw(16),
  },
  content: {
    flex: 1,
  },

  // COMPACT HEADER
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: sh(16),
    paddingHorizontal: sw(4),
    marginTop: sh(10),
    marginBottom: sh(10),
  },
  menuBtn: {
    padding: sw(8),
    marginLeft: -sw(8),
  },
  title: {
    fontFamily: 'Satoshi-Black',
    fontSize: sf(20),
    color: FacultyColors.ink,
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(8),
    marginRight: -sw(8),
  },
  exportBtn: {
    width: sw(40),
    height: sw(40),
    borderRadius: sw(20),
    backgroundColor: FacultyColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FacultyColors.primaryLight,
  },
  addBtn: {
    width: sw(40),
    height: sw(40),
    borderRadius: sw(20),
    backgroundColor: FacultyColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // SEARCH BAR (Pill shaped, no border)
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F2',
    borderRadius: Radii.pill,
    paddingHorizontal: sw(20),
    paddingVertical: Platform.OS === 'ios' ? sh(12) : sh(4),
    marginBottom: sh(20),
  },
  searchInput: {
    flex: 1,
    paddingLeft: sw(12),
    fontFamily: 'Satoshi-Medium',
    fontSize: sf(16),
    color: FacultyColors.ink,
    ...(Platform.OS === 'android' && { paddingVertical: sh(8) }),
  },
  searchIcon: {
    width: sw(20),
    height: sw(20),
    tintColor: FacultyColors.slate,
  },

  // FILTER CHIPS (Horizontal Scroll)
  filterChipsContainer: {
    marginBottom: sh(16),
  },
  filterChipsContent: {
    paddingVertical: sh(4),
    gap: sw(10),
  },
  chip: {
    paddingHorizontal: sw(16),
    paddingVertical: sh(8),
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: FacultyColors.primaryLight,
    backgroundColor: 'transparent',
  },
  chipActive: {
    backgroundColor: FacultyColors.primary,
    borderColor: FacultyColors.primary,
    ...Shadows.button,
  },
  chipText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: sf(14),
    color: FacultyColors.inkLight,
  },
  chipTextActive: {
    fontFamily: 'Satoshi-Bold',
    color: FacultyColors.white,
  },

  // USER COUNT
  userCountContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: sh(12),
    paddingHorizontal: sw(4),
  },
  userCount: {
    fontFamily: 'Satoshi-Regular',
    fontSize: sf(13),
    color: FacultyColors.slate,
  },

  // USER LIST
  listWrapper: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: sh(24),
  },

  // USER CARD
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FacultyColors.white,
    borderRadius: Radii.sm,
    paddingVertical: sh(16),
    paddingHorizontal: sw(16),
    marginBottom: Spacing.sm,
    ...Shadows.subtle,
  },
  avatar: {
    width: sw(48),
    height: sw(48),
    borderRadius: sw(24),
    backgroundColor: FacultyColors.bg,
    marginRight: sw(16),
  },
  userInfo: {
    flex: 1,
    marginRight: sw(8),
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh(4),
    flexWrap: 'wrap',
  },
  userName: {
    fontFamily: 'Satoshi-Bold',
    fontSize: sf(16),
    color: FacultyColors.ink,
    marginRight: sw(8),
  },
  roleChip: {
    paddingHorizontal: sw(8),
    paddingVertical: sh(2),
    borderRadius: sw(6),
  },
  roleChipText: {
    fontSize: sf(10),
    fontFamily: 'Satoshi-Bold',
    textTransform: 'uppercase',
  },
  userEmail: {
    fontFamily: 'Satoshi-Medium',
    fontSize: sf(13),
    color: FacultyColors.slate,
  },

  // LOADING & STATES
  loader: {
    marginVertical: sh(32),
  },
  loadMoreButton: {
    backgroundColor: FacultyColors.primary,
    paddingVertical: sh(14),
    paddingHorizontal: sw(32),
    borderRadius: Radii.md,
    alignItems: 'center',
    marginVertical: sh(24),
    alignSelf: 'center',
    ...Shadows.button,
  },
  loadMoreText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: sf(16),
    color: FacultyColors.white,
  },

  // EMPTY STATE
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sh(80),
    paddingHorizontal: sw(40),
  },
  emptyTitle: {
    fontSize: sf(18),
    fontFamily: 'Satoshi-Bold',
    color: FacultyColors.ink,
    marginTop: sh(16),
    marginBottom: sh(8),
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: sf(14),
    color: FacultyColors.slate,
    textAlign: 'center',
    lineHeight: sf(20),
  },

  // ERROR STATE
  errorContainer: {
    backgroundColor: '#FFE4E6',
    padding: sw(16),
    borderRadius: Radii.sm,
    marginBottom: sh(20),
  },
  errorText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: sf(14),
    color: FacultyColors.red,
    textAlign: 'center',
  },

  // EDIT MODAL (BOTTOM SHEET)
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 43, 34, 0.4)', // FacultyColors.ink with opacity
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: FacultyColors.white,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    paddingHorizontal: sw(24),
    paddingTop: sh(12),
    paddingBottom: Platform.OS === 'ios' ? sh(40) : sh(24),
    maxHeight: '90%',
    ...Shadows.cardLift,
  },
  sheetHandle: {
    width: sw(36),
    height: sh(4),
    borderRadius: sw(2),
    backgroundColor: FacultyColors.slate,
    alignSelf: 'center',
    marginBottom: sh(20),
  },
  modalTitle: {
    fontFamily: 'Satoshi-Black',
    fontSize: sf(22),
    color: FacultyColors.ink,
    marginBottom: sh(24),
  },
  modalSectionTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: sf(16),
    color: FacultyColors.ink,
    marginTop: sh(16),
    marginBottom: sh(12),
  },
  modalLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: sf(12),
    color: FacultyColors.inkLight,
    marginBottom: sh(6),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: '#F4F7F5',
    borderRadius: Radii.sm,
    paddingHorizontal: sw(16),
    paddingVertical: Platform.OS === 'ios' ? sh(14) : sh(10),
    fontFamily: 'Satoshi-Medium',
    fontSize: sf(15),
    color: FacultyColors.ink,
    marginBottom: sh(16),
  },
  modalRow: {
    flexDirection: 'row',
    gap: sw(12),
  },
  modalRowItem: {
    flex: 1,
  },

  // PILL SELECTORS
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sw(10),
    marginBottom: sh(16),
  },
  selectorPill: {
    paddingHorizontal: sw(16),
    paddingVertical: sh(10),
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: FacultyColors.slate,
    backgroundColor: FacultyColors.white,
  },
  selectorPillActive: {
    borderColor: FacultyColors.primary,
    backgroundColor: 'rgba(0, 132, 67, 0.08)',
  },
  selectorText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: sf(14),
    color: FacultyColors.slate,
    textTransform: 'capitalize',
  },
  selectorTextActive: {
    fontFamily: 'Satoshi-Bold',
    color: FacultyColors.primary,
  },

  // MODAL ACTIONS
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: sw(12),
    marginTop: sh(24),
    paddingTop: sh(16),
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
  },
  cancelBtn: {
    paddingVertical: sh(12),
    paddingHorizontal: sw(24),
    borderRadius: Radii.sm,
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: sf(15),
    color: FacultyColors.inkLight,
  },
  saveBtn: {
    backgroundColor: FacultyColors.primary,
    paddingVertical: sh(12),
    paddingHorizontal: sw(24),
    borderRadius: Radii.sm,
    justifyContent: 'center',
    ...Shadows.button,
  },
  saveText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: sf(15),
    color: FacultyColors.white,
  },

  // ROW ACTION BUTTONS (Edit / Delete on each user card)
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(6),
  },
  rowActionBtn: {
    width: sw(36),
    height: sw(36),
    borderRadius: sw(18),
    backgroundColor: '#F0F4F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowActionBtnDanger: {
    backgroundColor: '#FFE4E6',
  },

  // PASSWORD FIELD WITH EYE TOGGLE
  passwordFieldWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F7F5',
    borderRadius: Radii.sm,
    paddingRight: sw(12),
    marginBottom: sh(16),
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: sw(16),
    paddingVertical: Platform.OS === 'ios' ? sh(14) : sh(10),
    fontFamily: 'Satoshi-Medium',
    fontSize: sf(15),
    color: FacultyColors.ink,
  },
  eyeToggle: {
    padding: sw(6),
  },

  // GRADE CHIPS (1-6 selector for Add User modal)
  gradeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sw(8),
    marginBottom: sh(16),
  },
  gradeChip: {
    width: sw(44),
    height: sw(44),
    borderRadius: sw(22),
    borderWidth: 1,
    borderColor: FacultyColors.slate,
    backgroundColor: FacultyColors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeChipActive: {
    borderColor: FacultyColors.primary,
    backgroundColor: FacultyColors.primary,
  },
  gradeChipText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: sf(15),
    color: FacultyColors.slate,
  },
  gradeChipTextActive: {
    color: FacultyColors.white,
  },

  // ADMIN-PROTECTED BANNER inside edit modal
  adminBanner: {
    backgroundColor: '#FFF3D6',
    borderRadius: Radii.sm,
    padding: sw(12),
    marginBottom: sh(12),
  },
  adminBannerText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: sf(12),
    color: FacultyColors.ink,
    lineHeight: sf(18),
  },

  // VALIDATION ERROR TEXT
  fieldError: {
    fontFamily: 'Satoshi-Medium',
    fontSize: sf(12),
    color: FacultyColors.red,
    marginTop: -sh(10),
    marginBottom: sh(10),
  },
});

export default adminUserManagment;
