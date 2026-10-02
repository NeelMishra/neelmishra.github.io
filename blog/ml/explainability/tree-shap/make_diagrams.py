"""Generate the series' original SVG diagrams from the actual lab trees."""
from pathlib import Path
from html import escape
from tree_shap_lab import TREE, REPEATED, CORRELATED, REORDERED


def draw(root, filename, title, customers=False):
    def count(n):
        return 1 if n.feature < 0 else count(n.left) + count(n.right)
    def depth(n):
        return 0 if n.feature < 0 else 1 + max(depth(n.left), depth(n.right))
    width, height = 800, 150 + 130 * depth(root)
    nodes, edges = [], []
    def place(n, low, high, level):
        x, y = (low + high) / 2, 70 + 130 * level
        nodes.append((n, x, y))
        if n.feature >= 0:
            cut = low + (high-low) * count(n.left) / count(n)
            for child, lo, hi in ((n.left, low, cut), (n.right, cut, high)):
                cx, cy = (lo + hi)/2, y + 130
                edges.append((x, y+28, cx, cy-28, f'{child.cover}/{n.cover}'))
                place(child, lo, hi, level+1)
    place(root, 0, width, 0)
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
             f'<title id="title">{escape(title)}</title>',
             '<desc id="desc">True branches go left, false branches go right. Edge labels show child cover divided by parent cover. Leaf boxes show predictions and reference counts.</desc>',
             '<rect width="100%" height="100%" fill="#fff"/>',
             '<g font-family="Arial, sans-serif" font-size="17" text-anchor="middle" fill="#172e35">']
    for x, y, xx, yy, label in edges:
        parts += [f'<path d="M{x},{y} L{xx},{yy}" stroke="#809398" stroke-width="2"/>',
                  f'<rect x="{(x+xx)/2-32}" y="{(y+yy)/2-12}" width="64" height="23" fill="#fff"/>',
                  f'<text x="{(x+xx)/2}" y="{(y+yy)/2+5}" font-size="15">{label}</text>']
    for n, x, y in nodes:
        label = f'Predict {n.value}' if n.feature < 0 else f'{"ABC"[n.feature]} ≤ {n.threshold:g}'
        detail = f'cover = {n.cover}'
        if customers:
            label = f'Predict ${n.value}' if n.feature < 0 else ('New customer?', 'Basic plan?', 'Low usage?')[n.feature]
            detail = f'{n.cover} customer' + ('s' if n.cover != 1 else '')
        color = '#e8f4ef' if n.feature < 0 else '#f1f5f7'
        parts += [f'<rect x="{x-77}" y="{y-28}" width="154" height="64" rx="9" fill="{color}" stroke="#237267"/>',
                  f'<text x="{x}" y="{y-2}" font-weight="700">{escape(label)}</text>',
                  f'<text x="{x}" y="{y+22}" font-size="15">{detail}</text>']
    legend = 'Yes → left · No → right · Counts come from the ten customers in the table' if customers else 'True → left · False → right · Edge fractions apply when that feature is hidden'
    parts += [f'<text x="400" y="{height-10}" font-size="15" fill="#566b70">{legend}</text>', '</g></svg>']
    Path(__file__).with_name('assets').joinpath(filename).write_text('\n'.join(parts)+'\n')


if __name__ == '__main__':
    draw(TREE, 'main-tree.svg', 'A spending tree built from the ten-customer table', customers=True)
    draw(REPEATED, 'repeated-tree.svg', 'A tree that splits on A twice along one path')
    draw(CORRELATED, 'background-tree.svg', 'The correlated-feature example: split on A first')
    draw(REORDERED, 'reordered-tree.svg', 'The same prediction function: split on B first')
