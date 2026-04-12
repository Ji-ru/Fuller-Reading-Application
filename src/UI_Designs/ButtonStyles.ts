import { StyleSheet } from 'react-native';

const buttons = StyleSheet.create({
  // ── Primary Action (Next, Continue, Start) ──────────────────────────────
  nextPageButton: {
    backgroundColor: '#1a7a45',
    borderRadius: 14,
    width: '90%',
    maxWidth: 360,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 28,
    shadowColor: '#1a7a45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  nextPageText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Satoshi-Black',
    letterSpacing: 0.5,
  },

  // ── Cancel / Destructive ────────────────────────────────────────────────
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e74c3c',
    borderRadius: 14,
    width: '90%',
    maxWidth: 360,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  cancelText: {
    color: '#e74c3c',
    fontSize: 15,
    fontFamily: 'Satoshi-Bold',
    letterSpacing: 0.3,
  },

  // ── Start Reading ───────────────────────────────────────────────────────
  startReadingButton: {
    backgroundColor: '#1a7a45',
    borderRadius: 14,
    width: '90%',
    maxWidth: 360,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 80,
    shadowColor: '#1a7a45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  // ── Reading History ─────────────────────────────────────────────────────
  readingHistoryButton: {
    backgroundColor: '#1a7a45',
    borderRadius: 14,
    width: '90%',
    maxWidth: 360,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 14,
    shadowColor: '#1a7a45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  // ── Role Selection (Student / Teacher) ──────────────────────────────────
  studentButton: {
    backgroundColor: '#1a7a45',
    borderRadius: 14,
    width: '90%',
    maxWidth: 360,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 14,
    shadowColor: '#1a7a45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  teacherButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1a7a45',
    width: '90%',
    maxWidth: 360,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 14,
  },

  // ── Gender Radio ────────────────────────────────────────────────────────
  sexRadioButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    maxWidth: 360,
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    alignSelf: 'center',
    fontFamily: 'Satoshi-Medium',
    borderWidth: 1.5,
    borderColor: '#d4f5e2',
  },
});

export default buttons;
