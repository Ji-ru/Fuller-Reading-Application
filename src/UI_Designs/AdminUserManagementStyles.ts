// adminUserManagementStyles.ts
import { StyleSheet } from "react-native";

const adminUserManagment = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFB',
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    content: {
        flex: 1,
        paddingTop: 16,
    },

    // HEADER SECTION
    headerSection: {
        marginBottom: 20,
    },
    title: {
        fontFamily: 'Satoshi-Black',
        fontSize: 32,
        color: '#1A1A1A',
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 15,
        color: '#6B7280',
    },

    // SEARCH BAR
    searchContainer: {
        position: 'relative',
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        paddingLeft: 12,
        fontFamily: 'Satoshi-Medium',
        fontSize: 16,
        color: '#1A1A1A',
    },
    searchIcon: {
        width: 20,
        height: 20,
        tintColor: '#9CA3AF',
    },

    // FILTER TABS
    filterTabs: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
        gap: 4,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterTabActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    filterTabText: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 14,
        color: '#6B7280',
    },
    filterTabTextActive: {
        color: '#3B82F6',
        fontFamily: 'Satoshi-Bold',
    },

    // USER COUNT
    userCount: {
        fontFamily: 'Satoshi-Bold',
        fontSize: 15,
        color: '#374151',
        marginBottom: 12,
    },

    // USER LIST
    listWrapper: {
        flex: 1,
    },
    listContainer: {
        paddingBottom: 24,
    },

    // USER CARD
    userCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    userCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    userAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F3F4F6',
    },
    roleIconBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F8FAFB',
    },
    roleIconText: {
        fontSize: 12,
    },
    userInfo: {
        flex: 1,
        gap: 6,
    },
    userName: {
        fontFamily: 'Satoshi-Bold',
        fontSize: 18,
        color: '#1F2937',
        lineHeight: 22,
    },
    userEmail: {
        fontFamily: 'Satoshi-Regular',
        fontSize: 14,
        color: '#6B7280',
    },
    userMetaRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        marginTop: 2,
    },
    userMetaChip: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    userMetaLabel: {
        fontSize: 11,
        fontFamily: 'Satoshi-Medium',
        color: '#6B7280',
    },
    userMetaValue: {
        fontSize: 12,
        fontFamily: 'Satoshi-Bold',
        color: '#374151',
    },
    arrowContainer: {
        width: 25,
        height: 25,
        borderRadius: 16,
        backgroundColor: '#D4F1E8',
        textAlign: 'center',
        alignItems: 'center',
      },
      arrowButton: {
        fontSize: 15,
        color: '#69C1AE',
        fontFamily: 'Satoshi-Medium',
      },

    // LOADING & STATES
    loader: {
        marginVertical: 32,
    },
    loadMoreButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        marginVertical: 24,
        marginHorizontal: '25%',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    loadMoreText: {
        fontFamily: 'Satoshi-Bold',
        fontSize: 16,
        color: '#FFFFFF',
    },

    // EMPTY STATE
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontFamily: 'Satoshi-Bold',
        color: '#374151',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyText: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 15,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 22,
    },

    // ERROR STATE
    errorContainer: {
        backgroundColor: '#FEF2F2',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    errorText: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 14,
        color: '#DC2626',
        textAlign: 'center',
    },

    // LEGACY STYLES (kept for compatibility)
    userMeta: {
        flexDirection: 'row',
        gap: 8,
    },
    userRole: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 13,
        color: '#2563EB',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        overflow: 'hidden',
    },
    userGrade: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 13,
        color: '#059669',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        overflow: 'hidden',
    },
});

export default adminUserManagment;