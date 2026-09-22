"""Reproduce the three four-row threshold comparison figures with Python 3."""
from pathlib import Path
assets=Path(__file__).resolve().parent
x=[1,2,3,4];r=[-4,-2,2,4]
for split in [1.5,2.5,3.5]:
 left=[v for i,v in zip(x,r) if i<split];right=[v for i,v in zip(x,r) if i>=split]
 means=[sum(left)/len(left),sum(right)/len(right)]
 error=sum((v-means[0 if i<split else 1])**2 for i,v in zip(x,r))
 px=lambda v:64+(v-.5)*99
 py=lambda v:310-(v+5)*24
 cut=px(split)
 parts=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 438" role="img" aria-labelledby="title desc"><title id="title">Residual split at {split}</title><desc id="desc">Residual targets minus four, minus two, plus two, plus four. Leaf corrections {means[0]:.3f} and {means[1]:.3f}; total squared error {error:.3f}.</desc><rect width="520" height="438" rx="12" fill="#fafaf7"/><g font-family="Arial,sans-serif" fill="#233f36"><text x="26" y="32" font-size="22" font-weight="bold">Which rows should share a correction?</text>', '<text x="26" y="58" font-size="17">Residual or leaf correction</text>']
 for v in [-4,-2,0,2,4]:
  yy=py(v)
  parts.append(f'<path d="M64 {yy} H460" stroke="#dbe1db"/><text x="50" y="{yy+6}" text-anchor="end" font-size="18">{v}</text>')
 parts.append(f'<path d="M{cut} 70 V310" stroke="#777" stroke-width="2" stroke-dasharray="6 5"/>')
 parts.append(f'<path d="M64 {py(means[0])} H{cut} M{cut} {py(means[1])} H460" stroke="#087f6d" stroke-width="4"/>')
 for i,v in zip(x,r):
  pred=means[0 if i<split else 1]
  parts.append(f'<path d="M{px(i)} {py(v)} V{py(pred)}" stroke="#b2682a" stroke-width="2" stroke-dasharray="3 3"/><circle cx="{px(i)}" cy="{py(v)}" r="7" fill="#b2682a"/><text x="{px(i)}" y="337" text-anchor="middle" font-size="19">{i}</text>')
 parts.append('<text x="454" y="364" font-size="18" text-anchor="end">Input x</text>')
 parts.append(f'<circle cx="34" cy="361" r="6" fill="#b2682a"/><text x="48" y="367" font-size="17">Residual</text><path d="M160 361 H188" stroke="#087f6d" stroke-width="4"/><text x="198" y="367" font-size="17">Leaf mean</text>')
 parts.append(f'<text x="26" y="397" font-size="19">Cut: {split} · means: {means[0]:.2f}, {means[1]:.2f}</text><text x="26" y="424" font-size="19" font-weight="bold">Squared error: {error:.2f} · reduction: {40-error:.2f}</text></g></svg>')
 (assets/f'residual-split-{str(split).replace(".","p")}.svg').write_text('\n'.join(parts)+'\n')
