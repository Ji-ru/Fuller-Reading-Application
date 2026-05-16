import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import { FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';
import { TrashIcon, LogoutIcon, InfoIcon } from './Icons';

interface ConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  type?: 'danger' | 'primary' | 'info';
}

const { width: SW } = Dimensions.get('window');

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  visible, 
  onCancel, 
  onConfirm, 
  title,
  message,
  cancelText = "Bumalik",
  confirmText = "Kumpirmahin",
  type = 'primary'
}) => {
  
  const getIcon = () => {
    switch (type) {
      case 'danger': return <TrashIcon size={32} color={F.red} />;
      case 'info': return <InfoIcon size={32} color={F.primary} />;
      default: return <LogoutIcon size={32} color={F.primaryDeep} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'danger': return F.red;
      case 'info': return F.primary;
      default: return F.primaryDeep;
    }
  };

  const themeColor = getColor();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={S.overlay}>
        <View style={S.container}>
           {/* DECORATIVE TOP BAR */}
           <View style={S.indicator} />

           {/* ICON BOX */}
           <View style={[S.iconBox, { backgroundColor: themeColor + '12' }]}>
              {getIcon()}
           </View>
 
           {/* TEXT CONTENT */}
           <Text style={S.title}>{title}</Text>
           <Text style={S.message}>{message}</Text>
 
           {/* BUTTONS */}
           <View style={S.buttonRow}>
              <TouchableOpacity style={S.cancelBtn} onPress={onCancel} activeOpacity={0.6}>
                 <Text style={S.cancelBtnText}>{cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[S.confirmBtn, { backgroundColor: themeColor }]} 
                onPress={onConfirm}
                activeOpacity={0.8}
              >
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
    padding: 28
  },
  container: {
    backgroundColor: F.white,
    borderRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: 'center',
    ...Shadows.cardLift
  },
  indicator: {
    width: 36,
    height: 4,
    backgroundColor: '#F0F3F6',
    borderRadius: 2,
    marginBottom: 24
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 22,
    fontFamily: 'Andika-Bold',
    color: F.ink,
    marginBottom: 10,
    textAlign: 'center'
  },
  message: {
    fontSize: 15,
    fontFamily: 'Andika-Regular',
    color: F.slate,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 4
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: 'Andika-Bold',
    color: F.slate
  },
  confirmBtn: {
    flex: 1.6,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
    shadowOpacity: 0.15
  },
  confirmBtnText: {
    fontSize: 15,
    fontFamily: 'Andika-Bold',
    color: F.white,
    letterSpacing: 0.3
  }
});

export default ConfirmationModal;
