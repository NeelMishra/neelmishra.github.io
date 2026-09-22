"""Generate the four original recurrent-network figures (Matplotlib required)."""
from pathlib import Path
from html import escape
import math
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

OUT = Path(__file__).resolve().parent
INK, GREEN, BLUE, ORANGE = '#13201a', '#087354', '#3b6493', '#ad5728'


def text(x, y, value, size=17, color=INK, weight='400', anchor='start'):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-weight="{weight}" text-anchor="{anchor}">{escape(value)}</text>'


def rect(x, y, w, h, fill='#edf2ec'):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{fill}"/>'


def arrow(x1, y1, x2, y2, color=GREEN):
    return f'<path d="M{x1} {y1}L{x2} {y2}" fill="none" stroke="{color}" stroke-width="2" marker-end="url(#arrow)"/>'


def save(name, title, description, body, height):
    (OUT / name).write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 {height}" role="img" aria-labelledby="title desc">
<title id="title">{escape(title)}</title><desc id="desc">{escape(description)}</desc>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="context-stroke"/></marker></defs>
<rect width="780" height="{height}" fill="#fffdf9"/><g font-family="Arial,sans-serif">{body}</g></svg>''')


body = text(28, 36, 'One recurrence, three uses of the same weights', 24, weight='700')
body += text(28, 67, 'h₀ = 0     hₜ = tanh(0.8 hₜ₋₁ + 0.6 xₜ)     Final binary loss only', 17, '#4a5a53')
for i, (x, a, h, contribution) in enumerate([(1., .6, .537050, 0.), (-.5, .129640, .128918, -.300219), (.25, .253135, .247863, -.091607)]):
    left = 40 + 250 * i
    body += text(left+100, 111, f'STEP {i+1}', 13, GREEN, '700', 'middle')
    body += rect(left, 128, 200, 113, '#133e32')
    body += text(left+100, 161, f'x = {x:g}', 18, '#ffffff', anchor='middle')
    body += text(left+100, 192, f'a = {a:.6f}', 17, '#ffffff', anchor='middle')
    body += text(left+100, 223, f'h = {h:.6f}', 19, '#ffffff', '700', 'middle')
    body += rect(left, 328, 200, 73, '#eef4fb')
    body += text(left+100, 354, 'Contribution to dL/du', 14, BLUE, anchor='middle')
    body += text(left+100, 385, f'{contribution:.6f}', 21, BLUE, '700', 'middle')
    if i < 2:
        body += arrow(left+204, 196, left+245, 196)
        body += text(left+225, 178, 'u', 16, GREEN, '700', 'middle')
        body += arrow(left+245, 277, left+204, 277, BLUE)
body += text(390, 306, 'Backpropagate from the final prediction', 15, BLUE, '700', 'middle')
body += rect(28, 423, 724, 59)
body += text(47, 448, 'Sum every use of u:  0 − 0.300219 − 0.091607 ≈ −0.391825', 17, weight='700')
body += text(47, 472, 'The first contribution is zero because its previous state h₀ is zero.', 15, '#4a5a53')
save('recurrent-unroll.svg', 'A recurrent weight receives gradient from multiple time steps', 'Inputs 1, minus 0.5 and 0.25 produce states 0.537050, 0.128918 and 0.247863. The shared recurrent weight 0.8 receives three loss-gradient contributions: zero, minus 0.300219 and minus 0.091607, totaling minus 0.391825.', body, 502)

body = text(28, 36, 'Keep, write, then expose: one LSTM coordinate', 24, weight='700')
body += text(28, 66, 'Gate outputs are given for this step; the network normally computes them.', 16, '#4a5a53')
for y, label, value, gate, result, color in [(106, 'Previous memory', '0.80', '× f = 0.90', '0.72', GREEN), (235, 'Candidate content', '−0.50', '× i = 0.20', '−0.10', BLUE)]:
    body += rect(28, y, 205, 88)
    body += text(130, y+29, label, 16, '#4a5a53', anchor='middle')
    body += text(130, y+64, value, 26, color, '700', 'middle')
    body += arrow(238,y+44,363,y+44,color)
    body += text(300,y+27,gate,16,color,'700','middle')
    body += rect(372,y,139,88, '#eef4fb' if color == BLUE else '#edf7f1')
    body += text(441,y+54,result,27,color,'700','middle')
body += '<path d="M515 150H552V214H582M515 279H552V214" fill="none" stroke="#087354" stroke-width="2"/>'
body += text(568,204,'+',24,GREEN,'700','middle')
body += rect(588,167,164,96,'#133e32')
body += text(670,197,'New memory cₜ',16,'#ffffff',anchor='middle')
body += text(670,239,'0.62',30,'#ffffff','700','middle')
body += text(28,368,'OUTPUT: READ SOME OF THE MEMORY',13,ORANGE,'700')
body += rect(28,390,724,73,'#f6ece2')
body += text(47,420,'hₜ = o × tanh(cₜ) = 0.75 × tanh(0.62)',20,weight='700')
body += text(47,448,'= 0.75 × 0.551128 = 0.413346',19,ORANGE,'700')
body += text(28,496,'cₜ continues along the memory path; hₜ is the exposed state used by other layers.',15,'#4a5a53')
save('recurrent-lstm-gates.svg', 'A numerical LSTM memory update', 'Retain 0.9 times the old memory 0.8, or 0.72. Write 0.2 times candidate minus 0.5, or minus 0.1. Adding them gives cell state 0.62. The output gate 0.75 times tanh of 0.62 exposes hidden state 0.413346.',body,520)

plt.rcParams.update({'font.family':'DejaVu Sans','font.size':12,'svg.fonttype':'none','svg.hashsalt':'slp3-recurrent','axes.spines.top':False,'axes.spines.right':False,'figure.facecolor':'#fffdf9','axes.facecolor':'#fffdf9','text.color':INK,'axes.labelcolor':INK,'xtick.color':'#4a5a53','ytick.color':'#4a5a53'})
fig, ax = plt.subplots(figsize=(10.5,6))
fig.subplots_adjust(left=.11,right=.965,bottom=.18,top=.72)
steps=list(range(41));rnn=[1.];h=.5
for _ in range(40):
    h=math.tanh(.8*h);rnn.append(rnn[-1]*.8*(1-h*h))
cell=[.95**n for n in steps]
exposed=[.8*(1-math.tanh(.5*.95**n)**2)*.95**n for n in steps]
ax.semilogy(steps,rnn,color=ORANGE,lw=2.7,label='RNN: ∂hₙ / ∂h₀')
ax.semilogy(steps,cell,color=GREEN,lw=2.7,label='LSTM cell: ∂cₙ / ∂c₀')
ax.semilogy(steps,exposed,color=BLUE,lw=2.7,ls='--',label='LSTM output: ∂hₙ / ∂c₀')
ax.set_xlim(0,40);ax.set_ylim(5e-5,1.4);ax.set_xticks([0,10,20,30,40]);ax.grid(color='#dbe3dc',lw=.7)
ax.set_xlabel('Blank steps after the initial state',labelpad=10);ax.set_ylabel('Sensitivity to the initial state (log scale)',labelpad=10)
ax.legend(frameon=False,loc='lower left',fontsize=11)
fig.text(.035,.94,'An early signal must survive repeated updates',fontsize=22,weight='bold')
fig.text(.035,.885,'No new inputs or writes. RNN u = 0.8; LSTM f = 0.95, o = 0.8.',fontsize=13,color='#4a5a53')
fig.text(.035,.83,'h₀ = c₀ = 0.5. Constant gates isolate a memory path, not a trained-model comparison.',fontsize=12,color='#4a5a53')
fig.text(.11,.044,'The cell path retains more sensitivity here; exposing it through tanh and an output gate attenuates it.',fontsize=10.8,color='#4a5a53')
p=OUT/'recurrent-memory.svg';fig.savefig(p,format='svg',metadata={'Date':None});plt.close(fig)
s=p.read_text().replace("'DejaVu Sans'", "'DejaVu Sans', Arial, sans-serif");start=s.index('<svg');close=s.index('>',start)
s=s[:close]+ ' role="img" aria-labelledby="title desc"'+s[close:]
close=s.index('>',s.index('<svg'))
s=s[:close+1]+'<title id="title">Sensitivity to an initial recurrent state</title><desc id="desc">On a logarithmic scale, RNN sensitivity with weight 0.8 falls faster over 40 blank steps than the LSTM cell path with constant forget gate 0.95. The LSTM exposed-state sensitivity is lower than its cell sensitivity because the output gate and tanh also contribute. This is a controlled arithmetic example, not a performance benchmark.</desc>'+s[close+1:]
p.write_text('\n'.join(line.rstrip() for line in s.splitlines())+'\n')

body=text(28,36,'Attention reads a different source mixture at each step',23,weight='700')
body+=text(28,68,'Current decoder query q = [1, 0]; dot products are not divided by √d here.',16,'#4a5a53')
for i,(vector,score,weight) in enumerate([('[1, 0]',1,.422319),('[0, 1]',0,.155362),('[1, 1]',1,.422319)]):
    x=28+252*i
    body+=rect(x,99,220,99,'#133e32')
    body+=text(x+110,128,f'Encoder state {i+1}',15,'#ffffff',anchor='middle')
    body+=text(x+110,171,vector,27,'#ffffff','700','middle')
    body+=text(x+110,234,f'q · h = {score}',19,weight='700',anchor='middle')
    body+=rect(x,258,220,51)
    body+=f'<rect x="{x}" y="258" width="{220*weight}" height="51" rx="8" fill="#b7d9c6"/>'
    body+=text(x+110,291,f'α = {weight:.6f}',18,GREEN,'700','middle')
    body+=arrow(x+110,320,x+110,347)
body+=rect(28,361,724,86,'#eef4fb')
body+=text(48,393,'Context = 0.422319[1, 0] + 0.155362[0, 1] + 0.422319[1, 1]',17,BLUE,'700')
body+=text(48,427,'= [0.844638, 0.577681]',24,BLUE,'700')
body+=text(28,482,'Change q to [0, 1]: context becomes [0.577681, 0.844638].',18,weight='700')
body+=text(28,512,'The source states stay fixed. The decoder changes which mixture it retrieves.',16,'#4a5a53')
save('recurrent-attention.svg','A numerical recurrent encoder-decoder attention lookup','Query 1,0 gives dot-product scores 1,0,1 for encoder states 1,0; 0,1; and 1,1. Softmax weights are 0.422319,0.155362,0.422319. Their weighted context is 0.844638,0.577681. Query 0,1 swaps the context coordinates.',body,536)
print('Created four original SVG figures.')
