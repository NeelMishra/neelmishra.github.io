"""Original post-training diagrams and plot. Requires Matplotlib."""
from pathlib import Path
from html import escape
import math
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

OUT = Path(__file__).resolve().parent


def text(x, y, value, size=16, color='#13201a', weight='400', anchor='start'):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-weight="{weight}" text-anchor="{anchor}">{escape(value)}</text>'


def rect(x, y, w, h, fill, radius=9):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}"/>'


def save(name, title, desc, body, height):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 {height}" role="img" aria-labelledby="title desc">
<title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>
<rect width="760" height="{height}" fill="#fffdf9"/>
<g font-family="Arial, sans-serif">{body}</g></svg>'''
    (OUT/name).write_text(svg)


body = text(26, 34, 'Context is visible; only selected targets earn loss', 23, weight='700')
body += text(26, 63, 'A six-token teaching example; role delimiters are omitted.', 15, '#4a5a53')
body += text(30, 97, 'PROMPT: CONDITION ON THESE', 13, '#4a5a53', '700')
body += text(378, 97, 'RESPONSE: SCORE THESE', 13, '#087354', '700')
for i, token in enumerate(['Return', 'two', 'colors', 'blue', 'green', '<eos>']):
    x = 30 + 116*i
    body += rect(x, 114, 104, 56, '#edf2ec' if i < 3 else '#133e32')
    body += text(x+52, 149, token, 19, '#13201a' if i < 3 else '#ffffff', '700', 'middle')
    body += text(x+52, 239, '0' if i < 3 else '1', 25, '#68796d' if i < 3 else '#087354', '700', 'middle')
    body += text(x+52, 296, 'excluded' if i < 3 else ['0.6931','1.3863','0.2231'][i-3], 16, '#4a5a53' if i < 3 else '#13201a', anchor='middle')
body += text(30, 207, 'LOSS MASK', 12, '#4a5a53', '700')
body += text(30, 272, 'TOKEN LOSS (NATS)', 12, '#4a5a53', '700')
body += '<path d="M370 85V308" stroke="#b8c7bd" stroke-dasharray="5 5"/>'
body += rect(26, 324, 708, 69, '#edf2ec')
body += text(44, 351, 'Mean response loss = (0.6931 + 1.3863 + 0.2231) / 3', 17, weight='700')
body += text(44, 379, '0.7675 nats per scored token. Prompt tokens still influence the answer.', 16, '#4a5a53')
save('posttraining-sft-mask.svg', 'Response-only supervised loss', 'Return two colors is the conditioning prompt with zero loss mask. Blue, green and end-of-sequence have mask one and token losses 0.6931, 1.3863 and 0.2231. Their average is 0.7675 nats.', body, 414)

body = text(26, 34, 'Four training jobs, four distinct sources of pressure', 23, weight='700')
body += text(26, 64, 'Reward-model fitting and policy training update different parameters.', 15, '#4a5a53')
rows = [
 ('SFT', ['Prompt + demonstration', 'Correct response tokens'], ['Token prediction loss', 'Update the answering policy']),
 ('Reward fitting', ['Prompt + ranked responses', 'Which answer was preferred?'], ['Pairwise ranking loss', 'Update the reward scorer']),
 ('PPO-style RLHF', ['Fresh policy responses', 'Frozen scorer + reference'], ['Reward-guided RL update', 'Update the answering policy']),
 ('DPO', ['Existing preference pairs', 'Frozen reference likelihoods'], ['Relative likelihood loss', 'Update the answering policy'])]
for i,(label,inputs,outputs) in enumerate(rows):
    y=91+120*i
    body += rect(26,y,145,91,'#133e32') + text(98.5,y+50,label,16,'#ffffff','700','middle')
    body += rect(193,y,236,91,'#edf2ec')
    body += text(210,y+34,inputs[0],16,weight='700') + text(210,y+64,inputs[1],14,'#4a5a53')
    body += text(173,y+51,'→',22,'#4a5a53')
    body += rect(451,y,283,91,'#eef4fb')
    body += text(468,y+34,outputs[0],16,weight='700') + text(468,y+64,outputs[1],15,'#405c75')
    body += text(431,y+51,'→',22,'#4a5a53')
body += text(26,576,'These jobs can be combined across a pipeline; DPO does not require an explicit reward scorer.',14,'#4a5a53')
save('posttraining-training-jobs.svg', 'Distinguish supervised, reward, RLHF and DPO training', 'SFT uses demonstration targets to train the answering policy. Reward fitting uses preferences to train a scalar scorer. PPO-style RLHF trains the policy from fresh outputs and a scorer plus reference. DPO trains the policy from existing pairs and frozen reference likelihoods.',body,598)

plt.rcParams.update({'font.family':'DejaVu Sans','font.size':12,'svg.fonttype':'none','svg.hashsalt':'slp3-posttraining',
 'axes.spines.top':False,'axes.spines.right':False,'axes.spines.left':False,'axes.spines.bottom':False,
 'figure.facecolor':'#fffdf9','axes.facecolor':'#fffdf9','text.color':'#13201a','axes.labelcolor':'#13201a',
 'xtick.color':'#4a5a53','ytick.color':'#4a5a53'})
fig,ax=plt.subplots(figsize=(10,5.8))
fig.subplots_adjust(left=.10,right=.95,bottom=.18,top=.77)
xs=[i/1000 for i in range(50,951)]
def loss(p,ref):
    s=.5*(math.log(p/(1-p))-math.log(ref/(1-ref)))
    return max(-s,0)+math.log1p(math.exp(-abs(s)))
for ref,color in [(.3,'#ad5728'),(.6,'#087354'),(.9,'#3b6493')]:
    ax.plot(xs,[loss(p,ref) for p in xs],color=color,lw=2.5,label=f'Reference chosen probability {ref:.1f}')
ax.set_xlim(.05,.95);ax.set_ylim(0,2.85);ax.grid(color='#e0e6de',lw=.8)
ax.set_xticks([.1,.3,.5,.7,.9]);ax.set_yticks([0,.5,1,1.5,2,2.5]);ax.tick_params(length=0,pad=9)
ax.vlines(.7,0,loss(.7,.6),color='#65766a',ls='--',lw=1)
ax.plot(.7,loss(.7,.6),'o',color='#133e32',markersize=8)
ax.annotate('Worked example\nloss = 0.5888',xy=(.7,loss(.7,.6)),xytext=(.52,1.28),
            arrowprops={'arrowstyle':'->','color':'#133e32'},fontsize=12,weight='bold',
            bbox={'boxstyle':'round,pad=.4','fc':'#edf2ec','ec':'none'})
ax.legend(loc='upper right',frameon=False,fontsize=11)
ax.set_xlabel('Current policy probability of the chosen completion',labelpad=10)
ax.set_ylabel('DPO pair loss (nats)',labelpad=10)
fig.text(.04,.94,'The same policy is compared with its reference',fontsize=21,weight='bold')
fig.text(.04,.878,'Two possible completions; chosen + rejected probabilities = 1.  β = 0.5.',fontsize=12,color='#4a5a53')
fig.text(.10,.042,'Lower pair loss means a larger chosen-versus-rejected improvement relative to that reference.',fontsize=11,color='#4a5a53')
target=OUT/'posttraining-dpo-reference.svg'
fig.savefig(target,metadata={'Date':None,'Title':'DPO loss depends on the reference policy','Description':'DPO loss curves for three frozen reference probabilities and beta 0.5. The current policy chosen probability 0.7 gives loss 0.5888 against reference 0.6.'})
plt.close(fig)
svg = target.read_text().replace("font-family: 'DejaVu Sans'", 'font-family: Arial, sans-serif')
target.write_text("\n".join(line.rstrip() for line in svg.splitlines()) + "\n")
