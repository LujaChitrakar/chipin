import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import colors from '@/assets/colors';

const CircularProgress = ({
  size,
  target,
  progress,
  innerCircleStrokeWidth = 2,
  outerCircleStrokeWidth = 4,
  innerCircleColor = colors.cardBackground.light,
  outerCircleColor = colors.white + 'bb',
  completeOuterColor = colors.green[500] + '99',
}: {
  size: number;
  target: number;
  progress: number;
  innerCircleStrokeWidth?: number;
  outerCircleStrokeWidth?: number;
  innerCircleColor?: string;
  outerCircleColor?: string;
  completeOuterColor?: string;
}) => {
  const radius = size / 2;
  const circumference = 2 * Math.PI * radius;
  const progressPercentage = Math.min((progress / target) * 100, 100);
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;
  const isComplete = progress >= target;
  const effectiveOuterColor = isComplete
    ? completeOuterColor
    : outerCircleColor;

  return (
    <View style={styles.container}>
      <Svg height={size} width={size}>
        <Circle
          cx={radius}
          cy={radius}
          r={radius - innerCircleStrokeWidth / 2}
          fill='transparent'
          stroke={innerCircleColor}
          strokeWidth={innerCircleStrokeWidth}
          strokeLinecap='round'
        />
        <Circle
          cx={radius}
          cy={radius}
          r={radius - outerCircleStrokeWidth / 2}
          fill='transparent'
          stroke={effectiveOuterColor}
          strokeWidth={outerCircleStrokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap='round'
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CircularProgress;
