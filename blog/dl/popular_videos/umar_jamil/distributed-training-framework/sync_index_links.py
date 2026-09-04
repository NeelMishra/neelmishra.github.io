"""Sync the series index roadmap links to the posts that actually exist on disk.

Roadmap entries whose target HTML file is missing are rendered as plain text with
a "planned" badge, so the published index never contains a dead link. Re-run this
after adding each post.

Usage:  python3 sync_index_links.py
"""

import io
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(HERE, 'index.html')

LINK = re.compile(
    r'<div class="dt-roadmap-item(?P<cls>[^"]*)">\s*\n\s*'
    r'(?:<a href="(?P<href>[^"]+)">(?P<atitle>.*?)</a>'
    r'|<span class="dt-pending">(?P<stitle>.*?)</span>'
    r'<span class="dt-soon">planned</span>)'
)


def main():
    text = io.open(INDEX, encoding='utf-8').read()

    def replace(match):
        href = match.group('href')
        title = match.group('atitle') if href else match.group('stitle')
        target = href or guess_href(title, text)
        exists = target is not None and os.path.exists(os.path.join(HERE, target))
        if exists:
            return ('<div class="dt-roadmap-item">\n          '
                    '<a href="%s">%s</a>' % (target, title))
        return ('<div class="dt-roadmap-item pending">\n          '
                '<span class="dt-pending">%s</span><span class="dt-soon">planned</span>'
                % title)

    def guess_href(title, _text):
        return HREF_BY_TITLE.get(title)

    updated = LINK.sub(replace, text)
    if updated != text:
        io.open(INDEX, 'w', encoding='utf-8').write(updated)
    live = updated.count('<div class="dt-roadmap-item">')
    planned = updated.count('<div class="dt-roadmap-item pending">')
    print('roadmap entries linked: %d, planned: %d' % (live, planned))


HREF_BY_TITLE = {
    'Model Parameters &amp; Training FLOPs': 'model-parameters-and-training-flops.html',
    'RoPE from First Principles, and YaRN': 'rope-and-yarn.html',
    'Transformer Assembly &amp; Weight Initialization': 'transformer-assembly-and-initialization.html',
    'The KV Cache &amp; Arithmetic Intensity': 'kv-cache-and-arithmetic-intensity.html',
    'Multi-head Latent Attention': 'multi-head-latent-attention.html',
    'Autograd &amp; the Mathematics of Distributed Training': 'autograd-and-the-math-of-distributed-training.html',
    'Distributed Communication Collectives': 'communication-collectives.html',
    'Data Parallelism: DDP, ZeRO and FSDP': 'data-parallelism-ddp-and-fsdp.html',
    'Pipeline Parallelism from First Principles': 'pipeline-parallelism.html',
    'Pipeline Schedules: GPipe, 1F1B and Zero Bubble': 'pipeline-schedules.html',
    'Tensor Parallelism': 'tensor-parallelism.html',
    'Context Parallelism &amp; Ring Attention': 'context-parallelism-and-ring-attention.html',
    'Device Meshes &amp; Combining Parallelism': 'device-meshes-and-combining-parallelism.html',
    'Mixture of Experts from First Principles': 'mixture-of-experts.html',
    'Expert Parallelism &amp; All-to-All': 'expert-parallelism-and-all-to-all.html',
    'The Training Loop, Metrics &amp; Checkpointing': 'training-loop-metrics-and-checkpointing.html',
}


if __name__ == '__main__':
    main()
