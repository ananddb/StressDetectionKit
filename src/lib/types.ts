import { Accelerometer, Gyroscope, SensorData } from 'react-native-sensors';

export type StressLevel = 'none' | 'low' | 'medium' | 'high';
export type ChartType = 'hrv' | 'heartRate' | 'activity';

export interface StressMark {
  start: number;
  end: number;
  level: StressLevel;
}

export interface PulseMark {
  pulse: number;
  timestamp: number;
}

export interface RrIntervalMark {
  rrInterval: number;
  timestamp: number;
}

export interface Chunk {
  rrIntervals: RrIntervalMark[];
  pulse: PulseMark[];
  accelerometer: SensorData[];
  gyroscope: SensorData[];
  timestamp: number;
}

export interface Sample {
  state: boolean; // stressed or not
  vector: [number, number, number]; // feature vector for the classificator
  activityIndex: number; // activity intensity
  heartRate: number; // mean heart rate
  hrv: number; // root mean square of RR intervals successive differences
  stress?: StressLevel; // percieved stress level
  timestamp: number; // last chunk's timestamp
}

export type Sensor = typeof Accelerometer | typeof Gyroscope;
