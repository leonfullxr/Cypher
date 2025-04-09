import psutil
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import time
import argparse

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
fig, (ax_cpu, ax_mem, ax_net) = plt.subplots(3, 1, figsize=(12, 14))
plt.subplots_adjust(hspace=0.6)
fig.suptitle(f"Real-Time Resource Monitoring: {num_connections} Connections | Ramp-Up: {ramp_time}s | Hold: {hold_time}s", fontsize=16)
start_time = time.time()

def update(frame):
    global net_io_prev  # declare global at the start
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

    # Clear axes
    ax_cpu.clear()
    ax_mem.clear()
    ax_net.clear()

    # Plot CPU usage with markers, grid, and labels
    ax_cpu.plot(times, cpu_usage, label="CPU (%)", color='blue', lw=2, marker='o', markersize=4)
    ax_cpu.set_ylim(0, 100)
    ax_cpu.set_title("Real-Time CPU Usage", fontsize=14)
    ax_cpu.set_xlabel("Time (seconds)", fontsize=12)
    ax_cpu.set_ylabel("CPU Usage (%)", fontsize=12)
    ax_cpu.grid(True, linestyle="--", alpha=0.6)
    ax_cpu.legend(loc='upper left', fontsize=10)

    # Plot Memory usage with markers, grid, and labels
    ax_mem.plot(times, mem_usage, label="Memory (%)", color='orange', lw=2, marker='o', markersize=4)
    ax_mem.set_ylim(0, 100)
    ax_mem.set_title("Real-Time Memory Usage", fontsize=14)
    ax_mem.set_xlabel("Time (seconds)", fontsize=12)
    ax_mem.set_ylabel("Memory Usage (%)", fontsize=12)
    ax_mem.grid(True, linestyle="--", alpha=0.6)
    ax_mem.legend(loc='upper left', fontsize=10)

    # Plot Network throughput (upload/download) with markers, grid, and labels
    ax_net.plot(times, net_sent, label="Upload (KB/s)", color='green', lw=2, marker='o', markersize=4)
    ax_net.plot(times, net_recv, label="Download (KB/s)", color='red', lw=2, marker='o', markersize=4)
    ax_net.set_title("Real-Time Network Usage", fontsize=14)
    ax_net.set_xlabel("Time (seconds)", fontsize=12)
    ax_net.set_ylabel("Throughput (KB/s)", fontsize=12)
    ax_net.grid(True, linestyle="--", alpha=0.6)
    ax_net.legend(loc='upper left', fontsize=10)


def on_close(event):
    print("Figure closed. Saving final graph to resource_monitor_final.png")
    fig.savefig("resource_monitor_final.png", dpi=300)

fig.canvas.mpl_connect("close_event", on_close)

# Create animation that updates the plots every 1000 ms (1 second)
ani = animation.FuncAnimation(fig, update, interval=1000)
plt.show()
fig.savefig("resource_monitor_final.png", dpi=300)