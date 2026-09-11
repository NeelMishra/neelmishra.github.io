#!/usr/bin/env python3
"""Render the same accessible model map into all eight Foundations chapters.

Run from any directory: python3 tools/render_transformer_foundation_map.py
The checked-in HTML works without JavaScript. Only the marked map/recap regions
and their stylesheet link are managed here; chapter prose is left intact.
"""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CHAPTER_DIR = ROOT / "blog/dl/transformers/building-blocks"
CSS = '<link rel="stylesheet" href="../foundation-map.css?v=foundation-map-20260911">'

# Slug, diagram label, the component's input/output, and its place in the model.
CHAPTERS = [
    ("embedding-layer", "Token embeddings",
     "Token IDs come in; one learned vector per token comes out. These are the starting vectors that later blocks will update.",
     'You can now turn IDs such as <code>[4, 1, 4]</code> into vectors. After adding position information, the model sends them into its first block. Next, zoom into <a href="single-head-attention.html">one attention head</a> to see how a token reads context.'),
    ("single-head-attention", "One head inside attention",
     "Inside the blue attention box, each head turns normalized token vectors into queries, keys, and values. Its output is a weighted read of the allowed value vectors.",
     'One head has produced one contextual vector per query. <a href="multi-head-attention.html">Multi-head attention</a> runs several such reads, joins their outputs, and projects them into an update that can be added to the block’s input.'),
    ("multi-head-attention", "Multi-head attention",
     "Several heads read the same normalized input through different projections. Joining their outputs and projecting back produces one attention update for the residual addition.",
     'The blue attention box now has an output with the same width as the residual stream. It can be added at the first + circle. Next, <a href="causal-attention.html">the causal mask</a> determines which input positions each head is allowed to read.'),
    ("causal-attention", "The mask inside each head",
     "The mask acts on attention scores before softmax. It permits a token to read itself and earlier positions, so future tokens cannot leak into its prediction.",
     'Masking changes the permitted connections inside attention; it does not add another block after attention. After the attention update is added, <a href="feed-forward.html">the MLP</a> transforms each position’s updated features.'),
    ("feed-forward", "The MLP branch",
     "The MLP receives normalized vectors after the attention addition. It transforms each position separately and returns a same-width update for the second residual addition.",
     'Attention mixed information across positions; the MLP transformed features within each position. Their updates have both been added to the running vectors. Next, examine <a href="layer-norm.html">the normalization steps</a> that prepare each branch’s input.'),
    ("layer-norm", "Normalization at three locations",
     "In this pre-norm decoder, normalization prepares each token vector before attention and before the MLP. A final normalization prepares the stack’s output for the vocabulary head.",
     'Normalization keeps the number of tokens and features unchanged. Each branch reads a normalized view while the skip path carries its unnormalized input. Now <a href="transformer-block.html">assemble the full block</a>, including both additions.'),
    ("transformer-block", "The complete repeated block",
     "Vectors enter as X. Attention and the first addition produce U; the MLP and the second addition produce Y. The next block receives Y, with the same number of tokens and features.",
     'One block returns the same shape it receives. Repeat this structure with separate learned weights in each block, then apply the final norm and vocabulary head. <a href="dropout.html">Dropout</a> adds an optional training-time operation on the update branches.'),
    ("dropout", "Dropout on the update branches",
     "The dashed boxes optionally mask and rescale branch outputs during training, before they are added. At evaluation they pass the update through unchanged.",
     'Dropout changes the training computation, not the block’s input/output shape. The dashed boxes become identity operations at evaluation. Attention-weight dropout, when used, sits inside the blue box. Continue with <a href="positional-encoding.html">position information</a>, then trace <a href="../variants/gpt.html">a complete GPT-2 model</a>.'),
]


def render_map(slug, label, description):
    current_used = False

    def node(target, title, subtitle="", extra="", key=None):
        nonlocal current_used
        active = slug == (key or target.removesuffix(".html"))
        classes = "tf-map-node" + (" " + extra if extra else "")
        current_attr = ""
        badge = ""
        if active:
            classes += " is-current"
            if not current_used:
                current_attr = ' aria-current="page"'
                badge = '<span class="tf-map-current-tag">You are here</span>'
                current_used = True
        small = f"<small>{subtitle}</small>" if subtitle else ""
        return f'<a class="{classes}" href="{target}"{current_attr}>{badge}<strong>{title}</strong>{small}</a>'

    is_guide = slug == "index"
    inside_block = slug not in ("index", "embedding-layer", "transformer-block")
    embeddings = node("embedding-layer.html", "Embeddings", "Token IDs → vectors")
    blocks = node("transformer-block.html", "Transformer blocks", "Repeat N times", "is-containing" if inside_block else "")
    predictions = node("../training/index.html#targets", "Next-token prediction", "Final norm → head → softmax")
    norm1 = node("layer-norm.html", "Normalize", "Prepare each vector")
    attention = node("multi-head-attention.html", "Multi-head attention", "Join heads → project")
    head = node("single-head-attention.html", "One head", "Q, K, V → read")
    mask = node("causal-attention.html", "Causal mask", "No future tokens")
    dropout1 = node("dropout.html", "Dropout", "Optional · training only", "tf-map-dropout")
    norm2 = node("layer-norm.html", "Normalize", "Read the updated U")
    mlp = node("feed-forward.html", "Feed-forward / MLP", "Transform each position", "tf-map-mlp")
    dropout2 = node("dropout.html", "Dropout", "Optional · training only", "tf-map-dropout")
    final_norm = node("layer-norm.html", "Final norm", "After all N blocks")
    output_head = node("../variants/gpt.html#forward", "Vocabulary head", "Vectors → token scores")
    softmax = node("../training/index.html#targets", "Softmax", "Scores → probabilities")
    kicker = "The map for this series" if is_guide else f"Foundations · {next(i for i, c in enumerate(CHAPTERS, 1) if c[0] == slug)} of 8"
    title = "One model, eight components to understand" if is_guide else f"You are here: {label}"
    # Keep the first, deliberately simple lookup chapter focused. Every later
    # chapter opens the block so its highlighted component is immediately visible.
    expanded = "" if slug == "embedding-layer" else " open"
    handoff = '<p class="tf-map-handoff"><strong>How to read the series.</strong> The arrows show computation order. The chapters teach one component at a time, returning to this same diagram so you can place each new idea. Begin with the embedding table; unfamiliar boxes will become clear as you go.</p>' if is_guide else ""
    return f'''<figure class="tf-map" id="transformer-map" data-foundation="{slug}">
  <figcaption><span class="tf-map-kicker">{kicker}</span><strong class="tf-map-title">{title}</strong><p class="tf-map-description">{description}</p></figcaption>
  <div class="tf-map-body">
    <nav aria-label="Transformer architecture: choose a component">
      <ol class="tf-map-overview"><li>{embeddings}</li><li>{blocks}</li><li>{predictions}</li></ol>
      <p class="tf-map-position">Reference model: a causal decoder with normalization before each branch. It adds <a href="positional-encoding.html">position vectors</a> after the embedding lookup. Click a component to open its chapter.</p>
      <details class="tf-map-zoom"{expanded}><summary>Inside one transformer block <span>· expand the middle box</span></summary>
        <div class="tf-map-stages">
          <div class="tf-map-stage">
            <strong class="tf-map-stage-title">1 · Read context, then add</strong>
            <div class="tf-map-stage-input"><strong>X</strong> · vectors entering this block</div>
            <div class="tf-map-branch"><span class="tf-map-skip">keep X</span>
              {norm1}
              <div class="tf-map-attention">{attention}<div class="tf-map-attention-parts">{head}{mask}</div><p class="tf-map-parts-label">Two things to study inside attention</p></div>
              {dropout1}
              <span class="tf-map-add" aria-label="Add the attention update to X">+</span>
            </div>
            <div class="tf-map-stage-output"><strong>U</strong> = X + attention update</div>
          </div>
          <div class="tf-map-stage">
            <strong class="tf-map-stage-title">2 · Transform features, then add</strong>
            <div class="tf-map-stage-input"><strong>U</strong> · the result of stage 1</div>
            <div class="tf-map-branch"><span class="tf-map-skip">keep U</span>
              {norm2}
              {mlp}
              {dropout2}
              <span class="tf-map-add" aria-label="Add the MLP update to U">+</span>
            </div>
            <div class="tf-map-stage-output"><strong>Y</strong> = U + MLP update</div>
          </div>
        </div>
        <p class="tf-map-caption">Read stage 1, then stage 2. Each curved skip path carries its input unchanged to the + circle. Y enters the next block as its X. The pattern repeats; each block has its own weights.</p>
        <div class="tf-map-output">{final_norm}<span aria-hidden="true">→</span>{output_head}<span aria-hidden="true">→</span>{softmax}</div>
        <p class="tf-map-caption">The last position’s probabilities predict the next token. Dashed dropout boxes are optional; attention-weight dropout, if used, is inside attention. Other architectures can place normalization and <a href="positional-encoding.html">position information</a> differently.</p>
      </details>
    </nav>
  </div>
{handoff}
</figure>'''


def replace_region(html, name, content, before):
    start, end = f"<!-- FOUNDATION:{name} -->", f"<!-- /FOUNDATION:{name} -->"
    rendered = f"{start}\n{content}\n{end}\n"
    if start in html:
        return re.sub(re.escape(start) + r".*?" + re.escape(end) + r"\n?", lambda _: rendered, html, count=1, flags=re.S)
    marker = re.search(before, html)
    if not marker:
        raise ValueError(f"Missing insertion point for {name}")
    return html[:marker.start()] + rendered + html[marker.start():]


def main():
    entries = [("index", "The whole decoder", "Follow token IDs into vectors, watch the blocks update those vectors, and finish with a next-token prediction.", "")] + CHAPTERS
    for slug, label, description, recap in entries:
        path = CHAPTER_DIR / (slug + ".html")
        html = path.read_text()
        html = re.sub(r'[ \t]*<link rel="stylesheet" href="\.\./foundation-map\.css[^\"]*">\n?', "", html)
        html = html.replace("</head>", "  " + CSS + "\n</head>")
        # Anchors preceding the first section remain with that section.
        html = replace_region(html, "MAP", render_map(slug, label, description), r'(?=<span class="tr-anchor"|<h2)')
        if recap:
            box = f'<aside class="tf-map-recap" aria-label="Place this chapter in the model"><strong>Back in the model</strong>{recap} <a href="#transformer-map">Return to the diagram ↑</a></aside>'
            html = replace_region(html, "RECAP", box, r'<nav class="post-nav"')
        path.write_text(html)
        print(path.relative_to(ROOT))


if __name__ == "__main__":
    main()
