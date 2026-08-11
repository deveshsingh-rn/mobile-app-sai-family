import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";

type Item = { date: string; label: string; count: number };
type Props = { items: Item[] };

const HEIGHT = 150;
const PADDING = 16;

export function NaamJapCumulativeChart({ items }: Props) {
  const [width, setWidth] = useState(0);
  const cumulative = useMemo(() => {
    let running = 0;
    const byDate = new Map<string, number>();
    [...items].reverse().forEach((item) => {
      running += item.count;
      byDate.set(item.date, running);
    });
    return items.map((item) => ({ ...item, total: byDate.get(item.date) || 0 }));
  }, [items]);
  const max = Math.max(1, ...cumulative.map((item) => item.total));
  const chartWidth = Math.max(1, width - PADDING * 2);
  const points = cumulative.map((item, index) => ({
    ...item,
    x: PADDING + (index / Math.max(1, cumulative.length - 1)) * chartWidth,
    y: PADDING + (1 - item.total / max) * (HEIGHT - PADDING * 2),
  }));

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={styles.wrap}>
      {width > 0 ? (
        <Svg height={HEIGHT} width={width}>
          {[0.25, 0.5, 0.75].map((ratio) => (
            <Line
              key={ratio}
              stroke="#E2E8E4"
              strokeWidth={1}
              x1={PADDING}
              x2={width - PADDING}
              y1={HEIGHT * ratio}
              y2={HEIGHT * ratio}
            />
          ))}
          <Polyline
            fill="none"
            points={points.map((point) => `${point.x},${point.y}`).join(" ")}
            stroke="#557568"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
          />
          {points.map((point) => (
            <Circle cx={point.x} cy={point.y} fill="#FFFFFF" key={point.date} r={4} stroke="#557568" strokeWidth={2} />
          ))}
        </Svg>
      ) : null}
      <View style={styles.labels}>
        {cumulative.map((item) => (
          <View key={item.date} style={styles.labelCell}>
            <Text style={styles.value}>{item.total}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 10, width: "100%" },
  labels: { flexDirection: "row", paddingHorizontal: 4 },
  labelCell: { alignItems: "center", flex: 1 },
  value: { color: "#557568", fontSize: 9, fontWeight: "800" },
  label: { color: "#7A827D", fontSize: 10, fontWeight: "700", marginTop: 2 },
});

