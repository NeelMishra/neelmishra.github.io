#!/usr/bin/env python3
"""Render the same accessible model map into all eight Foundations chapters.

Run from any directory: python3 tools/render_transformer_foundation_map.py
The checked-in HTML works without JavaScript. Only the marked map/recap regions
and their stylesheet/script links are managed here; chapter prose is left intact.
"""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CHAPTER_DIR = ROOT / "blog/dl/transformers/building-blocks"
CSS = '<link rel="stylesheet" href="../foundation-map.css?v=foundation-flow-20260911">'

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
    def node(target, title, subtitle="", extra="", key=None):
        active = slug == (key or target.removesuffix(".html"))
        classes = "tf-map-node " + extra + (" is-current" if active else "")
        current = ' aria-current="page"' if active else ""
        small = f"<small>{subtitle}</small>" if subtitle else ""
        return f'<a class="{classes.strip()}" href="{target}"{current}><strong>{title}</strong>{small}</a>'

    is_guide = slug == "index"
    default = 0 if slug in ("index", "embedding-layer") else 3 if slug in ("single-head-attention", "causal-attention") else 2
    kicker = "A guided look inside" if is_guide else f"Foundations · {next(i for i, c in enumerate(CHAPTERS, 1) if c[0] == slug)} of 8"
    title = "One model. Open it one layer at a time." if is_guide else f"You are here: {label}"
    embeddings = node("embedding-layer.html", "Embeddings", "IDs → vectors", "tf-embed")
    blocks = node("transformer-block.html", "Transformer blocks", "Refine the vectors", "tf-block")
    predictions = node("../training/index.html#targets", "Prediction", "Vector → token probabilities", "tf-predict")
    norm1 = node("layer-norm.html", "Normalize", "Read a normalized view of X")
    attention = node("multi-head-attention.html", "Causal self-attention", "Read the available context", "tf-attention")
    norm2 = node("layer-norm.html", "Normalize", "Read a normalized view of U")
    mlp = node("feed-forward.html", "Feed-forward / MLP", "Transform each position separately", "tf-mlp")
    dropout = node("dropout.html", "Dropout", "Optional · training only", "tf-map-dropout")
    final_norm = node("layer-norm.html", "Final norm", "After the last block")
    head = node("../variants/gpt.html#forward", "Vocabulary head", "One score per token ID", "tf-predict")
    softmax = node("../training/index.html#targets", "Softmax", "Scores → probabilities", "tf-predict")
    one_head = node("single-head-attention.html", "One attention head", "Its own learned Q, K, V projections", "tf-attention")
    mask = node("causal-attention.html", "Apply the causal mask", "Hide future positions before softmax", "tf-attention")
    multi = node("multi-head-attention.html", "Join the heads → project", "One update of width d", "tf-attention")
    controls = "".join(f'<button type="button" data-map-step="{i}" aria-controls="tf-panel-{i}" aria-pressed="false"><span>0{i+1}</span>{text}</button>' for i, text in enumerate(("The model", "The stack", "One block", "Attention")))
    tokens = '<div class="tf-tokens" aria-label="Example input tokens: the, cat, sat"><span>the</span><span>cat</span><span>sat</span></div>'
    return f'''<figure class="tf-map" id="transformer-map" data-foundation="{slug}" data-map-start="{default}">
  <figcaption><span class="tf-map-kicker">{kicker}</span><strong class="tf-map-title">{title}</strong><p class="tf-map-description">{description}</p></figcaption>
  <div class="tf-map-overview" aria-label="The model at a glance">{embeddings}<span aria-hidden="true">→</span>{blocks}<span aria-hidden="true">→</span>{predictions}</div>
  <div class="tf-map-controls" role="group" aria-label="Choose how far to zoom into the model" hidden>{controls}</div>
  <div class="tf-map-panels">
    <section class="tf-map-panel" id="tf-panel-0" aria-labelledby="tf-title-0">
      <div class="tf-map-panel-heading"><span class="tf-map-kicker">01 · The model</span><strong id="tf-title-0">Start with a prefix. Predict what comes next.</strong><p>Suppose our tokens are “the cat sat”. A language model uses this prefix to assign a probability to each possible next token.</p></div>
      <div class="tf-model-flow">
        <div class="tf-model-input">{tokens}<small>Known input tokens</small></div><span class="tf-flow-arrow" aria-hidden="true">→</span>
        <div class="tf-model-box"><strong>Transformer</strong><small>Turn the prefix into context</small></div><span class="tf-flow-arrow" aria-hidden="true">→</span>
        <div class="tf-model-output"><span class="tf-token-next">on</span><small>One possible next token</small></div>
      </div>
      <p class="tf-map-caption">“on” is an illustrative continuation, not a model measurement. Choosing a token and appending it gives a new prefix: “the cat sat on”.</p>
      <p class="tf-map-bridge"><strong>What happens inside that box?</strong> First, turn the tokens into vectors. Then pass those vectors through a stack of blocks.</p>
    </section>
    <section class="tf-map-panel" id="tf-panel-1" aria-labelledby="tf-title-1">
      <div class="tf-map-panel-heading"><span class="tf-map-kicker">02 · Open the model</span><strong id="tf-title-1">The same three positions travel through every block.</strong><p>Embeddings give each token a starting vector. Position information tells the model where it sits. Each block updates the vectors before passing them onward.</p></div>
      <div class="tf-stack-flow">
        <div class="tf-stack-input">{tokens}<span class="tf-down" aria-hidden="true">↓</span>{embeddings}<a class="tf-position-link" href="positional-encoding.html">+ position vectors</a></div>
        <span class="tf-down" aria-hidden="true">↓</span>
        <div class="tf-stack-tower"><span class="tf-stack-label">N blocks · separate learned weights</span>
          {node("transformer-block.html", "Block 1", "3 vectors in → 3 updated vectors out", "tf-block")}
          <span class="tf-down" aria-hidden="true">↓</span>
          {node("transformer-block.html", "Block 2", "Same structure, different weights", "tf-block")}
          <span class="tf-stack-ellipsis" aria-label="More blocks, in sequence">⋮</span>
          {node("transformer-block.html", "Block N", "Still one vector per input position", "tf-block")}
        </div>
        <span class="tf-down" aria-hidden="true">↓</span>
        <div class="tf-stack-head">{final_norm}<span aria-hidden="true">→</span>{head}<span aria-hidden="true">→</span>{softmax}</div>
      </div>
      <p class="tf-map-caption">Use the last position’s distribution to choose the next token. The final norm and vocabulary head sit after the entire stack.</p>
      <p class="tf-map-bridge"><strong>Now open just one block.</strong> Its two jobs are to exchange context across positions and transform the features at each position.</p>
    </section>
    <section class="tf-map-panel" id="tf-panel-2" aria-labelledby="tf-title-2">
      <div class="tf-map-panel-heading"><span class="tf-map-kicker">03 · Open one block</span><strong id="tf-title-2">Read context. Add it. Transform features. Add again.</strong><p>Follow the arrows downward. The side paths carry the input unchanged; each + adds a learned update to it. This running set of vectors is the <em>residual stream</em>.</p></div>
      <div class="tf-map-stages">
        <div class="tf-map-stage">
          <div class="tf-map-stage-note"><span class="tf-stage-number">1</span><strong>Exchange context</strong><p>The “sat” position can read “the”, “cat”, and itself. Each position receives its own contextual update.</p></div>
          <div class="tf-map-stage-flow"><div class="tf-map-state"><strong>X</strong><small>Vectors entering the block · n × d</small></div>
            <div class="tf-map-branch"><span class="tf-map-skip">keep X</span>{norm1}{attention}{dropout}<span class="tf-map-add" aria-label="Add X to the attention update">+</span></div>
            <div class="tf-map-state tf-map-state-u"><strong>U = X + attention update</strong><small>Context has been added · n × d</small></div>
          </div>
        </div>
        <div class="tf-map-stage">
          <div class="tf-map-stage-note"><span class="tf-stage-number">2</span><strong>Transform features</strong><p>The MLP reads the updated U. It applies the same learned function to each position independently.</p></div>
          <div class="tf-map-stage-flow"><div class="tf-map-branch"><span class="tf-map-skip">keep U</span>{norm2}{mlp}{dropout}<span class="tf-map-add" aria-label="Add U to the MLP update">+</span></div>
            <div class="tf-map-state"><strong>Y = U + MLP update</strong><small>Updated vectors leaving the block · n × d</small></div>
          </div>
        </div>
      </div>
      <p class="tf-block-handoff"><span aria-hidden="true">↓</span> Y becomes the next block’s X.</p>
      <p class="tf-map-caption">This is a pre-norm causal decoder: normalization precedes each branch. Dashed dropout boxes are optional and become identity operations at evaluation. The original 2017 Transformer uses post-norm.</p>
      <p class="tf-map-bridge"><strong>There is one box still to open.</strong> Inside self-attention, several heads gather context before their outputs are joined into a single update.</p>
    </section>
    <section class="tf-map-panel" id="tf-panel-3" aria-labelledby="tf-title-3">
      <div class="tf-map-panel-heading"><span class="tf-map-kicker">04 · Open attention</span><strong id="tf-title-3">Each head decides which context to read.</strong><p>Keep following “sat”. Its query scores the available keys, and the resulting weights combine their value vectors. Every head uses its own learned projections.</p></div>
      <div class="tf-attention-flow"><div class="tf-map-state"><strong>Normalized X</strong><small>Same input to every head</small></div><span class="tf-down" aria-hidden="true">↓</span>
        <div class="tf-head-detail">{one_head}<div class="tf-qkv"><span><strong>Q</strong><small>What to look for</small></span><span><strong>K</strong><small>What to match</small></span><span><strong>V</strong><small>What to read</small></span></div>
          <div class="tf-head-calculation"><div class="tf-score-path"><span class="tf-down" aria-hidden="true">↓</span><div class="tf-head-operation">Score Q against K<small>QKᵀ / √dₖ</small></div><span class="tf-down" aria-hidden="true">↓</span>{mask}<span class="tf-down" aria-hidden="true">↓</span><div class="tf-head-operation">Softmax<small>Weights over context positions</small></div><span class="tf-down" aria-hidden="true">↓</span></div><div class="tf-value-path"><span>V passes through</span><span class="tf-down" aria-hidden="true">↓</span></div><div class="tf-head-operation tf-weighted-values">Weighted sum of V<small>Attention weights × values → one output per query</small></div></div>
        </div><span class="tf-down" aria-hidden="true">↓</span>{multi}
      </div>
      <p class="tf-map-caption">The mask applies inside every head. Attention weights are probabilities over context positions; the vocabulary probabilities at the end of the model are over token IDs.</p>
      <p class="tf-map-bridge"><strong>Return to the block.</strong> This attention output is added to X at the first +. The MLP then reads the updated U.</p>
    </section>
  </div>
  <div class="tf-map-footer" hidden><button type="button" data-map-back>← Back</button><output class="tf-map-progress" aria-live="polite"></output><button type="button" data-map-next>Open the stack →</button></div>
  <p class="tf-map-reference">Reference: a causal decoder with additive positions and pre-norm blocks. Select a component to read its chapter. <a href="../architecture/index.html">Compare encoder and decoder architectures →</a></p>
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
        html = re.sub(r'[ \t]*<script defer src="\.\./foundation-map\.js[^\"]*"></script>\n?', "", html)
        # Initialize the local map before the CDN math scripts; a slow CDN must
        # not delay the progressive explanation.
        assets = CSS + '\n  <script defer src="../foundation-map.js?v=foundation-flow-20260911"></script>\n  '
        html = html.replace('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex', assets + '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex', 1)
        # Anchors preceding the first section remain with that section.
        html = replace_region(html, "MAP", render_map(slug, label, description), r'(?=<span class="tr-anchor"|<h2)')
        if recap:
            box = f'<aside class="tf-map-recap" aria-label="Place this chapter in the model"><strong>Back in the model</strong>{recap} <a href="#transformer-map">Return to the diagram ↑</a></aside>'
            html = replace_region(html, "RECAP", box, r'<nav class="post-nav"')
        path.write_text(html)
        print(path.relative_to(ROOT))


if __name__ == "__main__":
    main()
