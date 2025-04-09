import psutil
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import time
import argparse

# Parse command-line arguments
parser = argparse.ArgumentParser(description='Real-Time Resource Monitor')
parser.add_argument('--connections', type=int, default=0, help='Number of connections')
parser.add_argument('--ramp', type=float, default=0, help='Ramp-up time in seconds')
parser.add_argument('--hold', type=float, default=0, help='Hold time in seconds')
args = parser.parse_args()

num_connections = args.connections
ramp_time = args.ramp
hold_time = args.hold

plt.style.use('ggplot')  # Use ggplot style for improved visuals

# Lists to hold data for time, CPU, Memory, and Network (upload and download)
times = []
cpu_usage = []
mem_usage = []
net_sent = []
net_recv = []

# Obtain initial network counters
net_io_prev = psutil.net_io_counters()

# Create a figure with three subplots: CPU, Memory, and Network usage
# Create the subplots and adjust the top to leave space
fig, (ax_cpu, ax_mem, ax_net) = plt.subplots(3, 1, figsize=(12, 14))
fig.subplots_adjust(top=0.85)  # Move the subplots down

# Place the main title higher (y=0.96) so it doesn't get cut off
fig.suptitle(
    f"Real-Time Resource Monitoring: {num_connections} Connections | Ramp-Up: {ramp_time}s | Hold: {hold_time}s",
    fontsize=16,
    y=0.96
)

# Now place the active connections text a bit lower (y=0.92) so it doesn't overlap the title
active_conn_text = fig.text(
    0.5, 0.92,
    "",
    ha="center",
    fontsize=14,
    color="black"
)

# After setting the suptitle, add a text annotation below it:
fig.suptitle(f"Real-Time Resource Monitoring: {num_connections} Connections | Ramp-Up: {ramp_time}s | Hold: {hold_time}s", fontsize=16)
active_conn_text = fig.text(0.5, 0.93, "", ha="center", fontsize=14, color="black")


start_time = time.time()

def update(frame):
    global net_io_prev  # Declare that we use the global variable

    # Count the number of active TCP connections on port 9996 (only considering ESTABLISHED ones)
    active_connections = sum(1 for conn in psutil.net_connections(kind="tcp")
                             if conn.laddr and conn.laddr.port == 9996 and conn.status == "ESTABLISHED")
    # Update the active connections annotation
    active_conn_text.set_text(f"Active Connections (port 9996): {active_connections}")

    current_time = time.time() - start_time
    times.append(current_time)

    # Get CPU and memory usage
    cpu = psutil.cpu_percent(interval=None)
    mem = psutil.virtual_memory().percent
    cpu_usage.append(cpu)
    mem_usage.append(mem)

    # Get network counters and calculate differences (KB/sec)
    net_io_current = psutil.net_io_counters()
    sent_rate = (net_io_current.bytes_sent - net_io_prev.bytes_sent) / 1024.0
    recv_rate = (net_io_current.bytes_recv - net_io_prev.bytes_recv) / 1024.0
    net_sent.append(sent_rate)
    net_recv.append(recv_rate)
    net_io_prev = net_io_current

    # Clear all axes
    ax_cpu.clear()
    ax_mem.clear()
    ax_net.clear()

    # Plot CPU usage
    ax_cpu.plot(times, cpu_usage, label="CPU (%)", color='blue', lw=2, marker='o', markersize=4)
    ax_cpu.set_ylim(0, 100)
    ax_cpu.set_title("Real-Time CPU Usage", fontsize=14)
    ax_cpu.set_xlabel("Time (seconds)", fontsize=12)
    ax_cpu.set_ylabel("CPU Usage (%)", fontsize=12)
    ax_cpu.grid(True, linestyle="--", alpha=0.6)
    ax_cpu.legend(loc='upper left', fontsize=10)

    # Plot Memory usage
    ax_mem.plot(times, mem_usage, label="Memory (%)", color='orange', lw=2, marker='o', markersize=4)
    ax_mem.set_ylim(0, 100)
    ax_mem.set_title("Real-Time Memory Usage", fontsize=14)
    ax_mem.set_xlabel("Time (seconds)", fontsize=12)
    ax_mem.set_ylabel("Memory Usage (%)", fontsize=12)
    ax_mem.grid(True, linestyle="--", alpha=0.6)
    ax_mem.legend(loc='upper left', fontsize=10)

    # Plot Network throughput (upload/download)
    ax_net.plot(times, net_sent, label="Upload (KB/s)", color='green', lw=2, marker='o', markersize=4)
    ax_net.plot(times, net_recv, label="Download (KB/s)", color='red', lw=2, marker='o', markersize=4)
    ax_net.set_title("Real-Time Network Usage", fontsize=14)
    ax_net.set_xlabel("Time (seconds)", fontsize=12)
    ax_net.set_ylabel("Throughput (KB/s)", fontsize=12)
    ax_net.grid(True, linestyle="--", alpha=0.6)
    ax_net.legend(loc='upper left', fontsize=10)

# Callback function to save the final graph when the figure is closed
def on_close(event):
    print("Figure closed. Saving final graph to resource_monitor_final.png")
    fig.savefig("resource_monitor_final.png", dpi=300)

# Connect the close event callback
fig.canvas.mpl_connect("close_event", on_close)

# Create an animation that updates the plots every 1000 ms (1 second)
ani = animation.FuncAnimation(fig, update, interval=1000)

# Start the event loop (blocking)
plt.show()
fig.savefig("resource_monitor_initial.png", dpi=300)  # Save the initial state of the graph
# Save the final state of the graph when closed
fig.savefig("resource_monitor_final.png", dpi=300)  # Save the final state of the graph