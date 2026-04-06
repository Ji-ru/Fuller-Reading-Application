// adminUserManagementStyles.ts
import { StyleSheet } from "react-native";
import { sw, sh, sf } from '../Utils/responsive';

const adminUserManagment = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFB',
    },
    container: {
        flex: 1,
        paddingHorizontal: sw(16),
        paddingTop: sh(10),
    },
    content: {
        flex: 1,
        paddingTop: sh(16),
    },

    // HEADER SECTION
    headerSection: {
        marginBottom: sh(20),
    },
    title: {
        fontFamily: 'Satoshi-Black',
        fontSize: sf(32),
        color: '#1A1A1A',
        marginBottom: sh(4),
    },
    subtitle: {
        fontFamily: 'Satoshi-Medium',
        fontSize: sf(15),
        color: '#6B7280',
    },

    // SEARCH BAR
    searchContainer: {
        position: 'relative',
        marginBottom: sh(20),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: sw(12),
        paddingHorizontal: sw(16),
        paddingVertical: sh(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: sw(2) },
        shadowOpacity: 0.06,
        shadowRadius: sw(8),
        elevation: 2,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    searchInput: {
        flex: 1,
        paddingVertical: sh(12),
        paddingLeft: sw(12),
        fontFamily: 'Satoshi-Medium',
        fontSize: sf(16),
        color: '#1A1A1A',
    },
    searchIcon: {
        width: sw(20),
        height: sw(20),
        tintColor: '#9CA3AF',
    },

    // FILTER TABS
    filterTabs: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: sw(12),
        padding: sw(4),
        marginBottom: sh(20),
        gap: sw(4),
    },
    filterTab: {
        flex: 1,
        paddingVertical: sh(10),
        borderRadius: sw(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterTabActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: sw(2) },
        shadowOpacity: 0.06,
        shadowRadius: sw(4),
        elevation: 2,
    },
    filterTabText: {
        fontFamily: 'Satoshi-Medium',
        fontSize: sf(14),
        color: '#6B7280',
    },
    filterTabTextActive: {
        color: '#3B82F6',
        fontFamily: 'Satoshi-Bold',
    },

    // USER COUNT
    userCount: {
        fontFamily: 'Satoshi-Bold',
        fontSize: sf(15),
        color: '#374151',
        marginBottom: sh(12),
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
        backgroundColor: '#FFFFFF',
        borderRadius: sw(14),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: sw(2) },
        shadowOpacity: 0.06,
        shadowRadius: sw(8),
        elevation: 2,
    },
    userCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: sw(16),
    },
    avatarContainer: {
        position: 'relative',
        marginRight: sw(16),
    },
    userAvatar: {
        width: sw(60),
        height: sw(60),
        borderRadius: sw(30),
        backgroundColor: '#F3F4F6',
    },
    roleIconBadge: {
        position: 'absolute',
        bottom: sw(-2),
        right: sw(-2),
        width: sw(24),
        height: sw(24),
        borderRadius: sw(12),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F8FAFB',
    },
    roleIconText: {
        fontSize: sf(12),
    },
    userInfo: {
        flex: 1,
        gap: sh(6),
    },
    userName: {
        fontFamily: 'Satoshi-Bold',
        fontSize: sf(18),
        color: '#1F2937',
        lineHeight: sf(22),
    },
    userEmail: {
        fontFamily: 'Satoshi-Regular',
        fontSize: sf(14),
        color: '#6B7280',
    },
    userMetaRow: {
        flexDirection: 'row',
        gap: sw(8),
        flexWrap: 'wrap',
        marginTop: sh(2),
    },
    userMetaChip: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: sw(10),
        paddingVertical: sh(4),
        borderRadius: sw(8),
        flexDirection: 'row',
        alignItems: 'center',
        gap: sw(4),
    },
    userMetaLabel: {
        fontSize: sf(11),
        fontFamily: 'Satoshi-Medium',
        color: '#6B7280',
    },
    userMetaValue: {
        fontSize: sf(12),
        fontFamily: 'Satoshi-Bold',
        color: '#374151',
    },
    arrowContainer: {
        width: sw(25),
        height: sw(25),
        borderRadius: sw(16),
        backgroundColor: '#D4F1E8',
        textAlign: 'center',
        alignItems: 'center',
      },
      arrowButton: {
        fontSize: sf(15),
        color: '#69C1AE',
        fontFamily: 'Satoshi-Medium',
      },

    // LOADING & STATES
    loader: {
        marginVertical: sh(32),
    },
    loadMoreButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: sh(14),
        paddingHorizontal: sw(32),
        borderRadius: sw(12),
        alignItems: 'center',
        marginVertical: sh(24),
        marginHorizontal: '25%',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: sw(4) },
        shadowOpacity: 0.2,
        shadowRadius: sw(8),
        elevation: 3,
    },
    loadMoreText: {
        fontFamily: 'Satoshi-Bold',
        fontSize: sf(16),
        color: '#FFFFFF',
    },

    // EMPTY STATE
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: sh(80),
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
        fontFamily: 'Satoshi-Medium',
        fontSize: sf(15),
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: sf(22),
    },

    // ERROR STATE
    errorContainer: {
        backgroundColor: '#FEF2F2',
        padding: sw(16),
        borderRadius: sw(12),
        marginBottom: sh(20),
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    errorText: {
        fontFamily: 'Satoshi-Medium',
        fontSize: sf(14),
        color: '#DC2626',
        textAlign: 'center',
    },

    // LEGACY STYLES (kept for compatibility)
    userMeta: {
        flexDirection: 'row',
        gap: sw(8),
    },
    userRole: {
        fontFamily: 'Satoshi-Medium',
        fontSize: sf(13),
        color: '#2563EB',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: sw(12),
        paddingVertical: sh(6),
        borderRadius: sw(20),
        overflow: 'hidden',
    },
    userGrade: {
        fontFamily: 'Satoshi-Medium',
        fontSize: sf(13),
        color: '#059669',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: sw(12),
        paddingVertical: sh(6),
        borderRadius: sw(20),
        overflow: 'hidden',
    },
});

export default adminUserManagment;