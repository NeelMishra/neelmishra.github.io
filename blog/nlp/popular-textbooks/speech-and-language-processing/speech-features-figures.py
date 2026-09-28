"""Generate original, explicitly synthetic speech figures. Requires NumPy and Matplotlib."""
from pathlib import Path
import re
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

OUT = Path(__file__).resolve().parent
plt.rcParams.update({'font.family': 'Arial', 'font.size': 12, 'svg.fonttype': 'none',
                     'svg.hashsalt': 'slp3-speech-features', 'figure.facecolor': '#fffdf9',
                     'axes.facecolor': '#fffdf9', 'text.color': '#13201a',
                     'axes.labelcolor': '#13201a', 'xtick.color': '#4a5a53', 'ytick.color': '#4a5a53',
                     'axes.spines.top': False, 'axes.spines.right': False})


def save(fig, name, title, description):
    target = OUT / name
    fig.savefig(target, metadata={'Date': None, 'Title': title, 'Description': description})
    plt.close(fig)
    svg = target.read_text()
    svg = re.sub(r'<svg\b', '<svg role="img"', svg, count=1)
    target.write_text('\n'.join(line.rstrip() for line in svg.splitlines()) + '\n')


freq = np.linspace(0, 3000, 1201)
def envelope(f):
    return .055 + .85 * np.exp(-((f - 650) / 170) ** 2) + .7 * np.exp(-((f - 1800) / 240) ** 2)
fig, axes = plt.subplots(2, 1, figsize=(10, 7.2), sharex=True)
fig.subplots_adjust(top=.78, bottom=.16, left=.11, right=.96, hspace=.38)
for ax, fundamental, color in zip(axes, [125, 200], ['#087354', '#496fa1']):
    harmonics = np.arange(fundamental, 3001, fundamental)
    ax.plot(freq, envelope(freq), '--', color='#88938b', lw=1.5, label='Same illustrative envelope')
    ax.vlines(harmonics, 0, envelope(harmonics), color=color, lw=2)
    ax.set_ylim(0, 1.05); ax.set_xlim(0, 3000)
    ax.set_ylabel('Relative amplitude'); ax.set_title(f'F0 = {fundamental} Hz  ·  harmonics every {fundamental} Hz', loc='left', fontsize=13, weight='bold')
    ax.grid(axis='y', alpha=.18)
axes[0].legend(frameon=False, loc='upper right', fontsize=10)
axes[1].set_xlabel('Frequency (Hz)')
fig.text(.04, .94, 'Harmonic spacing and formant locations are different', fontsize=20, weight='bold')
fig.text(.04, .88, 'A synthetic source–filter illustration; both envelopes peak at 650 and 1800 Hz.', fontsize=12)
fig.text(.11, .055, 'Changing F0 moves the harmonic samples. The chosen filter envelope stays fixed.\nThese are constructed spectra, not recordings or measured vowel formants.', fontsize=11)
save(fig, 'speech-features-source-filter.svg', 'Change harmonic spacing while holding the envelope fixed',
     'Two invented spectra have fundamental frequencies 125 and 200 Hz. Both use the same smooth envelope with peaks at 650 and 1800 Hz; the harmonic spacings differ.')

rate = 16000
t = np.arange(int(.8 * rate)) / rate
signal = np.sin(2 * np.pi * np.where(t < .4, 400, 900) * t) + .4 * np.sin(2 * np.pi * 1200 * t)
window, hop, fft_size = 400, 160, 512
starts = np.arange(0, len(signal) - window + 1, hop)
hamming = .54 - .46 * np.cos(2 * np.pi * np.arange(window) / (window - 1))
spectra = np.array([np.fft.rfft(signal[start:start + window] * hamming, n=fft_size) for start in starts])
power = abs(spectra) ** 2
db = 10 * np.log10(np.maximum(power / power.max(), 1e-6))
bins = np.fft.rfftfreq(fft_size, 1 / rate)
fig = plt.figure(figsize=(10, 9.4))
grid = fig.add_gridspec(3, 1, top=.84, bottom=.11, left=.11, right=.88, hspace=.65, height_ratios=[1, 1, 1.65])
a = fig.add_subplot(grid[0]); a.plot(t[:320] * 1000, signal[:320], color='#087354', lw=1.6)
a.set(xlabel='Time (ms)', ylabel='Amplitude', xlim=(0, 20), ylim=(-1.5, 1.5)); a.set_title('Waveform · the first 20 ms', loc='left', fontsize=13, weight='bold'); a.grid(alpha=.18)
b = fig.add_subplot(grid[1]); b.plot(bins, db[0], color='#496fa1', lw=1.7)
b.set(xlabel='Frequency (Hz)', ylabel='Relative power (dB)', xlim=(0, 2400), ylim=(-60, 3)); b.set_title('Spectrum · one 25 ms frame', loc='left', fontsize=13, weight='bold'); b.grid(alpha=.18)
c = fig.add_subplot(grid[2]); im = c.pcolormesh((starts + window / 2) / rate, bins, db.T, shading='nearest', cmap='viridis', vmin=-60, vmax=0, rasterized=True)
c.set(xlabel='Frame-center time (s)', ylabel='Frequency (Hz)', xlim=(0, .8), ylim=(0, 2400)); c.set_title('Spectrogram · spectra laid out over time', loc='left', fontsize=13, weight='bold')
c.axvline(.4, color='white', ls='--', lw=1); c.text(.415, 2100, '400 → 900 Hz', color='white', fontsize=11)
bar = fig.colorbar(im, cax=fig.add_axes([.905, .11, .018, .284])); bar.set_label('Relative power (dB)', fontsize=10); bar.ax.tick_params(labelsize=9)
fig.text(.04, .95, 'One signal, three different views', fontsize=21, weight='bold')
fig.text(.04, .902, 'Constructed tones: 400 Hz switches to 900 Hz at 0.4 s; a quieter 1200 Hz tone continues.', fontsize=11)
fig.text(.11, .027, '16 kHz sampling · 25 ms symmetric Hamming window · 10 ms hop · 512-point FFT\nColor uses 10 log10(power / maximum power); the display floor is −60 dB.', fontsize=10.5)
save(fig, 'speech-features-three-views.svg', 'Waveform, spectrum, and spectrogram of a synthetic signal',
     'A computed synthetic signal has a 400 Hz tone that switches to 900 Hz at 0.4 seconds and a quieter fixed 1200 Hz tone. The waveform shows amplitude over time, the spectrum shows frequency content of one frame, and the spectrogram shows the frequency change across frames.')

mel = lambda f: 1127 * np.log1p(f / 700)
hz = lambda m: 700 * np.expm1(m / 1127)
edges = hz(np.linspace(mel(0), mel(8000), 10))
fig, ax = plt.subplots(figsize=(10, 5.5))
fig.subplots_adjust(left=.10, right=.96, bottom=.24, top=.76)
colors = ['#087354', '#496fa1', '#ae5728', '#8862a5']
for j in range(8):
    ax.plot(edges[j:j+3], [0, 1, 0], lw=2, color=colors[j % 4])
ax.set(xlim=(0, 8000), ylim=(0, 1.08), xlabel='Frequency (Hz)', ylabel='Filter weight')
ax.set_xticks([0, 1000, 2000, 4000, 6000, 8000]); ax.grid(alpha=.18)
fig.text(.04, .94, 'Equal steps in mel become wider intervals in hertz', fontsize=20, weight='bold')
fig.text(.04, .866, 'Eight illustrative triangular filters; peak normalization, 0–8000 Hz range.', fontsize=12)
fig.text(.10, .085, 'Each output is a weighted sum of spectral power, followed by a log.\nReal pipelines choose the number of bands, normalization, and mel convention explicitly.', fontsize=11)
save(fig, 'speech-features-mel-bank.svg', 'Eight triangular filters equally spaced on a mel scale',
     'Eight triangular filters use edges equally spaced on the mel scale 1127 log(1 plus frequency divided by 700). Their widths increase in hertz; each peak weight is one.')
