import { View, Text, StyleSheet } from "react-native";

interface ActivityDetailsListProps {
  data: { label: string; value: number }[];
  unit: "hr" | "min";
}

export const ActivityDetailsList: React.FC<ActivityDetailsListProps> = ({
  data,
  unit,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Detailed Activity</Text>

      {data.map((item, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>
            {item.value.toFixed(2)} {unit}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  label: {
    fontSize: 14,
    color: "#4b5563",
    flexShrink: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
    marginLeft: 12,
  },
});