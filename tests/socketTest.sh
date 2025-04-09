#!/bin/bash
num_connections=$1
ramp_up_total=$2
hold_time=$3

# Calculate the delay between each connection (in seconds)
ramp_interval=$(echo "$ramp_up_total / $num_connections" | bc -l)

# Array to store process IDs of opened connections
pids=()

echo "Starting $num_connections connections in $ramp_up_total seconds..."
for i in $(seq 1 $num_connections)
do
  node open_socket_connection.js &
  pids+=($!)
  sleep $ramp_interval
done

echo "All connections established. Holding for $hold_time seconds..."
sleep $hold_time

echo "Terminating connections..."
for pid in "${pids[@]}"
do
  kill $pid
done

echo "Test complete."
echo "All connections terminated."