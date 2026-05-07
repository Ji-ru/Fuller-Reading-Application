import { StyleSheet } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';
import { FacultyColors } from '../Utilities/Theme';

const facultyProfile = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f8f4',             // matches facultyDashboard.safeArea
  },
  insideContainer: {
    flex: 1,
    position: 'relative',
    paddingTop: sh(10),
    paddingHorizontal: sw(20),
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: sh(40),
  },
  titleGroup: {
    alignItems: 'center',
    marginVertical: sh(25),
  },
  screenTitle: {
    fontSize: sf(28),
    fontFamily: 'Nunito-Black',
    color: FacultyColors.primary,
  },

  // ─── Profile Card ─────────────────────────────────────────────────────────
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: sw(25),
    paddingTop: sh(65),
    paddingBottom: sh(30),
    paddingHorizontal: sw(24),
    marginTop: sh(40),
    elevation: 6,
    shadowColor: FacultyColors.primaryDeep,
    shadowOffset: { width: 0, height: sw(6) },
    shadowOpacity: 0.12,
    shadowRadius: sw(12),
    borderWidth: 2,
    borderColor: '#C8E6C9',
    position: 'relative',
  },

  // ─── Avatar ───────────────────────────────────────────────────────────────
  avatarContainer: {
    position: 'absolute',
    top: sh(-45),
    alignSelf: 'center',
    width: sw(100),
    height: sw(100),
    borderRadius: sw(50),
    backgroundColor: FacultyColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: FacultyColors.primaryDeep,
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.3,
    shadowRadius: sw(6),
    borderWidth: 4,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  avatarIcon: {
    width: sw(92),
    height: sw(92),
    borderRadius: sw(46),
  },

  // ─── Form Fields ──────────────────────────────────────────────────────────
  inputGroup: {
    marginBottom: sh(18),
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: sw(12),
  },
  halfInputGroup: {
    flex: 1,
    marginBottom: sh(18),
  },
  label: {
    fontSize: sf(14),
    fontFamily: 'Nunito-Bold',
    color: FacultyColors.primaryDeep,
    marginBottom: sh(6),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#F6FBF7',
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
    borderRadius: sw(14),
    paddingHorizontal: sw(16),
    paddingVertical: sh(12),
    fontSize: sf(16),
    fontFamily: 'Nunito-Medium',
    color: FacultyColors.ink,
  },
  textInputDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    color: FacultyColors.slate,
  },

  // ─── Action Buttons ───────────────────────────────────────────────────────
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: sh(15),
    gap: sw(15),
  },
  editButton: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: FacultyColors.primary,
    paddingVertical: sh(14),
    paddingHorizontal: sw(25),
    borderRadius: sw(20),
    width: '100%',
    alignItems: 'center',
  },
  editButtonText: {
    color: FacultyColors.primary,
    fontFamily: 'Nunito-Bold',
    fontSize: sf(16),
  },
  saveButton: {
    backgroundColor: FacultyColors.primary,
    paddingVertical: sh(14),
    paddingHorizontal: sw(25),
    borderRadius: sw(20),
    flex: 1,
    alignItems: 'center',
    elevation: 5,
    shadowColor: FacultyColors.primaryDeep,
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.28,
    shadowRadius: sw(6),
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Nunito-Bold',
    fontSize: sf(16),
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF7043',
    paddingVertical: sh(12),
    paddingHorizontal: sw(25),
    borderRadius: sw(20),
    flex: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF7043',
    fontFamily: 'Nunito-Bold',
    fontSize: sf(16),
  },

  // ─── Loading ──────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default facultyProfile;