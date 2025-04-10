import psutil
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import time
import argparse
import numpy as np
from scipy.ndimage import gaussian_filter1d

# Parse command-line arguments
parser = argparse.ArgumentParser(description='Real-Time Resource Monitor')
parser.add_argument('--connections', type=int, default=0, help='Number of connections')
parser.add_argument('--ramp', type=float, default=0, help='Ramp-up time in seconds')
parser.add_argument('--hold', type=float, default=0, help='Hold time in seconds')
args = parser.parse_args()

num_connections = args.connections
ramp_time = args.ramp
hold_time = args.hold

# Use a dark background style for a modern look
plt.style.use('dark_background')

# Lists for time, CPU, Memory, and Network (upload/download)
times = []
cpu_usage = []
mem_usage = []
net_sent = []
net_recv = []

# Obtain initial network counters
net_io_prev = psutil.net_io_counters()

# Create figure and subplots; adjust top to leave space for titles/annotations
fig, (ax_cpu, ax_mem, ax_net) = plt.subplots(3, 1, figsize=(12, 14))
fig.subplots_adjust(top=0.85)

# Set the main super-title; using y=0.96 to leave space
fig.suptitle(
    f"Real-Time Resource Monitoring: {num_connections} Connections | Ramp-Up: {ramp_time}s | Hold: {hold_time}s",
    fontsize=16,
    y=0.96
)

# Place an annotation for active connections below the suptitle (e.g., at 0.93)
active_conn_text = fig.text(0.5, 0.93, "", ha="center", fontsize=14, color="white")

start_time = time.time()
baseline_delay = 4  # 4-second window before the load test starts

def smooth(data, sigma=2):
    """Apply a Gaussian filter for smoothing."""
    if len(data) < 2:
        return data
    return gaussian_filter1d(np.array(data), sigma=sigma)

def update(frame):
    # Check if the figure is still open, if not, just return
    if not plt.fignum_exists(fig.number):
        return
    global net_io_prev

    # Calculate active connections on port 9996 in ESTABLISHED state
    active_connections = sum(1 for conn in psutil.net_connections(kind="tcp")
                             if conn.laddr and conn.laddr.port == 9996 and conn.status == "ESTABLISHED")
    active_conn_text.set_text(f"Active Connections (port 9996): {active_connections}")

    current_time = time.time() - start_time
    times.append(current_time)

    # Append CPU and Memory usage
    cpu = psutil.cpu_percent(interval=None)
    mem = psutil.virtual_memory().percent
    cpu_usage.append(cpu)
    mem_usage.append(mem)

    # Update network usage (KB/sec)
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

    # Compute smoothed data
    smoothed_cpu = smooth(cpu_usage, sigma=2)
    smoothed_mem = smooth(mem_usage, sigma=2)
    smoothed_net_sent = smooth(net_sent, sigma=2)
    smoothed_net_recv = smooth(net_recv, sigma=2)

    # Plot CPU usage with area filling
    ax_cpu.plot(times, smoothed_cpu, label="CPU (%)", color='cyan', lw=2)
    ax_cpu.fill_between(times, smoothed_cpu, 0, color='cyan', alpha=0.3)
    ax_cpu.set_ylim(0, 100)
    ax_cpu.set_title("Real-Time CPU Usage", fontsize=14)
    ax_cpu.set_xlabel("Time (seconds)", fontsize=12)
    ax_cpu.set_ylabel("CPU Usage (%)", fontsize=12)
    ax_cpu.grid(True, linestyle="--", alpha=0.5)
    ax_cpu.legend(loc='upper left', fontsize=10)

    # Plot Memory usage with area filling
    ax_mem.plot(times, smoothed_mem, label="Memory (%)", color='orange', lw=2)
    ax_mem.fill_between(times, smoothed_mem, 0, color='orange', alpha=0.3)
    ax_mem.set_ylim(0, 100)
    ax_mem.set_title("Real-Time Memory Usage", fontsize=14)
    ax_mem.set_xlabel("Time (seconds)", fontsize=12)
    ax_mem.set_ylabel("Memory Usage (%)", fontsize=12)
    ax_mem.grid(True, linestyle="--", alpha=0.5)
    ax_mem.legend(loc='upper left', fontsize=10)

    # Plot Network throughput with area filling
    ax_net.plot(times, smooth(net_sent, sigma=2), label="Upload (KB/s)", color='green', lw=2)
    ax_net.fill_between(times, smooth(net_sent, sigma=2), 0, color='green', alpha=0.3)
    ax_net.plot(times, smooth(net_recv, sigma=2), label="Download (KB/s)", color='red', lw=2)
    ax_net.fill_between(times, smooth(net_recv, sigma=2), 0, color='red', alpha=0.3)
    ax_net.set_title("Real-Time Network Usage", fontsize=14)
    ax_net.set_xlabel("Time (seconds)", fontsize=12)
    ax_net.set_ylabel("Throughput (KB/s)", fontsize=12)
    ax_net.grid(True, linestyle="--", alpha=0.5)
    ax_net.legend(loc='upper left', fontsize=10)

        # Add vertical breakpoint lines and annotations:
    for ax in (ax_cpu, ax_mem, ax_net):
        ax.axvline(x=baseline_delay, color='purple', linestyle='--', lw=1.5)
        ax.axvline(x=(ramp_time + hold_time), color='red', linestyle='--', lw=1.5)
    ylim_cpu = ax_cpu.get_ylim()
    ax_cpu.annotate("First Connection", xy=(baseline_delay, ylim_cpu[1]),
                    xytext=(baseline_delay+5, ylim_cpu[1]-10),
                    arrowprops=dict(arrowstyle="->", color="yellow"),
                    fontsize=10, color="yellow")
    ax_cpu.annotate("Test End", xy=((ramp_time + hold_time), ylim_cpu[0]),
                    xytext=((ramp_time + hold_time)-20, ylim_cpu[0]+10),
                    arrowprops=dict(arrowstyle="->", color="red"),
                    fontsize=10, color="red")

    # Automatically close figure after monitoring period is over (baseline_delay included if desired)
    if current_time >= (ramp_time + hold_time + 2):
        ani.event_source.stop()
        plt.close(fig)


# Callback function to save the final graph when the figure is closed
def on_close(event):
    print("Figure closed. Saving final graph to resource_monitor_final.png")
    fig.savefig("resource_monitor_final.png", dpi=300)

fig.canvas.mpl_connect("close_event", on_close)

ani = animation.FuncAnimation(fig, update, interval=1000)
plt.show()

