import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Modal,
    TextInput,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { getAuth } from '@react-native-firebase/auth';
import { joinClass, getStudentClass } from '../../Controller/AuthenticationController';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import upperNav from '../../UI_Designs/UpperNavigation';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { ClassDocument } from '../../Interfaces/dataInterfaces';

// ─── Design tokens ────────────────────────────────────────────────────────────

const COLORS = {
    teal:          '#57b8b3',
    tealDark:      '#2C6975',
    tealLight:     '#ECFBFF',
    tealMid:       '#A8DDD9',
    text:          '#1E1E1E',
    textSecondary: '#666666',
    textMuted:     '#AAAAAA',
    surface:       '#FFFFFF',
    background:    '#F4F7FA',
    border:        '#E4EAF0',
    danger:        '#D32F2F',
    dangerLight:   '#FFF0F0',
    success:       '#4CAF50',
    warning:       '#F59E0B',
    warningLight:  '#FFFBEB',
    warningBorder: '#FDE68A',
};

// ─── InfoRow sub-component ────────────────────────────────────────────────────

interface InfoRowProps {
    icon: string;
    label: string;
    value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>{icon}</Text>
        <View style={styles.infoText}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    </View>
);

// ─── AlreadyEnrolledPopup ─────────────────────────────────────────────────────

interface AlreadyEnrolledPopupProps {
    visible: boolean;
    onClose: () => void;
}

/**
 * Custom modal replacing Alert for the one-class-at-a-time guard.
 * Uses a warm amber tone to signal a soft warning without alarm.
 */
const AlreadyEnrolledPopup: React.FC<AlreadyEnrolledPopupProps> = ({ visible, onClose }) => (
    <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
    >
        <View style={popupStyles.overlay}>
            <View style={popupStyles.card}>
                <View style={[popupStyles.iconCircle, popupStyles.iconCircleWarning]}>
                    <Text style={popupStyles.iconEmoji}>🔒</Text>
                </View>

                <Text style={popupStyles.title}>Already Enrolled</Text>

                <Text style={popupStyles.body}>
                    You can only join{' '}
                    <Text style={popupStyles.bodyBold}>one class at a time.</Text>
                    {'\n\n'}
                    If you need to switch classes, contact your teacher for assistance.
                </Text>

                <TouchableOpacity
                    style={[popupStyles.actionButton, popupStyles.actionButtonWarning]}
                    onPress={onClose}
                    activeOpacity={0.82}
                >
                    <Text style={popupStyles.actionButtonText}>Got it</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

// ─── JoinSuccessPopup ─────────────────────────────────────────────────────────

interface JoinSuccessPopupProps {
    visible: boolean;
    className: string;
    onClose: () => void;
}

/**
 * Custom modal replacing Alert.alert('🎉 Joined!', ...) after a successful join.
 */
const JoinSuccessPopup: React.FC<JoinSuccessPopupProps> = ({ visible, className, onClose }) => (
    <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
    >
        <View style={popupStyles.overlay}>
            <View style={popupStyles.card}>
                <View style={[popupStyles.iconCircle, popupStyles.iconCircleSuccess]}>
                    <Text style={popupStyles.iconEmoji}>🎉</Text>
                </View>

                <Text style={popupStyles.title}>You're In!</Text>

                <Text style={popupStyles.body}>
                    You have successfully joined{'\n'}
                    <Text style={popupStyles.bodyBold}>{className}</Text>.
                    {'\n\n'}
                    Your teacher can now see you in the class list.
                </Text>

                <TouchableOpacity
                    style={[popupStyles.actionButton, popupStyles.actionButtonSuccess]}
                    onPress={onClose}
                    activeOpacity={0.82}
                >
                    <Text style={popupStyles.actionButtonText}>Let's Go!</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

// ─── Main component ───────────────────────────────────────────────────────────

export default function StudentMyClass() {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const currentUser = getAuth().currentUser;
    const studentId   = currentUser?.uid || '';

    // ── Navigation ────────────────────────────────────────────────────────────
    const { handleLogout, handleBackStep } = useNavigationHelper();
    const [menuVisible,   setMenuVisible]   = useState(false);
    const [logoutVisible, setLogoutVisible] = useState(false);

    // ── Enrolled class state ──────────────────────────────────────────────────
    const [enrolledClass, setEnrolledClass] = useState<ClassDocument | null>(null);
    const [loadingClass,  setLoadingClass]  = useState(true);
    const [classError,    setClassError]    = useState('');

    // ── Join class modal state ────────────────────────────────────────────────
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [joinCode,         setJoinCode]          = useState('');
    const [joining,          setJoining]            = useState(false);
    const [joinError,        setJoinError]          = useState('');

    // ── Custom popup state ────────────────────────────────────────────────────
    const [alreadyEnrolledVisible, setAlreadyEnrolledVisible] = useState(false);
    const [successPopupVisible,    setSuccessPopupVisible]    = useState(false);
    const [joinedClassName,        setJoinedClassName]        = useState('');

    // ── Fetch enrolled class ──────────────────────────────────────────────────
    const fetchEnrolledClass = async () => {
        if (!studentId) return;
        try {
            setLoadingClass(true);
            setClassError('');
            const classData = await getStudentClass(studentId);
            setEnrolledClass(classData);
        } catch (error) {
            console.error('Error fetching enrolled class:', error);
            setClassError('Failed to load your class. Please try again.');
            setEnrolledClass(null);
        } finally {
            setLoadingClass(false);
        }
    };

    useEffect(() => {
        fetchEnrolledClass();
    }, [studentId]);

    // ── Join class handlers ───────────────────────────────────────────────────

    /**
     * Guard: if student is already enrolled, show the custom popup instead of
     * opening the join modal.
     */
    const handleJoinPress = () => {
        if (enrolledClass) {
            setAlreadyEnrolledVisible(true);
            return;
        }
        setJoinModalVisible(true);
    };

    const handleJoinClass = async () => {
        if (!joinCode.trim()) {
            setJoinError('Please enter a class code.');
            return;
        }

        setJoining(true);
        setJoinError('');

        try {
            const result = await joinClass(studentId, joinCode.trim());

            // Close the join sheet, then show the success popup
            setJoinModalVisible(false);
            setJoinCode('');
            setJoinedClassName(result.className || '');
            setSuccessPopupVisible(true);

            await fetchEnrolledClass();
        } catch (error: any) {
            setJoinError(error.message);
        } finally {
            setJoining(false);
        }
    };

    const closeJoinModal = () => {
        setJoinModalVisible(false);
        setJoinCode('');
        setJoinError('');
    };

    // ── Menu / logout ─────────────────────────────────────────────────────────
    const handleLogoutPress = () => { setMenuVisible(false); setLogoutVisible(true); };
    const confirmLogout     = async () => { setLogoutVisible(false); await handleLogout(); };
    const cancelLogout      = () => setLogoutVisible(false);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safeArea}>
            <BubbleBackground />

            {/* Header */}
            <View style={upperNav.header}>
                <TouchableOpacity style={upperNav.touchable} onPress={handleBackStep}>
                    <Image
                        style={upperNav.backButtonIcon}
                        source={require('../../../assets/icons/BackButton-icon.png')}
                    />
                </TouchableOpacity>
                <Image
                    style={upperNav.ciscLogo}
                    source={require('../../../assets/images/cisckids.png')}
                />
                <TouchableOpacity style={upperNav.touchable} onPress={() => setMenuVisible(!menuVisible)}>
                    <Image
                        style={upperNav.menuIcon}
                        source={require('../../../assets/icons/Menu-icon.png')}
                    />
                </TouchableOpacity>
            </View>

            {menuVisible && (
                <View style={upperNav.dropdownMenu}>
                    <TouchableOpacity onPress={handleLogoutPress} style={upperNav.logoutButton}>
                        <Image
                            source={require('../../../assets/icons/Logout-icon.png')}
                            style={upperNav.logoutIcon}
                        />
                        <Text style={upperNav.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            )}
            {menuVisible && (
                <TouchableOpacity
                    style={upperNav.closeMenu}
                    onPress={() => setMenuVisible(false)}
                    activeOpacity={1}
                />
            )}

            <LogoutModal
                visible={logoutVisible}
                onCancel={cancelLogout}
                onConfirm={confirmLogout}
            />

            {/* Page content */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.pageTitle}>My Class</Text>
                <Text style={styles.pageSubtitle}>View your current enrollment</Text>

                {/* Loading */}
                {loadingClass && (
                    <View style={styles.stateBox}>
                        <ActivityIndicator size="large" color={COLORS.teal} />
                        <Text style={styles.stateText}>Loading your class…</Text>
                    </View>
                )}

                {/* Error */}
                {!loadingClass && classError ? (
                    <View style={[styles.stateBox, styles.errorBox]}>
                        <Text style={styles.errorIcon}>⚠</Text>
                        <Text style={styles.errorText}>{classError}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={fetchEnrolledClass}>
                            <Text style={styles.retryText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {/* Not enrolled */}
                {!loadingClass && !classError && !enrolledClass && (
                    <View style={styles.emptyCard}>
                        <View style={styles.emptyIconCircle}>
                            <Image
                                source={require('../../../assets/icons/Empty-Class-icon.png')}
                                style={styles.emptyIcon}
                            />
                        </View>
                        <Text style={styles.emptyTitle}>No Class Yet</Text>
                        <Text style={styles.emptyBody}>
                            Ask your teacher for a class code and tap{' '}
                            <Text style={styles.emptyHighlight}>Join a Class</Text> to get started.
                        </Text>
                    </View>
                )}

                {/* Enrolled class card */}
                {!loadingClass && !classError && enrolledClass && (
                    <View style={styles.classCard}>
                        <View style={styles.cardAccentStrip} />

                        <View style={styles.statusRow}>
                            <View style={[
                                styles.statusPill,
                                enrolledClass.status === 'active' ? styles.statusActive : styles.statusArchived,
                            ]}>
                                <View style={[
                                    styles.statusDot,
                                    { backgroundColor: enrolledClass.status === 'active' ? COLORS.success : COLORS.textMuted },
                                ]} />
                                <Text style={[
                                    styles.statusText,
                                    { color: enrolledClass.status === 'active' ? COLORS.success : COLORS.textMuted },
                                ]}>
                                    {enrolledClass.status === 'active' ? 'Active' : 'Archived'}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.cardClassName}>
                            {enrolledClass.className || 'Unnamed Class'}
                        </Text>

                        <View style={styles.cardDivider} />

                        <View style={styles.infoGrid}>
                            <InfoRow icon="🎓" label="Grade Level"   value={`Grade ${enrolledClass.gradeLevel}`} />
                            <InfoRow icon="📅" label="Academic Year" value={enrolledClass.acadYear} />
                            <InfoRow icon="👥" label="Classmates"    value={`${enrolledClass.studentIds?.length ?? 0} students`} />
                        </View>

                        <View style={styles.codeCard}>
                            <Text style={styles.codeCardLabel}>Class Code</Text>
                            <Text style={styles.codeCardValue}>{enrolledClass.classCode}</Text>
                            <Text style={styles.codeCardHint}>Share this code with classmates</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Floating Join button */}
            {!loadingClass && (
                <View style={styles.fabContainer}>
                    <TouchableOpacity
                        style={[
                            styles.fabButton,
                            enrolledClass ? styles.fabButtonDisabled : styles.fabButtonActive,
                        ]}
                        onPress={handleJoinPress}
                        activeOpacity={0.82}
                    >
                        <Text style={styles.fabIcon}>＋</Text>
                        <Text style={styles.fabText}>Join a Class</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Join class bottom sheet */}
            <Modal
                visible={joinModalVisible}
                transparent
                animationType="slide"
                onRequestClose={closeJoinModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.sheetHandle} />

                        <Text style={styles.modalTitle}>Join a Class</Text>
                        <Text style={styles.modalSubtitle}>
                            Enter the 6-character code your teacher gave you
                        </Text>

                        <View style={[styles.codeInputWrapper, joinError ? styles.codeInputError : null]}>
                            <TextInput
                                style={styles.codeInput}
                                placeholder="e.g. ABC123"
                                placeholderTextColor={COLORS.textMuted}
                                value={joinCode}
                                onChangeText={(text) => {
                                    setJoinCode(text);
                                    if (joinError) setJoinError('');
                                }}
                                autoCapitalize="characters"
                                autoCorrect={false}
                                maxLength={10}
                                textAlign="center"
                            />
                        </View>

                        {joinError ? (
                            <View style={styles.inlineErrorBox}>
                                <Text style={styles.inlineErrorText}>{joinError}</Text>
                            </View>
                        ) : null}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={closeJoinModal}
                                disabled={joining}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.joinSubmitButton, joining && styles.joinSubmitButtonBusy]}
                                onPress={handleJoinClass}
                                disabled={joining}
                                activeOpacity={0.82}
                            >
                                {joining
                                    ? <ActivityIndicator size="small" color="#fff" />
                                    : <Text style={styles.joinSubmitText}>Join</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ── Custom popups (no Alert) ── */}
            <AlreadyEnrolledPopup
                visible={alreadyEnrolledVisible}
                onClose={() => setAlreadyEnrolledVisible(false)}
            />
            <JoinSuccessPopup
                visible={successPopupVisible}
                className={joinedClassName}
                onClose={() => setSuccessPopupVisible(false)}
            />
        </SafeAreaView>
    );
}

// ─── Popup styles (shared between AlreadyEnrolledPopup & JoinSuccessPopup) ────

const popupStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.50)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    card: {
        width: '100%',
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        paddingHorizontal: 28,
        paddingTop: 32,
        paddingBottom: 28,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
    },

    // Icon circle
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1.5,
    },
    iconCircleWarning: {
        backgroundColor: COLORS.warningLight,
        borderColor: COLORS.warningBorder,
    },
    iconCircleSuccess: {
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
    },
    iconEmoji: {
        fontSize: 34,
    },

    // Text
    title: {
        fontSize: 22,
        fontFamily: 'Satoshi-Bold',
        color: COLORS.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    body: {
        fontSize: 14,
        fontFamily: 'Satoshi-Regular',
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },
    bodyBold: {
        fontFamily: 'Satoshi-Bold',
        color: COLORS.text,
    },

    // CTA button
    actionButton: {
        width: '100%',
        paddingVertical: 15,
        borderRadius: 14,
        alignItems: 'center',
        elevation: 2,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22,
        shadowRadius: 6,
    },
    actionButtonWarning: {
        backgroundColor: COLORS.warning,
        shadowColor: COLORS.warning,
    },
    actionButtonSuccess: {
        backgroundColor: COLORS.teal,
        shadowColor: COLORS.tealDark,
    },
    actionButtonText: {
        fontSize: 16,
        fontFamily: 'Satoshi-Bold',
        color: '#FFF',
    },
});

// ─── Page styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 120,
    },

    pageTitle: {
        fontSize: 30,
        fontFamily: 'Satoshi-Bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    pageSubtitle: {
        fontSize: 14,
        fontFamily: 'Satoshi-Regular',
        color: COLORS.textSecondary,
        marginBottom: 28,
    },

    stateBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 56,
        gap: 12,
    },
    stateText: {
        fontSize: 15,
        fontFamily: 'Satoshi-Medium',
        color: COLORS.textSecondary,
    },

    errorBox: {
        backgroundColor: COLORS.dangerLight,
        borderRadius: 16,
        paddingHorizontal: 24,
    },
    errorIcon: {
        fontSize: 32,
    },
    errorText: {
        fontSize: 15,
        fontFamily: 'Satoshi-Medium',
        color: COLORS.danger,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 4,
        backgroundColor: COLORS.teal,
        paddingHorizontal: 28,
        paddingVertical: 10,
        borderRadius: 20,
    },
    retryText: {
        color: '#FFF',
        fontFamily: 'Satoshi-Bold',
        fontSize: 15,
    },

    emptyCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    emptyIconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: COLORS.tealLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyIcon: {
        width: 52,
        height: 52,
        tintColor: COLORS.teal,
    },
    emptyTitle: {
        fontSize: 22,
        fontFamily: 'Satoshi-Bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    emptyBody: {
        fontSize: 14,
        fontFamily: 'Satoshi-Regular',
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    emptyHighlight: {
        fontFamily: 'Satoshi-Bold',
        color: COLORS.teal,
    },

    classCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: COLORS.tealDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
    },
    cardAccentStrip: {
        height: 6,
        backgroundColor: COLORS.teal,
    },
    statusRow: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 4,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 6,
    },
    statusActive:   { backgroundColor: '#E8F5E9' },
    statusArchived: { backgroundColor: '#F5F5F5' },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'Satoshi-Bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardClassName: {
        fontSize: 26,
        fontFamily: 'Satoshi-Bold',
        color: COLORS.text,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 20,
    },
    cardDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 20,
        marginBottom: 20,
    },
    infoGrid: {
        paddingHorizontal: 20,
        gap: 14,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    infoIcon: {
        fontSize: 22,
        width: 32,
        textAlign: 'center',
    },
    infoText: { flex: 1 },
    infoLabel: {
        fontSize: 11,
        fontFamily: 'Satoshi-Medium',
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 1,
    },
    infoValue: {
        fontSize: 16,
        fontFamily: 'Satoshi-Bold',
        color: COLORS.text,
    },
    codeCard: {
        backgroundColor: COLORS.tealLight,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.tealMid,
    },
    codeCardLabel: {
        fontSize: 11,
        fontFamily: 'Satoshi-Medium',
        color: COLORS.tealDark,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 4,
    },
    codeCardValue: {
        fontSize: 28,
        fontFamily: 'Satoshi-Bold',
        color: COLORS.tealDark,
        letterSpacing: 4,
        marginBottom: 4,
    },
    codeCardHint: {
        fontSize: 12,
        fontFamily: 'Satoshi-Regular',
        color: COLORS.teal,
    },

    fabContainer: {
        position: 'absolute',
        bottom: 28,
        left: 20,
        right: 20,
    },
    fabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 18,
        gap: 8,
        elevation: 6,
        shadowColor: COLORS.tealDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    fabButtonActive:   { backgroundColor: COLORS.teal },
    fabButtonDisabled: { backgroundColor: '#B0C4C3' },
    fabIcon: {
        fontSize: 20,
        color: '#FFF',
        lineHeight: 22,
    },
    fabText: {
        fontSize: 17,
        fontFamily: 'Satoshi-Bold',
        color: '#FFF',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 28,
        paddingBottom: 48,
    },
    sheetHandle: {
        width: 44,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.border,
        alignSelf: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontFamily: 'Satoshi-Bold',
        color: COLORS.text,
        marginBottom: 6,
    },
    modalSubtitle: {
        fontSize: 14,
        fontFamily: 'Satoshi-Regular',
        color: COLORS.textSecondary,
        marginBottom: 28,
        lineHeight: 20,
    },
    codeInputWrapper: {
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 14,
        backgroundColor: '#FAFAFA',
        marginBottom: 12,
    },
    codeInputError: {
        borderColor: COLORS.danger,
    },
    codeInput: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 22,
        fontFamily: 'Satoshi-Bold',
        color: COLORS.text,
        letterSpacing: 4,
    },
    inlineErrorBox: {
        backgroundColor: COLORS.dangerLight,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 20,
    },
    inlineErrorText: {
        fontSize: 13,
        fontFamily: 'Satoshi-Medium',
        color: COLORS.danger,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 14,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: 'Satoshi-Bold',
        color: COLORS.textSecondary,
    },
    joinSubmitButton: {
        flex: 2,
        paddingVertical: 15,
        borderRadius: 14,
        backgroundColor: COLORS.teal,
        alignItems: 'center',
        elevation: 3,
        shadowColor: COLORS.tealDark,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    joinSubmitButtonBusy: {
        backgroundColor: COLORS.tealMid,
    },
    joinSubmitText: {
        fontSize: 16,
        fontFamily: 'Satoshi-Bold',
        color: '#FFF',
    },
});