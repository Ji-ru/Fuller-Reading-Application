import React from "react"; 
import {Text, TextProps, StyleSheet} from 'react-native';

export function AppText(props: TextProps) {
    return <Text {...props} style={[]} />
}

const style = StyleSheet.create({
    text: {
        fontFamily: 'Satoshi Variable',
    },
});