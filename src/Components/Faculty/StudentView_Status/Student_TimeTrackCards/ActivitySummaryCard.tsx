
import { View, Text, StyleSheet } from "react-native";
import { sw, sh, sf } from '../../../../Utils/responsive';

interface ActivitySummaryCardProps {
  total: number;
  average: number;
  trendPercentage: number | null;
  trendDirection: "up" | "down" | "same";
  unit: "hr" | "min";
  insightText?: string;

}

export const ActivitySummaryCard: React.FC<ActivitySummaryCardProps> = ({
  total,
  average,
  trendPercentage,
  trendDirection,
  unit,
  insightText
}) => {
  const trendColor =
    trendDirection === "up"
      ? "#16a34a"
      : trendDirection === "down"
        ? "#dc2626"
        : "#6b7280";

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Reading Activity Summary</Text>

      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.value}>{total.toFixed(2)}</Text>
          <Text style={styles.label}>Total {unit}</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.value}>{average.toFixed(2)}</Text>
          <Text style={styles.label}>Avg / period</Text>
        </View>
      </View>

      {trendPercentage !== null && (
        <Text style={[styles.trend, { color: trendColor }]}>
          {trendDirection === 'up' && '▲ '}
          {trendDirection === 'down' && '▼ '}
          {trendDirection === 'same' && '— '}
          {insightText}
        </Text>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: sw(16),
    padding: sw(20),
    marginBottom: sh(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.05,
    shadowRadius: sw(4),
    elevation: 2,
  },
  title: {
    fontSize: sf(18),
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: sh(12),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: sh(12),
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  value: {
    fontSize: sf(24),
    fontWeight: "700",
    color: "#111827",
    marginBottom: sh(4),
  },
  label: {
    fontSize: sf(12),
    color: "#6b7280",
  },
  trend: {
    marginTop: sh(4),
    fontSize: sf(13),
    fontWeight: "500",
    textAlign: "center",
  },
});