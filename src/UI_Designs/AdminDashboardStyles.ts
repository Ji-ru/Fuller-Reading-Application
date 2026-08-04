import { StyleSheet, Platform } from "react-native";
import { FacultyColors, Radii, Shadows, Spacing } from '../Utilities/Theme';
import { sw, sh, sf } from '../Utils/responsive';

const adminDashboard = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F4F7F5', // Match AdminUserManagement neutral background
    },
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingBottom: sh(40),
    },

    // TOP BAR (menu button row) — mirrors Faculty dashboard
    topBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: sw(16),
        paddingTop: sh(8),
        paddingBottom: sh(4),
    },
    menuBtn: {
        width: sw(44),
        height: sw(44),
        borderRadius: sw(14),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: sw(2) },
        shadowOpacity: 0.08,
        shadowRadius: sw(6),
        elevation: 3,
    },

    // HERO HEADER CARD — mirrors Faculty dashboard
    heroCard: {
        marginHorizontal: sw(16),
        marginTop: sh(12),
        marginBottom: sh(24),
        backgroundColor: FacultyColors.primaryDeep,
        borderRadius: sw(24),
        paddingVertical: sh(24),
        paddingHorizontal: sw(22),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: FacultyColors.primaryDeep,
        shadowOffset: { width: 0, height: sw(8) },
        shadowOpacity: 0.35,
        shadowRadius: sw(16),
        elevation: 10,
    },
    heroCardLeft: {
        flex: 1,
    },
    heroGreeting: {
        fontSize: sf(13),
        color: 'rgba(255,255,255,0.75)',
        fontFamily: 'Satoshi-Regular',
        marginBottom: sh(4),
    },
    heroTitle: {
        fontSize: sf(26),
        fontFamily: 'Satoshi-Black',
        color: '#FFFFFF',
    },
    heroIconWrap: {
        width: sw(52),
        height: sw(52),
        borderRadius: sw(16),
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // KPI STRIP — 2 cards side by side, filling the row
    kpiStripContainer: {
        marginBottom: sh(24),
        paddingHorizontal: sw(16),
    },
    kpiStrip: {
        flexDirection: 'column',
        gap: sh(12),
    },
    kpiRow: {
        flexDirection: 'row',
        gap: sw(12),
    },
    kpiRowCentered: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    kpiCardHalf: {
        width: '50%',
    },
    kpiCard: {
        flex: 1,
        backgroundColor: FacultyColors.white,
        borderRadius: Radii.sm,
        padding: sw(14),
        ...Shadows.subtle,
    },
    kpiIconContainer: {
        width: sw(32),
        height: sw(32),
        borderRadius: sw(16),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: sh(10),
    },
    kpiValue: {
        fontFamily: 'Satoshi-Black',
        fontSize: sf(26),
        color: FacultyColors.ink,
        marginBottom: sh(2),
    },
    kpiLabel: {
        fontFamily: 'Satoshi-Medium',
        fontSize: sf(12),
        color: FacultyColors.slate,
        lineHeight: sf(16),
    },

    // YEAR FILTER DROPDOWN
    yearFilterContainer: {
        position: 'relative',
        zIndex: 10,
        paddingHorizontal: sw(16),
        marginBottom: sh(24),
    },
    yearFilterLabel: {
        fontFamily: 'Satoshi-Bold',
        fontSize: sf(11),
        color: FacultyColors.slate,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: sh(8),
    },
    filterDropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: FacultyColors.white,
        borderWidth: 1,
        borderColor: FacultyColors.primaryLight,
        borderRadius: Radii.sm,
        paddingHorizontal: sw(16),
        paddingVertical: sh(12),
        ...Shadows.subtle,
    },
    filterDropdownButtonText: {
        fontFamily: 'Satoshi-Bold',
        fontSize: sf(15),
        color: FacultyColors.ink,
        flex: 1,
    },
    filterDropdownChevron: {
        marginLeft: sw(8),
    },
    filterDropdownMenu: {
        position: 'absolute',
        top: sh(72),
        left: sw(16),
        right: sw(16),
        backgroundColor: FacultyColors.white,
        borderRadius: Radii.sm,
        borderWidth: 1,
        borderColor: '#E2E8E4',
        zIndex: 1000,
        overflow: 'hidden',
        ...Shadows.card,
    },
    filterDropdownItem: {
        paddingVertical: sh(14),
        paddingHorizontal: sw(16),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4F2',
    },
    filterDropdownItemSelected: {
        backgroundColor: 'rgba(0, 132, 67, 0.07)',
    },
    filterDropdownItemText: {
        fontFamily: 'Satoshi-Medium',
        fontSize: sf(15),
        color: FacultyColors.inkLight,
    },
    filterDropdownItemTextSelected: {
        fontFamily: 'Satoshi-Bold',
        color: FacultyColors.primary,
    },

    // CHARTS SECTION
    chartsContainer: {
        paddingHorizontal: sw(16),
    },
    sectionDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: sh(16),
        marginTop: sh(8),
    },
    sectionDividerLabel: {
        fontFamily: 'Satoshi-Bold',
        fontSize: sf(14),
        color: FacultyColors.slate,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionDividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8E4', // subtle line
        marginLeft: sw(12),
    },
    chartWrapper: {
        marginBottom: sh(16),
    }
});

export default adminDashboard;