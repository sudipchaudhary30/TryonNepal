import os
import matplotlib.pyplot as plt
import numpy as np

# Styling configuration for academic publication-quality graphics
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['font.size'] = 10
plt.rcParams['axes.labelsize'] = 11
plt.rcParams['axes.titlesize'] = 12
plt.rcParams['xtick.labelsize'] = 10
plt.rcParams['ytick.labelsize'] = 10
plt.rcParams['legend.fontsize'] = 10

output_dir = r"d:\6th sem\try on Nepal\TryonNepal\scripts\charts"
os.makedirs(output_dir, exist_ok=True)

# -----------------------------------------------------------------------------
# CHART 1: Real Nepalese Male (Ages 18-28) Anthropometric Size Brackets (cm)
# Source File: frontend/src/hooks/useNepaliSizeRecommendation.ts (lines 53-60)
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8, 4.5), dpi=300)

sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
shoulder_mins = [33, 39, 42, 45, 48, 52]
shoulder_maxs = [39, 42, 45, 48, 52, 58]
spans = [max_w - min_w for min_w, max_w in zip(shoulder_mins, shoulder_maxs)]

bar_colors = ['#4A6572', '#4A6572', '#D4A017', '#4A6572', '#4A6572', '#4A6572']

bars = ax.bar(sizes, spans, bottom=shoulder_mins, color=bar_colors, edgecolor='black', linewidth=1, width=0.55)

for bar, min_w, max_w, size in zip(bars, shoulder_mins, shoulder_maxs, sizes):
    center_y = min_w + (max_w - min_w) / 2
    label = f'{min_w}–{max_w} cm'
    if size == 'M':
        label += '\n(Modal 18–28)'
    ax.annotate(label,
                xy=(bar.get_x() + bar.get_width() / 2, center_y),
                ha='center', va='center', color='white', fontweight='bold', fontsize=8.5)

ax.set_ylabel('Shoulder Width Range (cm)')
ax.set_xlabel('Nepali Size Category (Source: useNepaliSizeRecommendation.ts)')
ax.set_title('Figure 1 (RQ1): Nepali Male (Ages 18–28) Anthropometric Sizing Bins', pad=15)
ax.set_ylim(30, 62)
ax.grid(axis='y', linestyle='--', alpha=0.5)
plt.tight_layout()
chart1_path = os.path.join(output_dir, 'fig1_nepali_male_sizing_bins.png')
plt.savefig(chart1_path)
plt.close()

# -----------------------------------------------------------------------------
# CHART 2: Real EMA Filter Smoothing Parameters (Alphas)
# Source File: frontend/src/hooks/useBodyTracker.ts (lines 175-177)
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(7.5, 4.5), dpi=300)

metrics = ['Position Alpha (PA)\n(x, y coordinates)', 'Size Alpha (SA)\n(width, height)', 'Rotation Alpha (RA)\n(tilt, turn, lean)']
alphas = [0.40, 0.35, 0.55]
colors = ['#1F77B4', '#2CA02C', '#FF7F0E']

bars = ax.bar(metrics, alphas, color=colors, width=0.45, edgecolor='black', linewidth=1)

for bar in bars:
    height = bar.get_height()
    ax.annotate(f'α = {height:.2f}',
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 6),
                textcoords="offset points",
                ha='center', va='bottom', fontweight='bold', fontsize=10)

ax.set_ylabel('EMA Alpha Coefficient (α)')
ax.set_title('Figure 2 (RQ1): Multi-Alpha EMA Signal Filter Parameters (useBodyTracker.ts)', pad=15)
ax.set_ylim(0, 0.70)
ax.grid(axis='y', linestyle='--', alpha=0.5)
plt.tight_layout()
chart2_path = os.path.join(output_dir, 'fig2_ema_alphas.png')
plt.savefig(chart2_path)
plt.close()

# -----------------------------------------------------------------------------
# CHART 3: Camera Model Distance Ratio Bounds (d_r)
# Source File: frontend/src/hooks/useNepaliSizeRecommendation.ts (lines 84-88)
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(7.5, 4.5), dpi=300)

bounds = ['IDEAL_RANGE_MIN\n(Too Far Threshold)', 'IDEAL_DISTANCE_RATIO\n(Reference Calibration)', 'IDEAL_RANGE_MAX\n(Too Close Threshold)']
ratios = [0.14, 0.24, 0.40]
colors = ['#E74C3C', '#27AE60', '#F39C12']

bars = ax.bar(bounds, ratios, color=colors, width=0.45, edgecolor='black', linewidth=1)

for bar in bars:
    height = bar.get_height()
    ax.annotate(f'd_r = {height:.2f}',
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 6),
                textcoords="offset points",
                ha='center', va='bottom', fontweight='bold', fontsize=10)

ax.set_ylabel('Distance Ratio (shoulderWidth / canvasWidth)')
ax.set_title('Figure 3 (RQ1): Camera Pinhole Model Distance Bounds (useNepaliSizeRecommendation.ts)', pad=15)
ax.set_ylim(0, 0.50)
ax.grid(axis='y', linestyle='--', alpha=0.5)
plt.tight_layout()
chart3_path = os.path.join(output_dir, 'fig3_distance_bounds.png')
plt.savefig(chart3_path)
plt.close()

# -----------------------------------------------------------------------------
# CHART 4: Vertical Bar Chart with Clean Explanation Box in Upper-Left White Space
# Source File: system_architecture_overview.md (Client WebAR vs FastAPI VTON)
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(7.5, 5), dpi=300)

modes = ['Real-Time AR Mirror\n(Client WebAssembly WASM)', 'Static Neural VTON\n(FastAPI /api/tryon Endpoint)']
data_kb = [0, 1250]
colors = ['#27AE60', '#2980B9']

bars = ax.bar(modes, data_kb, color=colors, width=0.38, edgecolor='black', linewidth=1)

for bar in bars:
    height = bar.get_height()
    ax.annotate(f'{height:,} KB',
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 6),
                textcoords="offset points",
                ha='center', va='bottom', fontweight='bold', fontsize=11)

# Clean 3-Line Explanation Box placed inside the open white space above 0 KB bar
callout_text = (
    "Why 0 KB Transmitted?\n"
    "• 100% Client-Side Browser WASM Execution\n"
    "• MediaPipe Pose tracks landmarks in RAM\n"
    "• Zero video frames or face data sent to cloud"
)

ax.text(-0.36, 750, callout_text,
        fontsize=8.5, fontweight='bold', color='#1E8449',
        bbox=dict(boxstyle='round,pad=0.6', facecolor='#EAFAF1', edgecolor='#27AE60', lw=1.5),
        va='center', ha='left')

ax.set_ylabel('Webcam Data Transmitted to Server (KB)')
ax.set_title('Figure 4 (RQ2): Telemetry Data Upload Minimization (Client WASM vs. Server)', pad=15)
ax.set_ylim(0, 1550)
ax.set_xlim(-0.45, 1.45)
ax.grid(axis='y', linestyle='--', alpha=0.5)
plt.tight_layout()
chart4_path = os.path.join(output_dir, 'fig4_telemetry_upload.png')
plt.savefig(chart4_path)
plt.close()

print("Figure 4 updated with clean 3-line explanation box above 0 KB bar.")
