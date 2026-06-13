# Reading Activity Animation & Display Documentation

This document explains the architectural pattern used in `Student_Reading_Activity.tsx` to display reading materials (Alphabets/Words) and how the application navigates between items with animations without changing screens.

## 1. How Words and Alphabets are Displayed

The display logic is completely isolated inside the `PassageDisplay` component located in `src/Components/Student/Reading/TextDisplay.tsx`.

When the current material is an **Alphabet** or a **Word**:
- **Wrapper Elements:** It uses a standard card container with a white background and shadow styling (`readingStyles.wordCardContainer` and `readingStyles.wordCard`).
- **Decorative Elements:** Inside the card, it renders two overlapping circles (`circleDecor` inside `clipContainer`) in the top-right and bottom-left corners to give the card a "premium" visual identity.
- **Text Rendering:** The exact text (`material.letter` or `allWords[0]`) is rendered using a large font (`readingStyles.wordCardText`).
- **Conditional Styling:** When the reading attempt is completed (`isCompleted`), the text color changes dynamically based on the student's accuracy (`#1a7a45` for correct/green, `#e74c3c` for incorrect/red).

## 2. Navigating Without Changing Pages

The application avoids navigating to a new screen for each alphabet/word. Instead, it uses **local state** to cycle through a list of items on the same screen.

1. **The State:** 
   ```tsx
   const [currentIndex, setCurrentIndex] = useState(initialIndex);
   ```
2. **The Data Binding:** 
   The current material displayed is derived directly from the index:
   ```tsx
   const readingMaterial = items.length > 0 ? items[currentIndex] : initialMaterial;
   ```
3. **Previous / Next Buttons:**
   The `NavArrow` components trigger `handleNext` and `handlePrevious`. These functions simply update the `currentIndex` state mathematically:
   ```tsx
   // Next Button Logic
   setCurrentIndex(prev => (prev + 1) % items.length);
   
   // Previous Button Logic
   setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
   ```
   *Because `items` and `currentIndex` are local React states, updating the index instantly replaces the data passed into `PassageDisplay` without a page reload.*

## 3. How the Animation Works (The "Key Remounting" Pattern)

The core mechanism for the animation relies on a standard React trick known as **Key Remounting**. 

In `Student_Reading_Activity.tsx`, you will see the `PassageDisplay` is wrapped inside a component called `<BounceIn>`:

```tsx
<BounceIn key={currentIndex}>
  <PassageDisplay
    material={readingMaterial}
    type={type}
    // ...other props
  />
</BounceIn>
```

### Why this works:
In React, the `key` prop is traditionally used for lists. However, when you place a `key` on a single component, React uses it to track the component's identity.
1. When you click "Next", `currentIndex` changes from `0` to `1`.
2. The `<BounceIn>` component's key changes from `key={0}` to `key={1}`.
3. React sees the key has changed, so it assumes the old component is completely destroyed. It **unmounts** the old component and **mounts** a brand new `<BounceIn>` component.
4. Because it's a completely new component mounting into the screen, the mounting animation (like fading or scaling in) is triggered again. 

## 4. How to Copy This Animation Logic

> [!WARNING]
> Currently, in `src/Components/GlobalUse/Animations.tsx`, the actual animation logic inside `BounceIn` has been temporarily disabled/removed (`// Animations removed: Now renders children immediately with static layout.`).

If you want to copy this process and actually make it animate, you need to implement `Animated` from `react-native`. Here is the full code you can copy to create a working `<BounceIn>` component using the exact same logic.

```tsx
import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';

export function BounceIn({
  children,
  flex = false,
  style,
}: {
  children: React.ReactNode;
  flex?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  // 1. Define animated values (Start scaled down and invisible)
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // 2. Trigger the animation when the component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,       // Scale up to 100%
        friction: 5,      // Controls "bounciness"
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,       // Fade in to 100%
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, []); // Empty dependency array means this runs ONCE when mounted

  // 3. Wrap children in an Animated.View
  return (
    <Animated.View 
      style={[
        flex && { flex: 1 }, 
        style, 
        { 
          transform: [{ scale: scaleAnim }], 
          opacity: opacityAnim 
        }
      ]}
    >
      {children}
    </Animated.View>
  );
}
```

### Steps to implement in your own code:
1. Copy the `BounceIn` component code above.
2. Create your local integer state: `const [index, setIndex] = useState(0);`
3. Wrap your displaying component in it: `<BounceIn key={index}> <YourComponent data={data[index]} /> </BounceIn>`
4. Change the `index` state using a button. The component will automatically rebuild and bounce in the new data.
