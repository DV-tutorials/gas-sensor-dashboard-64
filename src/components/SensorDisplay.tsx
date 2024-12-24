import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SensorData {
  timestamp: number;
  value: number;
}

interface SensorDisplayProps {
  sensorId: number;
  data: SensorData[];
}

const SensorDisplay = ({ sensorId, data }: SensorDisplayProps) => {
  const latestValue = data[data.length - 1]?.value || 0;

  return (
    <Card className="sensor-card">
      <CardHeader>
        <CardTitle>Sensor {sensorId}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-2xl font-bold data-point">
            {latestValue.toFixed(2)}
          </span>
        </div>
        <div className="h-[200px] chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorDisplay;