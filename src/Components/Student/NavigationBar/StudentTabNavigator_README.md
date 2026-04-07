# StudentTabNavigator — Quick Debug Reference

## File Location
`src/Components/Student/NavigationBar/StudentTabNavigator.tsx`

## Tab → Screen Mapping

| Tab Label      | Internal Name      | Screen Component               | Icon                    |
|----------------|--------------------|---------------------------------|-------------------------|
| Home           | `StudentHome`      | `Student_Home.tsx`              | `Dashboard-icon.png`    |
| Library        | `StudentLibrary`   | `Student_Reading_Selection.tsx` | `Book-icon.png`         |
| My Classroom   | `StudentMyClass`   | `Student_MyClass.tsx`           | `Class-icon.png`        |

## Background Music
Each tab screen is wrapped with `withBackgroundMusic()` (from `Student_Bq_Music.tsx`) **before** being passed to `<Tab.Screen>`. This keeps music playing across tab switches.

## Navigation Flow
1. Student logs in → `handleDesignatedUserPage('student')` in `NavigationController.ts`
2. Navigates to **`StudentTabs`** (stack screen in `App.tsx`)
3. `StudentTabNavigator` renders the bottom tabs
4. Deep screens like `ReadingActivity` are still regular stack screens pushed on top

## How to Add / Remove a Tab
1. Import the new screen in `StudentTabNavigator.tsx`
2. Add an icon entry to the `icons` record (key must match the `name` prop)
3. Wrap with `withBackgroundMusic()` if needed
4. Add a `<Tab.Screen>` entry inside `<Tab.Navigator>`

## How to Change Tab Colors
- Active tint: `tabBarActiveTintColor` (currently `#57b8b3`)
- Inactive tint: `tabBarInactiveTintColor` (currently `#8F9BB3`)
