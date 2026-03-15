import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Modal,
    TextInput,
    ActivityIndicator,
    StyleSheet,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from "../../Controller/NavigationController";
import { getAuth } from "@react-native-firebase/auth";
import { joinClass, getStudentClass } from "../../Controller/AuthenticationController";
import BubbleBackground from "../../Components/GlobalUse/BubbleBackground";
import user from "../../UI_Designs/UserStyle";
import upperNav from "../../UI_Designs/UpperNavigation";
import LogoutModal from "../../Components/GlobalUse/Logout_Modal";
import { ClassDocument } from "../../Interfaces/dataInterfaces";

export default function StudentMyClass() {
    // ========== AUTH ==========
    const currentUser = getAuth().currentUser;
    const studentId = currentUser?.uid || '';

    // ========== NAVIGATION & MENU ==========
    const { handleLogout, handleBackStep } = useNavigationHelper();
    const [menuVisible, setMenuVisible] = useState(false);
    const [logoutVisible, setLogoutVisible] = useState(false);

    // ========== ENROLLED CLASS STATE ==========
    const [enrolledClass, setEnrolledClass] = useState<ClassDocument | null>(null);
    const [loadingClass, setLoadingClass] = useState(true);
    const [classError, setClassError] = useState('');

    // ========== JOIN CLASS MODAL STATE ==========
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [joinError, setJoinError] = useState('');

    // ========== FETCH CURRENT ENROLLED CLASS ==========
    const fetchEnrolledClass = async () => {
        if (!studentId) return;

        try {
            setLoadingClass(true);
            setClassError('');
            const classData = await getStudentClass(studentId); // ✅ clean & direct
            setEnrolledClass(classData); // will be null if no class enrolled
            console.log('This is the class: ' + classData?.acadYear)
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

    // ========== JOIN CLASS HANDLER ==========
    const handleJoinClass = async () => {
        if (!joinCode.trim()) {
            setJoinError('Please enter a class code.');
            return;
        }

        setJoining(true);
        setJoinError('');

        try {
            const result = await joinClass(studentId, joinCode.trim());

            // Success – close modal, clear input, refresh class data
            Alert.alert('Success', `You have joined ${result.className}!`);
            setJoinModalVisible(false);
            setJoinCode('');

            // ✅ Refresh using getStudentClass
            await fetchEnrolledClass(); // simple refetch
        } catch (error: any) {
            setJoinError(error.message);
        } finally {
            setJoining(false);
        }
    };

    // ========== MENU & LOGOUT HANDLERS ==========
    const toggleMenu = () => setMenuVisible(!menuVisible);
    const handleLogoutPress = () => {
        setMenuVisible(false);
        setLogoutVisible(true);
    };
    const confirmLogout = async () => {
        setLogoutVisible(false);
        await handleLogout();
    };
    const cancelLogout = () => setLogoutVisible(false);

    // ========== RENDER ==========
    return (
        <SafeAreaView style={user.container}>
            <BubbleBackground />

            {/* HEADER */}
            <View style={upperNav.header}>
                <TouchableOpacity style={upperNav.touchable} onPress={handleBackStep}>
                    <Image source={require('../../../assets/icons/BackButton-icon.png')} />
                </TouchableOpacity>
                <Image
                    style={upperNav.ciscLogo}
                    source={require('../../../assets/images/cisckids.png')}
                />
                <TouchableOpacity style={upperNav.touchable} onPress={toggleMenu}>
                    <Image
                        style={upperNav.menuIcon}
                        source={require('../../../assets/icons/Menu-icon.png')}
                    />
                </TouchableOpacity>
            </View>

            {/* OVERLAY MENU CLOSE */}
            {menuVisible && (
                <TouchableOpacity
                    style={upperNav.closeMenu}
                    onPress={() => setMenuVisible(false)}
                    activeOpacity={1}
                />
            )}

            {/* LOGOUT MODAL */}
            <LogoutModal
                visible={logoutVisible}
                onCancel={cancelLogout}
                onConfirm={confirmLogout}
            />

            {/* ========== MAIN CONTENT ========== */}
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>My Class</Text>

                {/* Loading State */}
                {loadingClass && (
                    <View style={styles.centerState}>
                        <ActivityIndicator size="large" color="#57b8b3" />
                        <Text style={styles.loadingText}>Loading your class...</Text>
                    </View>
                )}

                {/* Error State */}
                {!loadingClass && classError && (
                    <View style={styles.centerState}>
                        <Text style={styles.errorText}>{classError}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={fetchEnrolledClass}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* No Class Enrolled */}
                {!loadingClass && !classError && !enrolledClass && (
                    <View style={styles.centerState}>
                        <Image
                            source={require('../../../assets/icons/Empty-Class-icon.png')}
                            style={styles.emptyIcon}
                        />
                        <Text style={styles.emptyText}>You are not enrolled in any class yet.</Text>
                        <TouchableOpacity
                            style={styles.joinButton}
                            onPress={() => setJoinModalVisible(true)}
                        >
                            <Text style={styles.joinButtonText}>Join a Class</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Enrolled Class Details */}
                {!loadingClass && !classError && enrolledClass && (
                    <View style={styles.classCard}>
                        <View style={styles.classHeader}>
                            <Text style={styles.className}>{enrolledClass.className}</Text>
                            <View style={styles.classCodeBadge}>
                                <Text style={styles.classCodeLabel}>Code:</Text>
                                <Text style={styles.classCodeValue}>{enrolledClass.classCode}</Text>
                            </View>
                        </View>


                        {enrolledClass.className && (
                            <Text style={styles.section}>📚 Section: {enrolledClass.className}</Text>
                        )}
                        {enrolledClass.classCode && (
                            <Text style={styles.description}>
                                {enrolledClass.classCode}
                            </Text>
                        )}

                        <TouchableOpacity
                            style={styles.changeClassButton}
                            onPress={() => setJoinModalVisible(true)}
                        >
                            <Text style={styles.changeClassText}>Join another class</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* ========== JOIN CLASS MODAL ========== */}
            <Modal
                visible={joinModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setJoinModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Join a Class</Text>
                        <Text style={styles.modalSubtitle}>Enter the 6-digit class code</Text>

                        <TextInput
                            style={styles.codeInput}
                            placeholder="e.g. ABC123"
                            placeholderTextColor="#999"
                            textAlign='center'
                            value={joinCode}
                            onChangeText={setJoinCode}
                            autoCapitalize="characters"
                            maxLength={10}
                        />

                        {joinError ? <Text style={styles.modalError}>{joinError}</Text> : null}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setJoinModalVisible(false);
                                    setJoinCode('');
                                    setJoinError('');
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.submitButton]}
                                onPress={handleJoinClass}
                                disabled={joining}
                            >
                                {joining ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Join</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// (styles remain exactly the same as before – no changes needed)
// ========== LOCAL STYLES ==========
const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 28,
        fontFamily: 'Satoshi-Bold',
        color: '#1E1E1E',
        marginBottom: 20,
        textAlign: 'center',
    },
    centerState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -50, // adjust vertical centering
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        fontFamily: 'Satoshi-Medium',
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        fontFamily: 'Satoshi-Medium',
        color: '#D32F2F',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#57b8b3',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontFamily: 'Satoshi-Bold',
        fontSize: 16,
    },
    emptyIcon: {
        width: 100,
        height: 100,
        marginBottom: 16,
        tintColor: '#CCCCCC',
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'Satoshi-Medium',
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    joinButton: {
        backgroundColor: '#57b8b3',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 30,
        elevation: 3,
    },
    joinButtonText: {
        color: '#fff',
        fontFamily: 'Satoshi-Bold',
        fontSize: 18,
    },
    classCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        marginBottom: 20,
    },
    classHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    className: {
        fontSize: 22,
        fontFamily: 'Satoshi-Bold',
        color: '#1E1E1E',
        flex: 1,
    },
    classCodeBadge: {
        flexDirection: 'row',
        backgroundColor: '#ECFBFF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    classCodeLabel: {
        fontSize: 12,
        fontFamily: 'Satoshi-Medium',
        color: '#57b8b3',
        marginRight: 4,
    },
    classCodeValue: {
        fontSize: 14,
        fontFamily: 'Satoshi-Bold',
        color: '#2C6975',
    },
    teacherName: {
        fontSize: 16,
        fontFamily: 'Satoshi-Medium',
        color: '#444',
        marginBottom: 6,
    },
    section: {
        fontSize: 16,
        fontFamily: 'Satoshi-Medium',
        color: '#444',
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        fontFamily: 'Satoshi-Regular',
        color: '#666',
        marginTop: 8,
        lineHeight: 20,
    },
    changeClassButton: {
        marginTop: 20,
        alignSelf: 'flex-end',
    },
    changeClassText: {
        color: '#57b8b3',
        fontFamily: 'Satoshi-Bold',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontFamily: 'Satoshi-Bold',
        color: '#1E1E1E',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        fontFamily: 'Satoshi-Medium',
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    codeInput: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 18,
        fontFamily: 'Satoshi-Medium',
        backgroundColor: '#F9F9F9',
        textAlign: 'center',
        letterSpacing: 2,
    },
    modalError: {
        color: '#D32F2F',
        fontFamily: 'Satoshi-Medium',
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 28,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 6,
    },
    cancelButton: {
        backgroundColor: '#F0F0F0',
    },
    cancelButtonText: {
        color: '#333',
        fontFamily: 'Satoshi-Bold',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#57b8b3',
    },
    submitButtonText: {
        color: '#fff',
        fontFamily: 'Satoshi-Bold',
        fontSize: 16,
    },
});