import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const SerialConnection = ({ onConnect }: { onConnect: (port: SerialPort) => void }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectToSerial = async () => {
    try {
      setIsConnecting(true);
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      onConnect(port);
      toast.success("Successfully connected to serial port");
    } catch (error) {
      console.error("Error connecting to serial port:", error);
      toast.error("Failed to connect to serial port");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Serial Connection</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={connectToSerial} 
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting ? "Connecting..." : "Connect to Device"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SerialConnection;