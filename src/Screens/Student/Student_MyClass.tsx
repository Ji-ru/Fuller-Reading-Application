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
import Svg, { Text as SvgText } from 'react-native-svg';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { getAuth } from '@react-native-firebase/auth';
import { joinClass, getStudentClass, leaveClass } from '../../Controller/AuthenticationController';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import upperNav from '../../UI_Designs/UpperNavigation';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { ClassDocument } from '../../Interfaces/dataInterfaces';
import { sw, sh, sf } from '../../Utils/responsive';

// ─── Design tokens ────────────────────────────────────────────────────────────

const COLORS = {
    teal: '#57b8b3',
    tealDark: '#2C6975',
    tealLight: '#ECFBFF',
    tealMid: '#A8DDD9',
    text: '#1E1E1E',
    textSecondary: '#666666',
    textMuted: '#AAAAAA',
    surface: '#FFFFFF',
    background: '#F4F7FA',
    border: '#E4EAF0',
    danger: '#D32F2F',
    dangerLight: '#FFF0F0',
    success: '#4CAF50',
    warning: '#F59E0B',
    warningLight: '#FFFBEB',
    warningBorder: '#FDE68A',
};

const C = {
    white: '#ffffff',
    ink: '#1b2e23',
};

// ─── MenuBars (from History) ──────────────────────────────────────────────────

function MenuBars() {
    return (
        <View style={{ width: 22, height: 16, justifyContent: 'space-between' }}>
            <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
            <View style={{ width: 16, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
            <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
        </View>
    );
}

// ─── Header styles (from History) ────────────────────────────────────────────

const headerStyles = StyleSheet.create({
    menuBtn: {
        width: 48, height: 48,
        borderRadius: 14,
        backgroundColor: C.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
    },
    backBtn: {
        width: 45, height: 45, borderRadius: 10,
        backgroundColor: '#008443',
        justifyContent: 'center', alignItems: 'center',
    },
    backArrowText: {
        fontSize: 40, fontFamily: 'Nunito-Bold',
        color: C.white, lineHeight: 28, marginLeft: -2, paddingBottom: 2,
    },
});

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

const AlreadyEnrolledPopup: React.FC<AlreadyEnrolledPopupProps> = ({ visible, onClose }) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
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

const JoinSuccessPopup: React.FC<JoinSuccessPopupProps> = ({ visible, className, onClose }) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
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

// ─── LeaveClassPopup ─────────────────────────────────────────────────────────

interface LeaveClassPopupProps {
    visible: boolean;
    className: string;
    leaving: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const LeaveClassPopup: React.FC<LeaveClassPopupProps> = ({ visible, className, leaving, onClose, onConfirm }) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={popupStyles.overlay}>
            <View style={popupStyles.card}>
                <View style={[popupStyles.iconCircle, popupStyles.iconCircleDanger]}>
                    <Text style={popupStyles.iconEmoji}>🚪</Text>
                </View>
                <Text style={popupStyles.title}>Leave Class?</Text>
                <Text style={popupStyles.body}>
                    Are you sure you want to leave{'\n'}
                    <Text style={popupStyles.bodyBold}>{className}</Text>?
                    {'\n\n'}
                    You will no longer be part of this class.
                </Text>
                <View style={popupStyles.buttonRow}>
                    <TouchableOpacity
                        style={[popupStyles.actionButton, popupStyles.actionButtonCancel, { flex: 1, marginRight: sw(8) }]}
                        onPress={onClose}
                        disabled={leaving}
                        activeOpacity={0.82}
                    >
                        <Text style={popupStyles.actionButtonCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[popupStyles.actionButton, popupStyles.actionButtonDanger, { flex: 1, marginLeft: sw(8) }]}
                        onPress={onConfirm}
                        disabled={leaving}
                        activeOpacity={0.82}
                    >
                        {leaving ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={popupStyles.actionButtonText}>Leave</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);

// ─── Main component ───────────────────────────────────────────────────────────

export default function StudentMyClass() {
    const currentUser = getAuth().currentUser;
    const studentId = currentUser?.uid || '';

    const { handleLogout, handleBackStep } = useNavigationHelper();
    const [menuVisible, setMenuVisible] = useState(false);
    const [logoutVisible, setLogoutVisible] = useState(false);

    const [enrolledClass, setEnrolledClass] = useState<ClassDocument | null>(null);
    const [loadingClass, setLoadingClass] = useState(true);
    const [classError, setClassError] = useState('');

    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [joinError, setJoinError] = useState('');

    const [alreadyEnrolledVisible, setAlreadyEnrolledVisible] = useState(false);
    const [successPopupVisible, setSuccessPopupVisible] = useState(false);
    const [joinedClassName, setJoinedClassName] = useState('');

    const [leaveModalVisible, setLeaveModalVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);

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

    useEffect(() => { fetchEnrolledClass(); }, [studentId]);

    const handleJoinPress = () => {
        if (enrolledClass) { setAlreadyEnrolledVisible(true); return; }
        setJoinModalVisible(true);
    };

    const handleJoinClass = async () => {
        if (!joinCode.trim()) { setJoinError('Please enter a class code.'); return; }
        setJoining(true);
        setJoinError('');
        try {
            const result = await joinClass(studentId, joinCode.trim());
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

    const closeJoinModal = () => { setJoinModalVisible(false); setJoinCode(''); setJoinError(''); };

    const handleLeavePress = () => setLeaveModalVisible(true);

    const handleLeaveClass = async () => {
        if (!enrolledClass || !studentId) return;
        setLeaving(true);
        try {
            await leaveClass(studentId, enrolledClass.classId);
            setEnrolledClass(null);
            setLeaveModalVisible(false);
        } catch (error: any) {
            console.error('Error leaving class:', error);
            // Optionally, we could show a toast or error message here
        } finally {
            setLeaving(false);
        }
    };

    const handleLogoutPress = () => { setMenuVisible(false); setLogoutVisible(true); };
    const confirmLogout = async () => { setLogoutVisible(false); await handleLogout(); };
    const cancelLogout = () => setLogoutVisible(false);

    return (
        <SafeAreaView style={styles.safeArea}>
            <BubbleBackground />

            {/* ── Header (History style) ──────────────────────────────────── */}
            <View style={upperNav.header}>
                <TouchableOpacity style={headerStyles.backBtn} onPress={handleBackStep} activeOpacity={0.7}>
                    <Text style={headerStyles.backArrowText}>‹</Text>
                </TouchableOpacity>

                <Svg height={60} width={200}>
                    <SvgText
                        x={100} y={35} fontSize={23}
                        fontFamily="Nunito-Black" textAnchor="middle"
                        fill="none" stroke="#E8F5E9" strokeWidth={8} strokeLinejoin="round"
                    >
                        My Class
                    </SvgText>
                    <SvgText
                        x={100} y={35} fontSize={23}
                        fontFamily="Nunito-Black" textAnchor="middle"
                        fill="#1B5E20"
                    >
                        My Class
                    </SvgText>
                </Svg>

                <TouchableOpacity style={headerStyles.menuBtn} onPress={() => setMenuVisible(v => !v)} activeOpacity={0.7}>
                    <MenuBars />
                </TouchableOpacity>
            </View>

            {menuVisible && (
                <View style={upperNav.dropdownMenu}>
                    <TouchableOpacity onPress={handleLogoutPress} style={upperNav.logoutButton}>
                        <Image source={require('../../../assets/icons/Logout-icon.png')} style={upperNav.logoutIcon} />
                        <Text style={upperNav.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            )}
            {menuVisible && (
                <TouchableOpacity style={upperNav.closeMenu} onPress={() => setMenuVisible(false)} activeOpacity={1} />
            )}

            <LogoutModal visible={logoutVisible} onCancel={cancelLogout} onConfirm={confirmLogout} />

            {/* ── Page content ────────────────────────────────────────────── */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                {loadingClass && (
                    <View style={styles.stateBox}>
                        <ActivityIndicator size="large" color={COLORS.teal} />
                        <Text style={styles.stateText}>Loading your class…</Text>
                    </View>
                )}

                {!loadingClass && classError ? (
                    <View style={[styles.stateBox, styles.errorBox]}>
                        <Text style={styles.errorIcon}>⚠</Text>
                        <Text style={styles.errorText}>{classError}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={fetchEnrolledClass}>
                            <Text style={styles.retryText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

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
                            <InfoRow icon="🎓" label="Grade Level" value={`Grade ${enrolledClass.gradeLevel}`} />
                            <InfoRow icon="📅" label="Academic Year" value={enrolledClass.acadYear} />
                            <InfoRow icon="👥" label="Classmates" value={`${enrolledClass.studentIds?.length ?? 0} students`} />
                        </View>

                        <View style={styles.codeCard}>
                            <Text style={styles.codeCardLabel}>Class Code</Text>
                            <Text style={styles.codeCardValue}>{enrolledClass.classCode}</Text>
                            <Text style={styles.codeCardHint}>Share this code with classmates</Text>
                        </View>

                        <TouchableOpacity 
                            style={styles.leaveClassButton}
                            onPress={handleLeavePress}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.leaveClassText}>Leave Class</Text>
                        </TouchableOpacity>
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
            <Modal visible={joinModalVisible} transparent animationType="slide" onRequestClose={closeJoinModal}>
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
                                onChangeText={(text) => { setJoinCode(text); if (joinError) setJoinError(''); }}
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
                            <TouchableOpacity style={styles.cancelButton} onPress={closeJoinModal} disabled={joining}>
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

            <AlreadyEnrolledPopup visible={alreadyEnrolledVisible} onClose={() => setAlreadyEnrolledVisible(false)} />
            <JoinSuccessPopup visible={successPopupVisible} className={joinedClassName} onClose={() => setSuccessPopupVisible(false)} />
            <LeaveClassPopup 
                visible={leaveModalVisible} 
                className={enrolledClass?.className || ''} 
                leaving={leaving} 
                onClose={() => setLeaveModalVisible(false)} 
                onConfirm={handleLeaveClass} 
            />
        </SafeAreaView>
    );
}

// ─── Popup styles ─────────────────────────────────────────────────────────────

const popupStyles = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.50)',
        justifyContent: 'center', alignItems: 'center', paddingHorizontal: sw(32),
    },
    card: {
        width: '100%', backgroundColor: COLORS.surface, borderRadius: sw(24),
        paddingHorizontal: sw(28), paddingTop: sh(32), paddingBottom: sh(28),
        alignItems: 'center', elevation: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: sw(8) },
        shadowOpacity: 0.18, shadowRadius: sw(20),
    },
    iconCircle: {
        width: sw(72), height: sw(72), borderRadius: sw(36),
        alignItems: 'center', justifyContent: 'center',
        marginBottom: sh(20), borderWidth: 1.5,
    },
    iconCircleWarning: { backgroundColor: COLORS.warningLight, borderColor: COLORS.warningBorder },
    iconCircleSuccess: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
    iconCircleDanger: { backgroundColor: COLORS.dangerLight, borderColor: '#FECACA' },
    iconEmoji: { fontSize: sf(34) },
    title: {
        fontSize: sf(22), fontFamily: 'Satoshi-Bold', color: COLORS.text,
        marginBottom: sh(12), textAlign: 'center',
    },
    body: {
        fontSize: sf(14), fontFamily: 'Satoshi-Regular', color: COLORS.textSecondary,
        textAlign: 'center', lineHeight: sf(22), marginBottom: sh(28),
    },
    bodyBold: { fontFamily: 'Satoshi-Bold', color: COLORS.text },
    actionButton: {
        width: '100%', paddingVertical: sh(15), borderRadius: sw(14),
        alignItems: 'center', elevation: 2,
        shadowOffset: { width: 0, height: sw(3) }, shadowOpacity: 0.22, shadowRadius: sw(6),
    },
    buttonRow: { flexDirection: 'row', width: '100%' },
    actionButtonCancel: { backgroundColor: '#F3F4F6', elevation: 0, shadowOpacity: 0 },
    actionButtonCancelText: { fontSize: sf(16), fontFamily: 'Satoshi-Bold', color: '#4B5563' },
    actionButtonWarning: { backgroundColor: COLORS.warning, shadowColor: COLORS.warning },
    actionButtonSuccess: { backgroundColor: COLORS.teal, shadowColor: COLORS.tealDark },
    actionButtonDanger: { backgroundColor: COLORS.danger, shadowColor: '#991B1B' },
    actionButtonText: { fontSize: sf(16), fontFamily: 'Satoshi-Bold', color: '#FFF' },
});

// ─── Page styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background, padding: sh(4), paddingTop: sh(20) },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: sw(20), paddingTop: sh(16), paddingBottom: sh(120) },

    pageTitle: { fontSize: sf(30), fontFamily: 'Satoshi-Bold', color: COLORS.text, marginBottom: sh(4) },
    pageSubtitle: { fontSize: sf(14), fontFamily: 'Satoshi-Regular', color: COLORS.textSecondary, marginBottom: sh(28) },

    stateBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: sh(56), gap: sw(12) },
    stateText: { fontSize: sf(15), fontFamily: 'Satoshi-Medium', color: COLORS.textSecondary },

    errorBox: { backgroundColor: COLORS.dangerLight, borderRadius: sw(16), paddingHorizontal: sw(24) },
    errorIcon: { fontSize: sf(32) },
    errorText: { fontSize: sf(15), fontFamily: 'Satoshi-Medium', color: COLORS.danger, textAlign: 'center' },
    retryButton: { marginTop: sh(4), backgroundColor: COLORS.teal, paddingHorizontal: sw(28), paddingVertical: sh(10), borderRadius: sw(20) },
    retryText: { color: '#FFF', fontFamily: 'Satoshi-Bold', fontSize: sf(15) },

    emptyCard: {
        backgroundColor: COLORS.surface, borderRadius: sw(20), padding: sw(32),
        alignItems: 'center', elevation: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: sw(2) },
        shadowOpacity: 0.06, shadowRadius: sw(8),
    },
    emptyIconCircle: {
        width: sw(96), height: sw(96), borderRadius: sw(48),
        backgroundColor: COLORS.tealLight, alignItems: 'center',
        justifyContent: 'center', marginBottom: sh(20),
    },
    emptyIcon: { width: sw(52), height: sw(52), tintColor: COLORS.teal },
    emptyTitle: { fontSize: sf(22), fontFamily: 'Satoshi-Bold', color: COLORS.text, marginBottom: sh(10) },
    emptyBody: { fontSize: sf(14), fontFamily: 'Satoshi-Regular', color: COLORS.textSecondary, textAlign: 'center', lineHeight: sf(22) },
    emptyHighlight: { fontFamily: 'Satoshi-Bold', color: COLORS.teal },

    classCard: {
        backgroundColor: COLORS.surface, borderRadius: sw(20), overflow: 'hidden',
        elevation: 4, shadowColor: COLORS.tealDark,
        shadowOffset: { width: 0, height: sw(4) }, shadowOpacity: 0.12, shadowRadius: sw(12),
    },
    cardAccentStrip: { height: sw(6), backgroundColor: COLORS.teal },
    statusRow: { paddingHorizontal: sw(20), paddingTop: sh(16), paddingBottom: sh(4) },
    statusPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: sw(12), paddingVertical: sh(4), borderRadius: sw(20), gap: sw(6) },
    statusActive: { backgroundColor: '#E8F5E9' },
    statusArchived: { backgroundColor: '#F5F5F5' },
    statusDot: { width: sw(7), height: sw(7), borderRadius: sw(4) },
    statusText: { fontSize: sf(12), fontFamily: 'Satoshi-Bold', textTransform: 'uppercase', letterSpacing: sf(0.5) },
    cardClassName: { fontSize: sf(26), fontFamily: 'Satoshi-Bold', color: COLORS.text, paddingHorizontal: sw(20), paddingTop: sh(8), paddingBottom: sh(20) },
    cardDivider: { height: sw(1), backgroundColor: COLORS.border, marginHorizontal: sw(20), marginBottom: sh(20) },
    infoGrid: { paddingHorizontal: sw(20), gap: sw(14), marginBottom: sh(24) },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: sw(14) },
    infoIcon: { fontSize: sf(22), width: sw(32), textAlign: 'center' },
    infoText: { flex: 1 },
    infoLabel: { fontSize: sf(11), fontFamily: 'Satoshi-Medium', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: sf(0.5), marginBottom: sh(1) },
    infoValue: { fontSize: sf(16), fontFamily: 'Satoshi-Bold', color: COLORS.text },
    codeCard: { backgroundColor: COLORS.tealLight, marginHorizontal: sw(20), marginBottom: sh(20), borderRadius: sw(14), padding: sw(16), alignItems: 'center', borderWidth: 1, borderColor: COLORS.tealMid },
    codeCardLabel: { fontSize: sf(11), fontFamily: 'Satoshi-Medium', color: COLORS.tealDark, textTransform: 'uppercase', letterSpacing: sf(0.6), marginBottom: sh(4) },
    codeCardValue: { fontSize: sf(28), fontFamily: 'Satoshi-Bold', color: COLORS.tealDark, letterSpacing: sf(4), marginBottom: sh(4) },
    codeCardHint: { fontSize: sf(12), fontFamily: 'Satoshi-Regular', color: COLORS.teal },

    leaveClassButton: { marginHorizontal: sw(20), marginBottom: sh(24), alignItems: 'center', paddingVertical: sh(12), backgroundColor: '#FFF0F0', borderRadius: sw(12) },
    leaveClassText: { fontSize: sf(14), fontFamily: 'Satoshi-Bold', color: COLORS.danger },

    fabContainer: { position: 'absolute', bottom: sh(28), left: sw(20), right: sw(20) },
    fabButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: sh(16), borderRadius: sw(18), gap: sw(8), elevation: 6, shadowColor: COLORS.tealDark, shadowOffset: { width: 0, height: sw(4) }, shadowOpacity: 0.25, shadowRadius: sw(10) },
    fabButtonActive: { backgroundColor: COLORS.teal },
    fabButtonDisabled: { backgroundColor: '#B0C4C3' },
    fabIcon: { fontSize: sf(20), color: '#FFF', lineHeight: sf(22) },
    fabText: { fontSize: sf(17), fontFamily: 'Satoshi-Bold', color: '#FFF' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: sw(28), borderTopRightRadius: sw(28), padding: sw(28), paddingBottom: sh(48) },
    sheetHandle: { width: sw(44), height: sw(4), borderRadius: sw(2), backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: sh(24) },
    modalTitle: { fontSize: sf(24), fontFamily: 'Satoshi-Bold', color: COLORS.text, marginBottom: sh(6) },
    modalSubtitle: { fontSize: sf(14), fontFamily: 'Satoshi-Regular', color: COLORS.textSecondary, marginBottom: sh(28), lineHeight: sf(20) },

    codeInputWrapper: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: sw(14), backgroundColor: '#FAFAFA', marginBottom: sh(12) },
    codeInputError: { borderColor: COLORS.danger },
    codeInput: { paddingHorizontal: sw(16), paddingVertical: sh(16), fontSize: sf(22), fontFamily: 'Satoshi-Bold', color: COLORS.text, letterSpacing: sf(4) },

    inlineErrorBox: { backgroundColor: COLORS.dangerLight, borderRadius: sw(10), paddingHorizontal: sw(14), paddingVertical: sh(10), marginBottom: sh(20) },
    inlineErrorText: { fontSize: sf(13), fontFamily: 'Satoshi-Medium', color: COLORS.danger, textAlign: 'center' },

    modalButtons: { flexDirection: 'row', gap: sw(12), marginTop: sh(8) },
    cancelButton: { flex: 1, paddingVertical: sh(15), borderRadius: sw(14), backgroundColor: COLORS.background, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
    cancelButtonText: { fontSize: sf(16), fontFamily: 'Satoshi-Bold', color: COLORS.textSecondary },
    joinSubmitButton: { flex: 2, paddingVertical: sh(15), borderRadius: sw(14), backgroundColor: COLORS.teal, alignItems: 'center', elevation: 3, shadowColor: COLORS.tealDark, shadowOffset: { width: 0, height: sw(3) }, shadowOpacity: 0.2, shadowRadius: sw(6) },
    joinSubmitButtonBusy: { backgroundColor: COLORS.tealMid },
    joinSubmitText: { fontSize: sf(16), fontFamily: 'Satoshi-Bold', color: '#FFF' },
});