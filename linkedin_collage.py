#!/usr/bin/env python3
"""
linkedin_collage.py — High-quality animated GIF collage (1200×1200).
6 panels, each animating a tree algorithm. Indigo/purple palette, high contrast.
"""
import math, os
from PIL import Image, ImageDraw, ImageFont

# ── Canvas ────────────────────────────────────────────────────────────────────
W, H = 1200, 1200
FRAMES = 32
MS = 160  # ms per frame

# ── High-Contrast Palette (no green) ─────────────────────────────────────────
BG       = "#080a14"       # near-black navy
CARD_BG  = "#10122a"       # dark indigo card
CARD_BD  = "#2a2e5e"       # visible card border
EDGE_C   = "#3a3f7a"       # bright edge color — high contrast vs bg
BRAND    = "#6d70f7"       # vivid indigo
BRAND_LT = "#9fa2ff"       # bright indigo
ORANGE   = "#f59e0b"       # warm orange
ACTIVE   = "#ef4444"       # bright red
PURPLE   = "#b060f7"       # vivid purple
WHITE    = "#eef2ff"       # bright white
GRAY     = "#8088b0"       # visible gray
DIM_FILL = "#1a1d40"       # dim node fill
DIM_STRK = "#3a3f7a"       # dim node stroke — visible
VIS_FILL = "#5558e8"       # visited fill
VIS_STRK = "#8588ff"       # visited stroke — bright ring

# ── Fonts ─────────────────────────────────────────────────────────────────────
def _f(sz, b=False):
    try: return ImageFont.truetype("arialbd.ttf" if b else "arial.ttf", sz)
    except: return ImageFont.load_default()

FT  = _f(46, True)   # title
FS  = _f(22)          # subtitle
FL  = _f(19, True)    # panel label
FSM = _f(14)          # small
FN  = _f(17, True)    # node label
FTI = _f(12)          # tiny
FTG = _f(13, True)    # tag
FU  = _f(19)          # url
FB  = _f(17, True)    # badge

# ── Drawing Primitives ────────────────────────────────────────────────────────
NR = 20  # node radius — nice and large

def rrect(d, xy, r, fill, outline=None, w=1):
    d.rounded_rectangle(xy, radius=r, fill=fill, outline=outline, width=w)

def node(d, cx, cy, label, fill=VIS_FILL, stroke=VIS_STRK, tc=WHITE, ring_c=None):
    """Draw a large, high-contrast node."""
    if ring_c:
        d.ellipse([cx-NR-5, cy-NR-5, cx+NR+5, cy+NR+5], outline=ring_c, width=3)
    d.ellipse([cx-NR, cy-NR, cx+NR, cy+NR], fill=fill, outline=stroke, width=3)
    bb = d.textbbox((0,0), str(label), font=FN)
    tw, th = bb[2]-bb[0], bb[3]-bb[1]
    d.text((cx-tw/2, cy-th/2-1), str(label), fill=tc, font=FN)

def dim_node(d, cx, cy, label):
    node(d, cx, cy, label, fill=DIM_FILL, stroke=DIM_STRK, tc=GRAY)

def active_node(d, cx, cy, label):
    node(d, cx, cy, label, fill=ACTIVE, stroke="#ff8888", tc=WHITE, ring_c=ACTIVE)

def visited_node(d, cx, cy, label):
    node(d, cx, cy, label, fill=VIS_FILL, stroke=VIS_STRK, tc=WHITE)

def orange_node(d, cx, cy, label):
    node(d, cx, cy, label, fill=ORANGE, stroke="#fbbf24", tc=WHITE)

def purple_node(d, cx, cy, label):
    node(d, cx, cy, label, fill=PURPLE, stroke="#d08aff", tc=WHITE, ring_c=PURPLE)

def edge(d, x1, y1, x2, y2, color=EDGE_C, w=3):
    """Thick, high-contrast edge."""
    d.line([(x1,y1),(x2,y2)], fill=color, width=w)

def edge_between(d, nodes, a, b, color=EDGE_C, w=3):
    """Edge from node a to node b, clipped to node radius."""
    ax, ay = nodes[a]; bx, by = nodes[b]
    ang = math.atan2(by-ay, bx-ax)
    edge(d, ax+NR*math.cos(ang), ay+NR*math.sin(ang),
         bx-NR*math.cos(ang), by-NR*math.sin(ang), color, w)

def arrow(d, x1, y1, x2, y2, color=BRAND_LT, w=3, hs=7, ss=0, se=0):
    """High-contrast arrow with filled triangle head."""
    ang = math.atan2(y2-y1, x2-x1)
    sx, sy = x1+ss*math.cos(ang), y1+ss*math.sin(ang)
    ex, ey = x2-se*math.cos(ang), y2-se*math.sin(ang)
    d.line([(sx,sy),(ex,ey)], fill=color, width=w)
    a1 = (ex-hs*math.cos(ang-.4), ey-hs*math.sin(ang-.4))
    a2 = (ex-hs*math.cos(ang+.4), ey-hs*math.sin(ang+.4))
    d.polygon([(ex,ey), a1, a2], fill=color)

def arrow_between(d, nodes, a, b, color=BRAND_LT, w=3):
    ax, ay = nodes[a]; bx, by = nodes[b]
    arrow(d, ax, ay, bx, by, color, w, hs=7, ss=NR+4, se=NR+4)

def tree_edges(d, nodes, adj, color=EDGE_C):
    for p, chs in adj.items():
        for c in chs:
            edge_between(d, nodes, p, c, color)

def panel_box(d, x, y, w, h):
    rrect(d, [x,y,x+w,y+h], 12, fill=CARD_BG, outline=CARD_BD, w=2)

def panel_head(d, x, y, w, title, sub=None, speed_idx=2):
    d.ellipse([x+10, y+10, x+19, y+19], fill=BRAND_LT)
    d.text((x+24, y+6), title, fill=WHITE, font=FL)
    if sub:
        tw = d.textbbox((0,0), title, font=FL)[2]
        d.text((x+24+tw+8, y+9), sub, fill=GRAY, font=FSM)
    # Speed bar
    speeds = ["4×","2×","1×","0.5×","0.3×"]
    bw = 30
    sx = x + w - len(speeds)*bw - 10
    for i, sp in enumerate(speeds):
        bx = sx + i*bw
        f = BRAND if i==speed_idx else CARD_BG
        o = BRAND_LT if i==speed_idx else CARD_BD
        rrect(d, [bx, y+7, bx+bw-3, y+25], 4, fill=f, outline=o)
        bb = d.textbbox((0,0), sp, font=FTI)
        d.text((bx+(bw-3-bb[2]+bb[0])//2, y+9), sp, fill=WHITE, font=FTI)

def ds_panel(d, x, y, w, h, title, items, colors=None):
    rrect(d, [x,y,x+w,y+h], 5, fill="#0a0c1a", outline=CARD_BD, w=2)
    d.text((x+7,y+4), title, fill=GRAY, font=FTI)
    iy = y + 22
    for i, item in enumerate(items):
        if iy+17 > y+h-3: break
        c = colors[i] if colors and i<len(colors) else CARD_BD
        rrect(d, [x+5, iy, x+w-5, iy+15], 3, fill=c)
        bb = d.textbbox((0,0), str(item), font=FTI)
        d.text((x+(w-bb[2]+bb[0])//2, iy+1), str(item), fill=WHITE, font=FTI)
        iy += 18

# ── Panel 1: In-Order Traversal ──────────────────────────────────────────────
def p_inorder(d, x, y, w, h, f):
    panel_box(d, x, y, w, h)
    panel_head(d, x, y, w, "In-Order Traversal", "Call Stack", 2)

    cx, cy = x + int(w*0.38), y + 72
    sp = 52
    nodes = {4:(cx,cy), 2:(cx-sp,cy+sp), 6:(cx+sp,cy+sp),
             1:(cx-sp-28,cy+2*sp), 3:(cx-sp+28,cy+2*sp),
             5:(cx+sp-28,cy+2*sp), 7:(cx+sp+28,cy+2*sp)}
    adj = {4:[2,6], 2:[1,3], 6:[5,7]}

    visit = [1,2,3,4,5,6,7]
    step = min(f * len(visit) // FRAMES, len(visit)-1)
    vis = set(visit[:step])
    act = visit[step]

    tree_edges(d, nodes, adj)
    for v, (nx,ny) in nodes.items():
        if v in vis:      visited_node(d, nx, ny, v)
        elif v == act:    active_node(d, nx, ny, v)
        else:             dim_node(d, nx, ny, v)

    # Visit sequence
    sy = cy + 2*sp + 32
    d.text((x+12, sy), "Visit:", fill=GRAY, font=FTI)
    sx = x + 52
    for i in range(step+1):
        c = BRAND_LT if i < step else ORANGE
        d.text((sx+i*24, sy), str(visit[i]), fill=c, font=FTI)
        if i < step:
            d.text((sx+i*24+11, sy), "→", fill=GRAY, font=FTI)

    # Call stack
    stacks = [
        ["inorder(1)","inorder(2)","inorder(4)"],
        ["inorder(2)","inorder(4)"],
        ["inorder(3)","inorder(2)","inorder(4)"],
        ["inorder(4)"],
        ["inorder(5)","inorder(6)","inorder(4)"],
        ["inorder(6)","inorder(4)"],
        ["inorder(7)","inorder(6)","inorder(4)"],
    ]
    st = stacks[step] if step < len(stacks) else []
    cs = [ACTIVE] + [CARD_BD]*(len(st)-1) if st else []
    ds_panel(d, x+int(w*0.67), y+38, int(w*0.30), h-52, "CALL STACK", st, cs)

# ── Panel 2: BST Search ──────────────────────────────────────────────────────
def p_bst(d, x, y, w, h, f):
    panel_box(d, x, y, w, h)
    panel_head(d, x, y, w, "BST Search", "Find: 13", 1)

    cx, cy = x + w//2, y + 72
    sp = 55
    nodes = {10:(cx,cy), 5:(cx-sp-10,cy+sp), 15:(cx+sp+10,cy+sp),
             3:(cx-sp-40,cy+2*sp), 7:(cx-sp+20,cy+2*sp),
             12:(cx+sp-20,cy+2*sp), 20:(cx+sp+40,cy+2*sp)}
    adj = {10:[5,15], 5:[3,7], 15:[12,20]}

    path = [10, 15, 12]
    step = min(f * len(path) // FRAMES, len(path)-1)

    tree_edges(d, nodes, adj)

    # Trace arrows
    for i in range(step):
        arrow_between(d, nodes, path[i], path[i+1], color=BRAND_LT, w=3)

    for v, (nx,ny) in nodes.items():
        if v in path[:step]:   visited_node(d, nx, ny, v)
        elif v == path[step]:  active_node(d, nx, ny, v)
        else:                  dim_node(d, nx, ny, v)

    # Log
    logs = ["13 > 10 → go right", "13 < 15 → go left", "13 > 12 → …"]
    ly = cy + 2*sp + 32
    for i in range(step+1):
        c = BRAND_LT if i < step else ORANGE
        d.text((x+12, ly+i*17), logs[i], fill=c, font=FTI)

# ── Panel 3: AVL Rotation ────────────────────────────────────────────────────
def p_avl(d, x, y, w, h, f):
    panel_box(d, x, y, w, h)
    panel_head(d, x, y, w, "AVL Rotation", "Left Rotate", 3)

    t = f / (FRAMES - 1)  # 0..1
    sp = 55

    if t < 0.42:
        # Before state
        bx, by = x + w//4, y + 90
        d.text((bx-15, y+40), "Before", fill=GRAY, font=FSM)

        edge(d, bx, by+NR, bx+30, by+sp-NR, EDGE_C)
        edge(d, bx+30, by+sp+NR, bx+60, by+2*sp-NR, EDGE_C)
        dim_node(d, bx, by, 3)
        visited_node(d, bx+30, by+sp, 5)
        dim_node(d, bx+60, by+2*sp, 7)
        d.text((bx+NR+4, by-8), "-2", fill=ACTIVE, font=FTI)

    elif t < 0.58:
        # Transition
        mx, my = x+w//2, y+h//2
        arrow(d, mx-22, my, mx+22, my, color=ORANGE, w=3, hs=8)
        d.text((mx-28, my+14), "rotate!", fill=ORANGE, font=FSM)
    else:
        # After state
        ax, ay = x + w*3//4, y + 90
        d.text((ax-12, y+40), "After", fill=BRAND_LT, font=FSM)

        edge(d, ax, ay+NR, ax-38, ay+sp-NR, BRAND)
        edge(d, ax, ay+NR, ax+38, ay+sp-NR, BRAND)
        visited_node(d, ax, ay, 5)
        visited_node(d, ax-38, ay+sp, 3)
        visited_node(d, ax+38, ay+sp, 7)
        d.text((ax+NR+4, ay-8), "0", fill=BRAND_LT, font=FTI)

    d.text((x+12, y+h-24), "BF: -2 → 0", fill=GRAY, font=FSM)

# ── Panel 4: Level-Order BFS ─────────────────────────────────────────────────
def p_bfs(d, x, y, w, h, f):
    panel_box(d, x, y, w, h)
    panel_head(d, x, y, w, "Level-Order BFS", "Queue", 2)

    cx, cy = x + int(w*0.38), y + 72
    sp = 52
    nodes = {8:(cx,cy), 4:(cx-sp,cy+sp), 12:(cx+sp,cy+sp),
             2:(cx-sp-28,cy+2*sp), 6:(cx-sp+28,cy+2*sp),
             10:(cx+sp-28,cy+2*sp), 14:(cx+sp+28,cy+2*sp)}
    adj = {8:[4,12], 4:[2,6], 12:[10,14]}

    bfs = [8,4,12,2,6,10,14]
    step = min(f * len(bfs) // FRAMES, len(bfs)-1)
    vis = set(bfs[:step])
    act = bfs[step]

    # Level labels
    d.text((cx+sp+40, cy-6), "L0", fill=GRAY, font=FTI)
    d.text((cx+sp+40, cy+sp-6), "L1", fill=GRAY, font=FTI)
    d.text((cx+sp+40, cy+2*sp-6), "L2", fill=GRAY, font=FTI)

    tree_edges(d, nodes, adj)
    for v, (nx,ny) in nodes.items():
        if v in vis:      visited_node(d, nx, ny, v)
        elif v == act:    active_node(d, nx, ny, v)
        else:             dim_node(d, nx, ny, v)

    # Queue
    remaining = bfs[step+1:step+5]
    ds_panel(d, x+int(w*0.67), y+38, int(w*0.30), h-52, "QUEUE",
             [str(r) for r in remaining], [CARD_BD]*len(remaining))

# ── Panel 5: Heap Bubble-Up ──────────────────────────────────────────────────
def p_heap(d, x, y, w, h, f):
    panel_box(d, x, y, w, h)
    panel_head(d, x, y, w, "Min-Heap Insert", "Bubble Up", 2)

    cx, cy = x + w//2, y + 72
    sp = 55
    pos = {
        'rt': (cx, cy),
        'l':  (cx-sp, cy+sp),
        'r':  (cx+sp, cy+sp),
        'll': (cx-sp-30, cy+2*sp),
        'lr': (cx-sp+30, cy+2*sp),
    }
    adj_k = {'rt':['l','r'], 'l':['ll','lr']}
    t = f / (FRAMES - 1)

    if t < 0.33:
        vals = {'rt':5, 'l':8, 'r':15, 'll':10, 'lr':2}
        sf, st_ = 'lr', 'l'
        label = "2 < 8 → swap!"
    elif t < 0.66:
        vals = {'rt':5, 'l':2, 'r':15, 'll':10, 'lr':8}
        sf, st_ = 'l', 'rt'
        label = "2 < 5 → swap!"
    else:
        vals = {'rt':2, 'l':5, 'r':15, 'll':10, 'lr':8}
        sf, st_ = None, None
        label = "Heap property restored!"

    # Edges
    for p_, chs in adj_k.items():
        for c_ in chs:
            edge(d, pos[p_][0], pos[p_][1]+NR, pos[c_][0], pos[c_][1]-NR, EDGE_C, 3)

    # Bubble arrow
    if sf:
        fx,fy = pos[sf]; tx,ty = pos[st_]
        arrow(d, fx-NR-6, fy-4, tx-NR-6, ty+8, color=ORANGE, w=3, hs=7, ss=6, se=6)

    # Nodes
    for k, (nx,ny) in pos.items():
        v = vals[k]
        if k == sf:       active_node(d, nx, ny, v)
        elif k == st_:    orange_node(d, nx, ny, v)
        else:             visited_node(d, nx, ny, v)

    # Array
    ay = cy + 2*sp + 36
    d.text((x+12, ay), "Array:", fill=GRAY, font=FTI)
    arr = [vals['rt'], vals['l'], vals['r'], vals['ll'], vals['lr']]
    ax = x + 55
    for i, v in enumerate(arr):
        c = ACTIVE if v == 2 else CARD_BD
        rrect(d, [ax+i*38, ay-2, ax+i*38+34, ay+17], 3, fill=c)
        bb = d.textbbox((0,0), str(v), font=FTI)
        d.text((ax+i*38+(34-bb[2]+bb[0])//2, ay), str(v), fill=WHITE, font=FTI)

    lc = ORANGE if sf else BRAND_LT
    d.text((x+12, ay+22), label, fill=lc, font=FTI)

# ── Panel 6: LCA ─────────────────────────────────────────────────────────────
def p_lca(d, x, y, w, h, f):
    panel_box(d, x, y, w, h)
    panel_head(d, x, y, w, "Find LCA", "nodes 4 & 7", 0)

    cx, cy = x + w//2, y + 72
    sp = 55
    nodes = {6:(cx,cy), 3:(cx-sp-10,cy+sp), 9:(cx+sp+10,cy+sp),
             1:(cx-sp-40,cy+2*sp), 4:(cx-sp+20,cy+2*sp),
             7:(cx+sp-20,cy+2*sp), 11:(cx+sp+40,cy+2*sp)}
    adj = {6:[3,9], 3:[1,4], 9:[7,11]}

    t = f / (FRAMES - 1)
    left_steps  = min(int(t * 5), 2)
    right_steps = min(int(max(0, t-0.35) * 5), 2)
    show_lca = t > 0.72

    tree_edges(d, nodes, adj)

    # Path arrows
    lpath = [4, 3, 6]
    rpath = [7, 9, 6]
    for i in range(left_steps):
        arrow_between(d, nodes, lpath[i], lpath[i+1], color=BRAND_LT, w=3)
    for i in range(right_steps):
        arrow_between(d, nodes, rpath[i], rpath[i+1], color=ORANGE, w=3)

    for v, (nx,ny) in nodes.items():
        if v == 6 and show_lca:     purple_node(d, nx, ny, v)
        elif v in {4, 7}:           active_node(d, nx, ny, v)
        elif v == 3 and left_steps>0:  visited_node(d, nx, ny, v)
        elif v == 9 and right_steps>0: visited_node(d, nx, ny, v)
        else:                        dim_node(d, nx, ny, v)

    if show_lca:
        d.text((x+12, y+h-24), "LCA(4, 7) = 6", fill=PURPLE, font=FSM)

# ── Banner & Footer ───────────────────────────────────────────────────────────
def banner(d):
    for i in range(4):
        d.line([(0,6+i),(W,6+i)], fill=BRAND)

    title = "Interactive DSA Visualizations"
    bb = d.textbbox((0,0), title, font=FT)
    d.text(((W-bb[2]+bb[0])//2, 22), title, fill=WHITE, font=FT)

    sub = "A deep-dive blog series with step-by-step animated algorithms"
    bb2 = d.textbbox((0,0), sub, font=FS)
    d.text(((W-bb2[2]+bb2[0])//2, 76), sub, fill=GRAY, font=FS)

    tags = ["Trees","BST","AVL","Heaps","Segment Trees","Traversals","LCA","Threaded Trees"]
    ty = 112
    total = sum(d.textbbox((0,0),t,font=FTG)[2]-d.textbbox((0,0),t,font=FTG)[0]+26 for t in tags) + 8*(len(tags)-1)
    tx = (W-total)//2
    for tag in tags:
        tw = d.textbbox((0,0),tag,font=FTG)[2]-d.textbbox((0,0),tag,font=FTG)[0]
        rrect(d, [tx, ty, tx+tw+22, ty+24], 12, fill=BRAND+"20", outline=BRAND)
        d.text((tx+11, ty+4), tag, fill=BRAND_LT, font=FTG)
        tx += tw + 30

def footer(d):
    fy = H - 65
    d.line([(0,fy),(W,fy)], fill=CARD_BD, width=2)
    d.text((20, fy+16), "Neel Mishra", fill=WHITE, font=FB)
    nb = d.textbbox((0,0), "Neel Mishra", font=FB)
    d.text((20+nb[2]-nb[0]+12, fy+18), "Applied Scientist II", fill=GRAY, font=FSM)

    url = "neelmishra.github.io"
    ub = d.textbbox((0,0), url, font=FU)
    d.text((W-20-ub[2]+ub[0], fy+16), url, fill=BRAND_LT, font=FU)

    for i in range(5):
        dx = W//2 - 40 + i*20
        d.ellipse([dx,fy+28,dx+8,fy+36], fill=BRAND if i==2 else CARD_BD)

# ── Compose ───────────────────────────────────────────────────────────────────
def render(fi):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    banner(d)
    footer(d)

    pad = 18
    top = 155
    pw = (W - 4*pad) // 3
    ph = (H - top - 85 - 3*pad) // 2

    panels = [p_inorder, p_bst, p_avl, p_bfs, p_heap, p_lca]
    for idx, fn in enumerate(panels):
        col, row = idx%3, idx//3
        px = pad + col*(pw+pad)
        py = top + pad + row*(ph+pad)
        fn(d, px, py, pw, ph, fi)

    return img

def main():
    print("Rendering frames…")
    frames = [render(i) for i in range(FRAMES)]
    # Pause on last frame
    for _ in range(6):
        frames.append(frames[-1].copy())

    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "linkedin_collage.gif")
    frames[0].save(out, save_all=True, append_images=frames[1:],
                   duration=MS, loop=0, optimize=False)
    size_kb = os.path.getsize(out) // 1024
    print(f"GIF saved: {out}")
    print(f"  {W}×{H}, {len(frames)} frames, ~{len(frames)*MS/1000:.1f}s, {size_kb} KB")

    # Also save a mid-frame PNG
    png = out.replace(".gif", ".png")
    frames[FRAMES//2].save(png)
    print(f"Preview PNG: {png}")

if __name__ == "__main__":
    main()
