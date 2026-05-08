import { useState } from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import LogoutModal from './Logout_Modal';
import { useNavigationHelper } from '../../Controller/NavigationController';
import upperNav from '../../UI_Designs/UpperNavigation';

interface HeaderMenuProps {
    onLogout: () => Promise<void>;
}
export const HeaderMenu: React.FC<HeaderMenuProps> = ({ onLogout }) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [logoutVisible, setLogoutVisible] = useState<boolean>(false);

    const handleLogoutPress = () => {
        setMenuVisible(false);
        setLogoutVisible(true);
    };

    const confirmLogout = async () => {
        setLogoutVisible(false);
        await onLogout();
    };

    const cancelLogout = () => {
        setLogoutVisible(false);
    };
    return (
        <>
            <TouchableOpacity onPress={() => setMenuVisible(prev => !prev)} style={upperNav.touchable}>
                <Image source={require('../../../assets/icons/Menu-icon.png')} style={upperNav.menuIcon} />
            </TouchableOpacity>

            {menuVisible && (
                <View style={upperNav.dropdownMenu}>
                    
                    <TouchableOpacity
                        onPress={handleLogoutPress}
                        style={upperNav.logoutButton}
                    >
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
        </>
    );
};
