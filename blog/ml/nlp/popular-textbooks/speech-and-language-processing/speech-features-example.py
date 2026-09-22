"""Reproduce the speech-feature companion's small calculations; standard library only."""
import cmath
import math


def alias_frequency(frequency, sample_rate):
    remainder = frequency % sample_rate
    return min(remainder, sample_rate - remainder)


def frame_count(samples, window, hop):
    return max(0, 1 + (samples - window) // hop)


def dft(samples):
    size = len(samples)
    return [sum(value * cmath.exp(-2j * math.pi * k * n / size)
                for n, value in enumerate(samples)) for k in range(size)]


def dct2(values):
    size = len(values)
    return [(math.sqrt(1 / size) if k == 0 else math.sqrt(2 / size)) *
            sum(value * math.cos(math.pi * (m + .5) * k / size)
                for m, value in enumerate(values)) for k in range(size)]


if __name__ == '__main__':
    for rate in [8000, 16000]:
        for frequency in range(500, 7501, 250):
            folded = alias_frequency(frequency, rate)
            assert 0 <= folded <= rate / 2
            for sample in range(65):
                assert math.isclose(math.cos(2 * math.pi * frequency * sample / rate),
                                    math.cos(2 * math.pi * folded * sample / rate), abs_tol=1e-12)
    assert alias_frequency(6000, 8000) == 2000
    assert frame_count(16000, 400, 160) == 98
    assert frame_count(399, 400, 160) == 0
    assert frame_count(400, 400, 160) == 1
    samples = [math.cos(2 * math.pi * n / 8) + .5 * math.cos(4 * math.pi * n / 8) for n in range(8)]
    spectrum = dft(samples)
    assert math.isclose(abs(spectrum[1]), 4, abs_tol=1e-12)
    assert math.isclose(abs(spectrum[2]), 2, abs_tol=1e-12)
    energy = sum(x * x for x in samples)
    assert math.isclose(energy, 5)
    assert math.isclose(energy, sum(abs(x) ** 2 for x in spectrum) / 8)
    powers = [1, 4, 9, 4]
    filters = [[.5, 1, .5, 0], [0, 0, .5, 1]]
    bands = [sum(p * w for p, w in zip(powers, weights)) for weights in filters]
    assert bands == [9, 8.5]
    cepstral = dct2([math.log(x) for x in [1, 2, 4, 8]])
    assert math.isclose(cepstral[0], 3 * math.log(2))
    assert math.isclose(sum(x * x for x in cepstral), sum(math.log(x) ** 2 for x in [1, 2, 4, 8]))
    print('58 alias settings match at all sampled instants.')
    print('Frames:', frame_count(16000, 400, 160), 'FFT bin spacing:', 16000 / 512, 'Hz')
    print('Eight-sample energy:', energy, 'mean square:', energy / 8, 'RMS:', math.sqrt(energy / 8))
    print('Filter energies:', bands, 'natural logs:', [math.log(x) for x in bands])
    print('Orthonormal DCT-II of log([1,2,4,8]):', cepstral)
