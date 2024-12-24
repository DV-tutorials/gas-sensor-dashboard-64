import React, { useState, useEffect } from 'react';
import SerialConnection from '@/components/SerialConnection';
import DataCollectionControl from '@/components/DataCollectionControl';
import SensorDisplay from '@/components/SensorDisplay';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SensorData {
  timestamp: number;
  value: number;
}

interface SensorReadings {
  [key: number]: SensorData[];
}

// Generate sample data for demonstration
const generateSampleData = () => {
  const sampleData: SensorReadings = {};
  const now = Date.now();
  
  // Generate data for 3 sensors
  for (let sensorId = 1; sensorId <= 3; sensorId++) {
    sampleData[sensorId] = [];
    // Generate 50 data points for each sensor
    for (let i = 0; i < 50; i++) {
      sampleData[sensorId].push({
        timestamp: now - (50 - i) * 1000, // One reading per second
        value: Math.sin(i * 0.1) * 10 + 20 + Math.random() * 5 // Generate sine wave with noise
      });
    }
  }
  return sampleData;
};

const Index = () => {
  const [serialPort, setSerialPort] = useState<SerialPort | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [sensorData, setSensorData] = useState<SensorReadings>({});
  const [reader, setReader] = useState<ReadableStreamDefaultReader | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const handleConnect = (port: SerialPort) => {
    setSerialPort(port);
  };

  const startDataCollection = async (duration: number) => {
    if (isDemoMode) {
      setIsCollecting(true);
      setSensorData(generateSampleData());
      toast.success("Demo data loaded successfully");
      return;
    }

    if (!serialPort) return;

    setIsCollecting(true);
    const textDecoder = new TextDecoder();
    const reader = serialPort.readable.getReader();
    setReader(reader);

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const data = textDecoder.decode(value);
        // Assuming data format: "sensor1:value1,sensor2:value2,..."
        const readings = data.trim().split(',');
        
        const timestamp = Date.now();
        const newReadings: SensorReadings = { ...sensorData };

        readings.forEach(reading => {
          const [sensor, value] = reading.split(':');
          const sensorId = parseInt(sensor);
          if (!newReadings[sensorId]) {
            newReadings[sensorId] = [];
          }
          newReadings[sensorId].push({
            timestamp,
            value: parseFloat(value)
          });
        });

        setSensorData(newReadings);
      }
    } catch (error) {
      console.error('Error reading data:', error);
      toast.error("Error reading data from serial port");
    }
  };

  const stopDataCollection = async () => {
    if (reader) {
      await reader.cancel();
      setReader(null);
    }
    setIsCollecting(false);
  };

  const exportToCSV = () => {
    const csvRows = ['timestamp'];
    for (let i = 1; i <= 9; i++) {
      csvRows[0] += `,sensor${i}`;
    }

    const timestamps = new Set<number>();
    Object.values(sensorData).forEach(readings => {
      readings.forEach(reading => timestamps.add(reading.timestamp));
    });

    Array.from(timestamps).sort().forEach(timestamp => {
      const row = [timestamp.toString()];
      for (let i = 1; i <= 9; i++) {
        const reading = sensorData[i]?.find(r => r.timestamp === timestamp);
        row.push(reading?.value?.toString() ?? '0'); // Convert to string and use '0' as default
      }
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensor_data_${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    return () => {
      if (reader) {
        reader.cancel();
      }
    };
  }, [reader]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">Gas Sensor Dashboard</h1>
      
      {!serialPort && !isDemoMode && (
        <div className="flex flex-col gap-4 items-center">
          <SerialConnection onConnect={handleConnect} />
          <Button 
            onClick={() => {
              setIsDemoMode(true);
              toast.success("Demo mode activated");
            }}
            variant="outline"
          >
            Try Demo Mode
          </Button>
        </div>
      )}

      {(serialPort || isDemoMode) && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataCollectionControl
              onStartCollection={startDataCollection}
              onStopCollection={stopDataCollection}
              isCollecting={isCollecting}
            />
            <div className="flex items-center justify-center">
              <Button
                onClick={exportToCSV}
                disabled={Object.keys(sensorData).length === 0}
                className="w-full"
              >
                Export to CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(sensorData).map(([sensorId, data]) => (
              <SensorDisplay
                key={sensorId}
                sensorId={parseInt(sensorId)}
                data={data}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Index;