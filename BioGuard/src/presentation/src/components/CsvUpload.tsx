import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, X, Table } from 'lucide-react';

/**
 * Supported CSV formats:
 *
 * 1. Apple Health Export (from Health app > Profile > Export All Health Data):
 *    type, sourceName, value, unit, startDate, endDate
 *    HKQuantityTypeIdentifierHeartRateVariabilitySDNN, Apple Watch, 42.3, ms, 2026-03-25T20:15:00, ...
 *
 * 2. Garmin Connect Export (Settings > Export Your Data):
 *    Date, Heart Rate (bpm), HRV (ms), Steps, Sleep Duration (min), ...
 *    2026-03-25, 68, 41.5, 8200, 452, ...
 *
 * 3. Generic (any CSV with columns that map to supported biometric types):
 *    timestamp, type, value
 *    2026-03-25T20:00:00Z, HRV_RMSSD, 38.5
 */

// Maps Apple HealthKit quantity type identifiers to our internal types
const HEALTHKIT_TYPE_MAP: Record<string, string> = {
  'hkquantitytypeidentifierheartratevariabilitysdnn': 'HRV_RMSSD',
  'hkquantitytypeidentifierrestingheartrate': 'RESTING_HEART_RATE',
  'hkquantitytypeidentifierbloodglucose': 'BLOOD_GLUCOSE',
  'hkquantitytypeidentifierstepcount': 'STEP_COUNT',
  'hkcategorytypeidentifiersleepanalysis': 'SLEEP_ANALYSIS',
  'hkquantitytypeidentifierheartrate': 'RESTING_HEART_RATE',
};

// Maps Garmin column headers to our internal types
const GARMIN_COLUMN_MAP: Record<string, string> = {
  'hrv': 'HRV_RMSSD',
  'hrv (ms)': 'HRV_RMSSD',
  'heart rate': 'RESTING_HEART_RATE',
  'heart rate (bpm)': 'RESTING_HEART_RATE',
  'resting heart rate': 'RESTING_HEART_RATE',
  'steps': 'STEP_COUNT',
  'sleep duration': 'SLEEP_ANALYSIS',
  'sleep duration (min)': 'SLEEP_ANALYSIS',
  'blood glucose': 'BLOOD_GLUCOSE',
  'glucose': 'BLOOD_GLUCOSE',
};

export interface BiometricReading {
  timestamp: string;
  type: string;
  value: number;
  source: string;
}

interface CsvUploadProps {
  onDataLoaded: (readings: BiometricReading[]) => void;
}

function parseCSV(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/);
  return lines.map(line => {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { cells.push(current.trim()); current = ''; }
      else { current += ch; }
    }
    cells.push(current.trim());
    return cells;
  });
}

function detectFormat(headers: string[]): 'apple' | 'garmin' | 'generic' | 'unknown' {
  const lower = headers.map(h => h.toLowerCase());
  if (lower.includes('type') && lower.includes('sourcename') && lower.includes('value')) return 'apple';
  if (lower.some(h => h.includes('heart rate') || h.includes('hrv') || h.includes('steps'))) return 'garmin';
  if (lower.includes('type') && lower.includes('value')) return 'generic';
  return 'unknown';
}

function parseAppleHealth(rows: string[][], headers: string[]): BiometricReading[] {
  const lower = headers.map(h => h.toLowerCase());
  const typeIdx = lower.indexOf('type');
  const valueIdx = lower.indexOf('value');
  const startIdx = lower.indexOf('startdate');
  const sourceIdx = lower.indexOf('sourcename');

  const readings: BiometricReading[] = [];
  for (const row of rows) {
    if (row.length <= Math.max(typeIdx, valueIdx)) continue;
    const rawType = (row[typeIdx] || '').toLowerCase();
    const mappedType = HEALTHKIT_TYPE_MAP[rawType];
    if (!mappedType) continue;

    const value = parseFloat(row[valueIdx]);
    if (isNaN(value)) continue;

    readings.push({
      timestamp: row[startIdx] || new Date().toISOString(),
      type: mappedType,
      value,
      source: row[sourceIdx] || 'Apple Health Export',
    });
  }
  return readings;
}

function parseGarmin(rows: string[][], headers: string[]): BiometricReading[] {
  const lower = headers.map(h => h.toLowerCase());
  const dateIdx = lower.findIndex(h => h.includes('date'));

  const readings: BiometricReading[] = [];
  for (const row of rows) {
    const timestamp = dateIdx >= 0 ? row[dateIdx] : new Date().toISOString();

    for (let col = 0; col < headers.length; col++) {
      const headerLower = headers[col].toLowerCase();
      const mappedType = GARMIN_COLUMN_MAP[headerLower];
      if (!mappedType) continue;

      const value = parseFloat(row[col]);
      if (isNaN(value) || value === 0) continue;

      readings.push({ timestamp, type: mappedType, value, source: 'Garmin Connect Export' });
    }
  }
  return readings;
}

function parseGeneric(rows: string[][], headers: string[]): BiometricReading[] {
  const lower = headers.map(h => h.toLowerCase());
  const typeIdx = lower.indexOf('type');
  const valueIdx = lower.indexOf('value');
  const tsIdx = lower.findIndex(h => h.includes('time') || h.includes('date'));

  const readings: BiometricReading[] = [];
  for (const row of rows) {
    const type = row[typeIdx] || '';
    const value = parseFloat(row[valueIdx]);
    if (!type || isNaN(value)) continue;

    readings.push({
      timestamp: tsIdx >= 0 ? row[tsIdx] : new Date().toISOString(),
      type: type.toUpperCase().replace(/\s+/g, '_'),
      value,
      source: 'CSV Upload',
    });
  }
  return readings;
}

const CsvUpload: React.FC<CsvUploadProps> = ({ onDataLoaded }) => {
  const [status, setStatus] = useState<'idle' | 'loaded' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<BiometricReading[]>([]);
  const [detectedFormat, setDetectedFormat] = useState('');

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length < 2) { setStatus('error'); setMessage('CSV has no data rows.'); return; }

        const headers = parsed[0];
        const rows = parsed.slice(1);
        const format = detectFormat(headers);
        setDetectedFormat(format);

        let readings: BiometricReading[];
        switch (format) {
          case 'apple': readings = parseAppleHealth(rows, headers); break;
          case 'garmin': readings = parseGarmin(rows, headers); break;
          case 'generic': readings = parseGeneric(rows, headers); break;
          default:
            setStatus('error');
            setMessage('Unrecognised CSV format. Expected columns: type + value (generic), or Apple Health / Garmin Connect export.');
            return;
        }

        if (readings.length === 0) {
          setStatus('error');
          setMessage('No biometric readings found. Check that your CSV contains HRV, heart rate, glucose, sleep, or step data.');
          return;
        }

        setPreview(readings.slice(0, 8));
        setStatus('loaded');
        setMessage(`${readings.length} readings from ${format === 'apple' ? 'Apple Health' : format === 'garmin' ? 'Garmin Connect' : 'CSV'} (${new Set(readings.map(r => r.type)).size} biometric types)`);
        onDataLoaded(readings);
      } catch (err) {
        setStatus('error');
        setMessage('Failed to parse CSV: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    reader.readAsText(file);
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) handleFile(file);
    else { setStatus('error'); setMessage('Please drop a .csv file.'); }
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clear = () => { setStatus('idle'); setMessage(''); setPreview([]); setDetectedFormat(''); };

  return (
    <div className="Card CsvUpload-Card">
      <div className="Card-Header">
        <div className="Title-Group">
          <Upload size={18} />
          <h3>Import Biometric Data</h3>
        </div>
        {status === 'loaded' && (
          <button className="Clear-Btn" onClick={clear} title="Clear"><X size={14} /></button>
        )}
      </div>

      {status === 'idle' && (
        <div
          className="Upload-Zone"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <FileText size={32} className="Upload-Icon" />
          <p>Drop a CSV file here, or click to browse</p>
          <p className="Upload-Hint">Supports Apple Health Export, Garmin Connect Export, or generic CSV (type, value, timestamp)</p>
          <input type="file" accept=".csv,text/csv" onChange={handleInputChange} className="Upload-Input" />
        </div>
      )}

      {status === 'loaded' && (
        <div className="Upload-Result success">
          <div className="Result-Header">
            <CheckCircle2 size={16} className="success-text" />
            <span>{message}</span>
            {detectedFormat && <span className="Format-Badge">{detectedFormat.toUpperCase()}</span>}
          </div>
          {preview.length > 0 && (
            <div className="Preview-Table">
              <div className="Preview-Header">
                <Table size={14} />
                <span>Preview (first {preview.length} readings)</span>
              </div>
              <table>
                <thead>
                  <tr><th>Type</th><th>Value</th><th>Source</th><th>Timestamp</th></tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i}>
                      <td>{r.type}</td>
                      <td>{r.value.toFixed(2)}</td>
                      <td>{r.source}</td>
                      <td>{new Date(r.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="Upload-Result error">
          <AlertTriangle size={16} className="danger-text" />
          <span>{message}</span>
          <button className="Action-Btn secondary" onClick={clear}>Try Again</button>
        </div>
      )}
    </div>
  );
};

export default CsvUpload;
