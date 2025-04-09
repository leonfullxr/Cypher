#!/bin/bash

# Central load test script settings
NUM_CONNECTIONS=5000
RAMP_TIME=50      # Seconds during which all connections ramp-up
HOLD_TIME=180      # Seconds to hold connections open

echo "Starting load test with:"
echo "  Active Connections: $NUM_CONNECTIONS"
echo "  Ramp-Up Time: $RAMP_TIME seconds"
echo "  Hold Time: $HOLD_TIME seconds"

# Start the resource monitor in the background using variables
echo "Launching resource monitor..."
python3 resource_monitor.py --connections "$NUM_CONNECTIONS" --ramp "$RAMP_TIME" --hold "$HOLD_TIME" &
RESOURCE_MONITOR_PID=$!

# Give the resource monitor a moment to initialize (optional)
sleep 2

# Run the Socket.IO load test script passing the parameters
echo "Starting Socket.IO load test..."
./socketTest.sh "$NUM_CONNECTIONS" "$RAMP_TIME" "$HOLD_TIME"

echo "Socket load test finished."
echo "Waiting a few seconds for final resource metrics..."
sleep 5

# Stop the resource monitor
echo "Terminating resource monitor (PID: $RESOURCE_MONITOR_PID)..."
kill $RESOURCE_MONITOR_PID

echo "Load test complete."
echo "All processes terminated."
