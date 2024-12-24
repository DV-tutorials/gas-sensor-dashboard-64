import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DataCollectionControlProps {
  onStartCollection: (duration: number) => void;
  onStopCollection: () => void;
  isCollecting: boolean;
}

const DataCollectionControl = ({
  onStartCollection,
  onStopCollection,
  isCollecting
}: DataCollectionControlProps) => {
  const [duration, setDuration] = useState(60);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Data Collection Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Collection Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            disabled={isCollecting}
          />
        </div>
        <Button
          onClick={() => onStartCollection(duration)}
          disabled={isCollecting}
          className="w-full mb-2"
        >
          Start Collection
        </Button>
        <Button
          onClick={onStopCollection}
          disabled={!isCollecting}
          variant="destructive"
          className="w-full"
        >
          Stop Collection
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataCollectionControl;