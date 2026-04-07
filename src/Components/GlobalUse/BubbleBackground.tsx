import { View } from "react-native"
import bubbles from "../../UI_Designs/BubblesDesign";

export default function BubbleBackground() {
    return (
        <View style={bubbles.bubblesContainer} pointerEvents="none">
            {/* Top Bubbles */}
            <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
            <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
            <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
            <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
            <View style={[bubbles.bubble, bubbles.bubbleTopLeft4]} />
            <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
            <View style={[bubbles.bubble, bubbles.bubbleMiddleRight2]} />
            <View style={[bubbles.bubble, bubbles.bubbleTopLeft5]} />

            {/* Bottom Bubbles */}
            <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
            <View style={[bubbles.bubble, bubbles.bubbleBottomLeft2]} />
            <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
            <View style={[bubbles.bubble, bubbles.bubbleBottomLeft4]} />
            <View style={[bubbles.bubble, bubbles.bubbleBottomLeft5]} />
            <View style={[bubbles.bubble, bubbles.bubbleBottomLeft6]} />
            <View style={[bubbles.bubble, bubbles.bubbleBottomLeft7]} />
            <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
        </View>
    );
}