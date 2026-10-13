// 1. Core API Contract payload mapping directly to your Java Backend DTO fields
export interface ActivitySearchItem {
  activityCode: string;
  mobileTitle: string;
  categoryName: string;
  primaryMode: 'manual' | 'telemetry';
  intensityBand: 'LIGHT' | 'MODERATE' | 'VIGOROUS';
  cardioPct: number;
  strengthPct: number;
  metricType: 'DURATION_BASED' | 'REPETITION_BASED';
}

// 2. Local State Object tracking category counts for your top filter badges
export interface CategoryBadge {
  id: string;
  displayName: string;
  searchMatchCount: number;
}

// 3. Payload layout contract required by your Python WRITE microservice endpoint
export interface KafkaWritePayload {
  event_id: string;
  user_id: string;
  activity_code: string;
  source_platform: 'REACT_NATIVE_APP';
  timestamp: string;
  tracking_metadata: {
    logging_mode: 'MANUAL' | 'TELEMETRY';
    metric_type: 'DURATION_BASED' | 'REPETITION_BASED';
    duration_minutes: number;
    user_reported_rpe: number;
  };
  device_telemetry_signature: string;
}
