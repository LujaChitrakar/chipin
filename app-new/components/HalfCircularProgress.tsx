// <DOCUMENT filename="HalfCircularProgress.tsx">
import React from 'react';
import { View, StyleSheet, Text, TextStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import colors from '@/assets/colors';

interface HalfCircularProgressProps {
  size: number;
  target: number;
  progress: number;
  innerCircleStrokeWidth?: number;
  outerCircleStrokeWidth?: number;
  innerCircleColor?: string;
  outerCircleColor?: string;
  completeOuterColor?: string;
  label?: string;
  labelStyle?: TextStyle;
}

const HalfCircularProgress: React.FC<HalfCircularProgressProps> = ({
  size,
  target,
  progress,
  innerCircleStrokeWidth = 2,
  outerCircleStrokeWidth = 4,
  innerCircleColor = colors.cardBackground.light,
  outerCircleColor = colors.white + 'bb',
  completeOuterColor = colors.green[500] + '99',
  label = '',
  labelStyle,
}) => {
  const radius = size / 2;
  const innerRadius = radius - innerCircleStrokeWidth / 2;
  const outerRadius = radius - outerCircleStrokeWidth / 2;

  const halfCircumference = Math.PI * outerRadius;

  const progressPercentage = Math.min((progress / target) * 100, 100);
  const strokeDashoffset =
    halfCircumference - (progressPercentage / 100) * halfCircumference;

  const isComplete = progress >= target;
  const effectiveOuterColor = isComplete
    ? completeOuterColor
    : outerCircleColor;

  const innerPath = `
    M ${radius - innerRadius}, ${radius}
    A ${innerRadius},${innerRadius} 0 0,1 ${radius + innerRadius},${radius}
  `;

  const outerPath = `
    M ${radius - outerRadius}, ${radius}
    A ${outerRadius},${outerRadius} 0 0,1 ${radius + outerRadius},${radius}
  `;

  return (
    <View style={styles.container}>
      <Svg height={size} width={size}>
        <Path
          d={innerPath}
          fill='transparent'
          stroke={innerCircleColor}
          strokeWidth={innerCircleStrokeWidth}
          strokeLinecap='round'
        />

        <Path
          d={outerPath}
          fill='transparent'
          stroke={effectiveOuterColor}
          strokeWidth={outerCircleStrokeWidth}
          strokeDasharray={halfCircumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap='round'
        />
      </Svg>

      {label !== '' && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>{label}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
});

export default HalfCircularProgress;
