import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import { FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';
import { LogoutIcon } from './Icons';

interface LogoutModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  cancelText?: string;
  confirmText?: string;
}

const { width: SW } = Dimensions.get('window');

const LogoutModal: React.FC<LogoutModalProps> = ({ 
  visible, 
  onCancel, 
  onConfirm, 
  title = "Maka-logout?",
  message = "Sigurado ka ba na gusto mong mag-logout?",
  cancelText = "Bumalik",
  confirmText = "Logout"
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={S.overlay}>
        <View style={S.container}>
           {/* ICON BOX */}
           <View style={S.iconBox}>
              <LogoutIcon size={32} color={F.red} />
           </View>

           {/* TEXT CONTENT */}
           <Text style={S.title}>{title}</Text>
           <Text style={S.message}>{message}</Text>

           {/* BUTTONS */}
           <View style={S.buttonRow}>
              <TouchableOpacity style={S.cancelBtn} onPress={onCancel}>
                 <Text style={S.cancelBtnText}>{cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.confirmBtn} onPress={onConfirm}>
                 <Text style={S.confirmBtnText}>{confirmText}</Text>
              </TouchableOpacity>
           </View>
        </View>
      </View>
    </Modal>
  );
};

const S = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24
  },
  container: {
    backgroundColor: F.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    ...Shadows.cardLift
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: F.red + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: F.ink,
    marginBottom: 12
  },
  message: {
    fontSize: 15,
    color: F.slate,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: F.slate
  },
  confirmBtn: {
    flex: 1.5,
    backgroundColor: F.red,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: F.white
  }
});

export default LogoutModal;