"""Original worked examples accompanying Umar Jamil's quantization lecture.

Requires PyTorch 2.6.0; the MNIST experiment also requires torchvision 0.21.0.
Run without arguments for a small, offline API and arithmetic check.
Run with --mnist to train the lecture's 784 -> 100 -> 100 -> 10 architecture.
"""

import argparse
import copy
import io
import json
import math
from pathlib import Path
import platform

import torch
from torch import nn
from torch.ao import quantization as quant
from torch.utils.data import DataLoader, TensorDataset, random_split


def validate_values(values, bits):
    if not isinstance(bits, int) or isinstance(bits, bool) or not 2 <= bits <= 8:
        raise ValueError("Use an integer bit width between 2 and 8.")
    if values.numel() == 0 or not values.is_floating_point() or not torch.isfinite(values).all():
        raise ValueError("Quantization requires a nonempty, finite floating-point tensor.")


def affine_quantize(values, bits=8, lower=None, upper=None):
    validate_values(values, bits)
    lower = float(values.min()) if lower is None else float(lower)
    upper = float(values.max()) if upper is None else float(upper)
    if not math.isfinite(lower) or not math.isfinite(upper) or lower > upper:
        raise ValueError("Quantization bounds must be finite and ordered.")
    lower, upper = min(lower, 0.0), max(upper, 0.0)
    qmax = 2**bits - 1
    scale = (upper - lower) / qmax if upper != lower else 1.0
    if not math.isfinite(scale) or scale <= 0:
        raise ValueError("The selected interval must have a finite, positive scale.")
    zero = max(0, min(qmax, round(-lower / scale)))
    codes = (torch.round(values / scale) + zero).clamp(0, qmax).to(torch.uint8)
    restored = (codes.to(values.dtype) - zero) * scale
    return codes, restored, scale, zero


def symmetric_quantize(values, bits=8):
    validate_values(values, bits)
    qmax = 2 ** (bits - 1) - 1
    maximum = float(values.abs().max())
    scale = maximum / qmax if maximum else 1.0
    codes = torch.round(values / scale).clamp(-qmax, qmax).to(torch.int8)
    return codes, codes.to(values.dtype) * scale, scale


def mse(original, restored):
    return float((original - restored).square().mean())


def arithmetic_examples():
    values = torch.tensor([-1.0, -0.73, 0.0, 0.86, 1.72, 2.0], dtype=torch.float64)
    codes, restored, scale, zero = affine_quantize(values, bits=4)
    symmetric, symmetric_restored, symmetric_scale = symmetric_quantize(values, bits=4)
    assert codes.tolist() == [0, 1, 5, 9, 14, 15]
    assert zero == 5 and abs(scale - 0.2) < 1e-12
    assert float(restored[2]) == 0.0
    for constant in [torch.zeros(4), torch.ones(4), -torch.ones(4)]:
        _, recovered, _, _ = affine_quantize(constant)
        assert torch.allclose(constant, recovered)

    population = torch.cat((torch.linspace(-50, 150, 9999, dtype=torch.float64),
                            torch.tensor([1000.0], dtype=torch.float64)))
    _, all_restored, all_scale, _ = affine_quantize(population)
    lower, upper = torch.quantile(population, torch.tensor([0.0001, 0.9999], dtype=torch.float64))
    _, clipped_restored, clipped_scale, _ = affine_quantize(
        population, lower=float(lower), upper=float(upper))
    assert mse(population[:-1], clipped_restored[:-1]) < mse(population[:-1], all_restored[:-1])
    assert mse(population, clipped_restored) > mse(population, all_restored)

    weights = torch.tensor([[-0.04, -0.01, 0.02, 0.05], [-20, -5, 10, 20]],
                           dtype=torch.float64)
    _, shared, _ = symmetric_quantize(weights)
    per_channel = torch.stack([symmetric_quantize(row)[1] for row in weights])
    assert torch.equal(shared[0], torch.zeros(4, dtype=torch.float64))
    assert mse(weights[0], per_channel[0]) < mse(weights[0], shared[0])

    xq = torch.tensor([5, 9], dtype=torch.uint8)
    wq = torch.tensor([-5, 10], dtype=torch.int8)
    sx, zx, sw, zw, bias = 0.2, 3, 0.1, 0, 0.1
    products = (xq.to(torch.int32) - zx) * (wq.to(torch.int32) - zw)
    bias_code = round(bias / (sx * sw))
    accumulator = int(products.sum()) + bias_code
    output_code = round((sx * sw / 0.1) * accumulator) + 7
    assert accumulator == 55 and output_code == 18
    assert abs(sx * sw * accumulator - 1.1) < 1e-12

    values_ste = torch.tensor([-1.2, -0.8, 0.0, 0.8, 1.2], requires_grad=True)
    fake = torch.fake_quantize_per_tensor_affine(values_ste, 0.25, 0, -4, 4)
    fake.sum().backward()
    assert values_ste.grad.tolist() == [0.0, 1.0, 1.0, 1.0, 0.0]

    return {
        "toy": {"values": values.tolist(), "codes": codes.tolist(), "scale": scale,
                "zero": zero, "restored": restored.tolist(), "mse": mse(values, restored),
                "symmetric_codes": symmetric.tolist(), "symmetric_scale": symmetric_scale,
                "symmetric_mse": mse(values, symmetric_restored)},
        "outliers": {
            "count": len(population), "percentile": 99.99,
            "minmax": {"scale": all_scale, "bulk_mse": mse(population[:-1], all_restored[:-1]),
                       "all_mse": mse(population, all_restored)},
            "percentile_range": {
                "lower": float(lower), "upper": float(upper), "scale": clipped_scale,
                "bulk_mse": mse(population[:-1], clipped_restored[:-1]),
                "all_mse": mse(population, clipped_restored)}},
        "channels": {"weights": weights.tolist(), "shared": shared.tolist(),
                     "per_channel": per_channel.tolist()},
        "mac": {"products": products.tolist(), "bias_code": bias_code,
                "accumulator": accumulator, "output_code": output_code},
        "ste": {"inputs": values_ste.detach().tolist(), "gradients": values_ste.grad.tolist()},
    }


class DigitMLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.quant = quant.QuantStub()
        self.fc1 = nn.Linear(784, 100)
        self.relu1 = nn.ReLU()
        self.fc2 = nn.Linear(100, 100)
        self.relu2 = nn.ReLU()
        self.fc3 = nn.Linear(100, 10)
        self.dequant = quant.DeQuantStub()

    def forward(self, images):
        x = self.quant(images.flatten(1))
        x = self.relu1(self.fc1(x))
        x = self.relu2(self.fc2(x))
        return self.dequant(self.fc3(x))


def train(model, loader, epochs, learning_rate):
    model.train()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    for _ in range(epochs):
        for images, labels in loader:
            optimizer.zero_grad()
            loss = nn.functional.cross_entropy(model(images), labels)
            loss.backward()
            optimizer.step()


def calibrate(model, loader, batches):
    model.eval()
    with torch.no_grad():
        for index, (images, _) in enumerate(loader):
            if index >= batches:
                break
            model(images)


def evaluate(model, loader):
    model.eval()
    correct, count = 0, 0
    with torch.no_grad():
        for images, labels in loader:
            logits = model(images)
            assert logits.shape == (len(labels), 10)
            assert logits.dtype == torch.float32 and torch.isfinite(logits).all()
            correct += int((logits.argmax(dim=1) == labels).sum())
            count += len(labels)
    return correct / count


def serialized_bytes(model):
    buffer = io.BytesIO()
    torch.save(model.state_dict(), buffer)
    return buffer.tell()


def loaders(args):
    if not args.mnist:
        dataset = TensorDataset(torch.randn(64, 1, 28, 28), torch.randint(0, 10, (64,)))
        loader = DataLoader(dataset, batch_size=32)
        return loader, loader, loader

    from torchvision import datasets, transforms
    transform = transforms.Compose([
        transforms.ToTensor(), transforms.Normalize((0.1307,), (0.3081,))])
    full_train = datasets.MNIST(args.data_dir, train=True, download=True, transform=transform)
    training, calibration = random_split(
        full_train, [55000, 5000], generator=torch.Generator().manual_seed(args.seed))
    testing = datasets.MNIST(args.data_dir, train=False, download=True, transform=transform)
    training_loader = DataLoader(training, batch_size=128, shuffle=True,
                                generator=torch.Generator().manual_seed(args.seed + 1))
    return training_loader, DataLoader(calibration, batch_size=128), DataLoader(testing, batch_size=128)


def run(args):
    torch.manual_seed(args.seed)
    torch.set_num_threads(2)
    if "qnnpack" not in torch.backends.quantized.supported_engines:
        raise RuntimeError("This teaching example requires a PyTorch CPU build with qnnpack.")
    torch.backends.quantized.engine = "qnnpack"
    examples = arithmetic_examples()
    training, calibration, testing = loaders(args)
    baseline = DigitMLP()
    train(baseline, training, args.epochs, learning_rate=0.001)
    baseline.eval()

    observed = copy.deepcopy(baseline)
    observed.qconfig = quant.get_default_qconfig("qnnpack")
    observed = quant.prepare(observed, inplace=False)
    images, _ = next(iter(calibration))
    with torch.no_grad():
        assert torch.equal(baseline(images), observed(images))
    calibrate(observed, calibration, args.calibration_batches)
    ptq = quant.convert(observed, inplace=False)

    dynamic = quant.quantize_dynamic(copy.deepcopy(baseline), {nn.Linear}, dtype=torch.qint8)

    qat_prepared = copy.deepcopy(baseline).train()
    qat_prepared.qconfig = quant.get_default_qat_qconfig("qnnpack")
    qat_prepared = quant.prepare_qat(qat_prepared, inplace=False)
    assert any(isinstance(module, quant.FakeQuantize) for module in qat_prepared.modules())
    assert qat_prepared.fc1.weight.dtype == torch.float32
    train(qat_prepared, training, args.epochs, learning_rate=0.0001)
    assert torch.isfinite(qat_prepared.fc1.weight.grad).all()
    assert torch.count_nonzero(qat_prepared.fc1.weight.grad) > 0
    qat = quant.convert(qat_prepared.eval(), inplace=False)

    results = {}
    for name, model in [("fp32", baseline), ("dynamic_int8", dynamic),
                        ("static_ptq", ptq), ("qat_int8", qat)]:
        accuracy = evaluate(model, testing)
        if name != "fp32":
            assert model.fc1.weight().dtype == torch.qint8
        results[name] = {"accuracy": accuracy if args.mnist else None,
                         "state_dict_bytes": serialized_bytes(model)}
    assert results["static_ptq"]["state_dict_bytes"] < results["fp32"]["state_dict_bytes"]
    return {
        "torch": torch.__version__, "backend": "qnnpack", "seed": args.seed,
        "python": platform.python_version(), "machine": platform.machine(),
        "system": platform.system(),
        "mode": "mnist" if args.mnist else "offline_api_check",
        "epochs_fp32": args.epochs, "additional_qat_epochs": args.epochs,
        "training_examples": len(training.dataset), "calibration_examples": len(calibration.dataset),
        "calibration_batches": min(args.calibration_batches, len(calibration)),
        "test_examples": len(testing.dataset), "examples": examples, "models": results}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mnist", action="store_true", help="Run the real MNIST experiment.")
    parser.add_argument("--data-dir", default="data", help="MNIST download/cache directory.")
    parser.add_argument("--epochs", type=int, default=1)
    parser.add_argument("--calibration-batches", type=int, default=32)
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument("--output", type=Path, help="Write the measured results as JSON.")
    args = parser.parse_args()
    if args.epochs < 1 or args.calibration_batches < 1:
        parser.error("Epochs and calibration batches must be positive.")
    text = json.dumps(run(args), indent=2, allow_nan=False)
    if args.output:
        args.output.write_text(text + "\n", encoding="utf-8")
    print(text)


if __name__ == "__main__":
    main()
