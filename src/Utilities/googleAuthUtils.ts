// Utilities/googleAuthUtils.ts
//
// WHAT CHANGED FROM v1:
//   • initiateGoogleSignUp() now also calls signInWithCredential() so that
//     auth.currentUser is populated by the time the user reaches SignUpTwo.
//   • The return type no longer includes idToken — SignUpTwo no longer needs it
//     because GoogleSignUpUserCredentials() reads auth.currentUser internally.
//   • A duplicate-account guard is included: if a Firestore document already
//     exists for this UID the function signs out and throws a friendly error,
//     preventing createUserDocument() from silently overwriting existing data.
//
// SETUP:
//   1. npm install @react-native-google-signin/google-signin
//   2. Replace YOUR_WEB_CLIENT_ID with your Firebase Web Client ID
//      (Firebase Console → Authentication → Sign-in method → Google → Web client ID)
//   3. Call configureGoogleSignIn() once in App.tsx before navigation renders.

import {
    GoogleSignin,
    statusCodes,
  } from '@react-native-google-signin/google-signin';
  import {
    getAuth,
    signInWithCredential,
    GoogleAuthProvider,
    signOut,
  } from '@react-native-firebase/auth';
  import {
    getFirestore,
    doc,
    getDoc,
  } from '@react-native-firebase/firestore';
  import { WEBCLIENT_API } from '@env';
  const auth = getAuth();
  const db   = getFirestore();
  
  // ─── Configuration ────────────────────────────────────────────────────────────
  
  export const configureGoogleSignIn = (): void => {
    GoogleSignin.configure({
      webClientId: WEBCLIENT_API,
      offlineAccess: false,
    });
  };
  
  console.log("This is the API: " + WEBCLIENT_API );
  // ─── Return type ──────────────────────────────────────────────────────────────
  
  export interface GoogleSignInResult {
    /** The Google account email — pre-filled (and locked) in SignUpTwo */
    email: string;
  }
  
  // ─── Main helper ──────────────────────────────────────────────────────────────
  
  /**
   * Launches the native Google account picker, then signs the user into
   * Firebase Auth via signInWithCredential().
   *
   * After this resolves successfully, auth.currentUser is set — so
   * GoogleSignUpUserCredentials() can safely call getAuth().currentUser.
   *
   * @throws 'CANCELLED'   — user dismissed the picker (caller should stay silent)
   * @throws Error         — duplicate account, missing token, or network issues
   */
  export const initiateGoogleSignUp = async (): Promise<GoogleSignInResult> => {
    // Verify Play Services availability (Android only; no-op on iOS)
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  
    // Sign out any cached Google session so the account picker always appears
    await GoogleSignin.signOut();
  
    const response = await GoogleSignin.signIn();
  
    if (response.type === 'cancelled') {
      throw new Error('CANCELLED');
    }
  
    const { idToken, user: googleUser } = response.data;
  
    if (!idToken) {
      throw new Error(
        'Google Sign-In did not return an ID token. ' +
        'Ensure the Web Client ID in googleAuthUtils.ts is correct.',
      );
    }
  
    // ── Sign into Firebase Auth ──────────────────────────────────────────────
    // This populates auth.currentUser, which GoogleSignUpUserCredentials() reads.
    const googleCredential = GoogleAuthProvider.credential(idToken);
    const userCredential   = await signInWithCredential(auth, googleCredential);
    const firebaseUser     = userCredential.user;
  
    // ── Duplicate-account guard ──────────────────────────────────────────────
    // createUserDocument() uses setDoc() which would silently overwrite an
    // existing account. Catch it here and surface a clear error instead.
    const userRef      = doc(db, 'users', firebaseUser.uid);
    const existingSnap = await getDoc(userRef);
  
    if (existingSnap.exists()) {
      // Sign back out — the user should log in, not register
      await signOut(auth);
      throw new Error(
        'An account already exists for this Google address. ' +
        'Please tap Login instead.',
      );
    }
  
    return { email: googleUser.email };
  };