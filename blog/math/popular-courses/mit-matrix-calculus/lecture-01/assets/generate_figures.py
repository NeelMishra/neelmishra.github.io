#!/usr/bin/env python3
"""Rebuild the original lecture figures with Python's standard library.
Run: python3 blog/math/popular-courses/mit-matrix-calculus/lecture-01/assets/generate_figures.py
Text and figures: CC BY-NC-SA 4.0, as attributed in the lecture.
"""
from pathlib import Path
from html import escape
import math
OUT=Path(__file__).resolve().parent
INK='#173e35'; MUTED='#54675e'; GREEN='#087b60'; ORANGE='#b64b24'; LINE='#d8dfd7'; BLUE='#346aa0'
def text(x,y,s,size=22,color=INK,weight=400,anchor='start'):
 return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-weight="{weight}" text-anchor="{anchor}">{escape(s)}</text>'
def line(x1,y1,x2,y2,color=LINE,width=2,dash='',arrow=False):
 return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}"'+(f' stroke-dasharray="{dash}"' if dash else '')+(' marker-end="url(#arrow)"' if arrow else '')+'/>'
def rect(x,y,w,h,fill='#f1f6ef'):
 return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="{fill}" stroke="{LINE}"/>'
def circle(x,y,r,color=GREEN): return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{color}"/>'
def save(name,height,title,desc,body,width=960):
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">
<title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="{GREEN}"/></marker></defs>
<rect width="{width}" height="{height}" fill="#fffdf9"/>
<g font-family="Arial, Helvetica, sans-serif">{body}</g></svg>'''
 (OUT/name).write_text(svg+'\n')
# 1. Two corresponding input/output maps.
b=text(38,44,'ONE CALCULATION. TWO QUESTIONS.',18,GREEN,700)
for y,labels in [(90,[('Parameters X','weights · geometry'),('Computation F','model · simulation'),('Objective F(X)','loss · drag')]),(255,[('Input change H','a small perturbation'),('Derivative DF(X)','at the current input'),('Prediction DF(X)[H]','first-order change')])]:
 for i,(a,c) in enumerate(labels):
  x=38+i*313;b+=rect(x,y,258,110,'#edf6f0' if y==255 else '#f7f3ea')+text(x+129,y+43,a,21,INK,700,'middle')+text(x+129,y+78,c,18,MUTED,400,'middle')
  if i<2:b+=line(x+269,y+55,x+301,y+55,GREEN,3,arrow=True)
b+=text(38,230,'Fix X. Now ask how a change travels through the calculation.',20,MUTED)
save('sensitivity-map.svg',420,'Sensitivity: values and changes','The derivative maps a parameter perturbation to a predicted objective change.',b)
# 2. A computed scalar plot, with a zoomed, numerically labeled gap.
x0,x1,y0,y1=2,4,3,17
px=lambda x:82+(x-x0)/(x1-x0)*485
py=lambda y:438-(y-y0)/(y1-y0)*337
b=text(38,44,'THE TANGENT PREDICTS THE NEARBY CURVE',18,GREEN,700)
for x in [2,2.5,3,3.5,4]:b+=line(px(x),92,px(x),438)+text(px(x),467,str(x),18,MUTED,anchor='middle')
for y in [4,8,12,16]:b+=line(82,py(y),567,py(y))+text(66,py(y)+6,str(y),18,MUTED,anchor='end')
b+=text(565,497,'x',22)+text(54,88,'y',22)
points=' '.join(f'{px(2+i/100):.2f},{py((2+i/100)**2):.2f}' for i in range(201))
b+=f'<polyline points="{points}" fill="none" stroke="{GREEN}" stroke-width="4"/>'
b+=line(px(2),py(3),px(4),py(15),ORANGE,3,'9 6')
b+=circle(px(3),py(9),6)+circle(px(3.5),py(12.25),6)+circle(px(3.5),py(12),4,ORANGE)
b+=text(px(3)-12,py(9)+32,'(3, 9)',20,INK,anchor='end')
b+=rect(614,103,308,295,'#f7f3ea')
for y,s,size,c,w in [(139,'At x = 3 + h',23,INK,700),(177,'Choose h = 0.5',21,MUTED,400),(224,'Actual: 12.25',25,GREEN,700),(264,'Tangent: 12.00',25,ORANGE,700),(311,'Gap = h² = 0.25',23,INK,700),(361,'Prediction: 9 + 6h',21,MUTED,400)]:b+=text(638,y,s,size,c,w)
b+=line(616,436,651,436,GREEN,4)+text(662,443,'y = x²',20)
b+=line(616,477,651,477,ORANGE,3,'9 6')+text(662,484,'y = 9 + 6(x − 3)',20)
save('scalar-linearization.svg',540,'A curve and its tangent','Computed plot of x squared and its tangent at x equals 3. At 3.5 the difference is 0.25.',b)
# 3. Actual level-set geometry in the first quadrant.
px=lambda x:75+x*61;py=lambda y:465-y*61
b=text(38,44,'A GRADIENT POINTS ACROSS LEVEL CURVES',18,GREEN,700)
for v in [0,2,4,6]:
 b+=line(px(v),85,px(v),465)+text(px(v),493,str(v),17,MUTED,anchor='middle')
 if v:b+=line(75,py(v),500,py(v))+text(57,py(v)+6,str(v),17,MUTED,anchor='end')
for radius in [3,4,5,6]:
 pts=' '.join(f'{px(radius*math.cos(i*math.pi/400)):.2f},{py(radius*math.sin(i*math.pi/400)):.2f}' for i in range(201))
 b+=f'<polyline points="{pts}" fill="none" stroke="{GREEN if radius==5 else LINE}" stroke-width="{3 if radius==5 else 2}"/>'
b+=text(px(5)-15,py(.45),'f = 25',18,GREEN)
x,y=px(3),py(4)
b+=line(x,y,px(4.5),py(6),GREEN,4,arrow=True)
b+=line(px(1.8),py(4.9),px(5),py(2.5),BLUE,3,'8 5')
b+=circle(x,y,7,INK)+text(x-12,y+29,'x = (3, 4)',20,INK,anchor='end')
b+=text(497,498,'x₁',20)+text(45,78,'x₂',20)
b+=rect(551,110,371,314,'#f7f3ea')
for yy,s,size,c,w in [(150,'Squared length: x₁² + x₂²',22,INK,700),(202,'Gradient direction: (6, 8)',22,GREEN,700),(244,'Tangent direction: (4, −3)',21,BLUE,700),(293,'Their dot product is zero:',21,MUTED,400),(331,'6 × 4 + 8 × (−3) = 0',23,INK,700),(387,'Zero first-order change ≠ no change',18,MUTED,400)]:b+=text(572,yy,s,size,c,w)
save('vector-geometry.svg',540,'Gradient and level curves','A computed circle diagram shows the gradient at (3,4) perpendicular to a tangent direction.',b)
# 4. Matrix order, intentionally stacked in a broad accessible figure.
def mat(x,y,a):
 s=f'<path d="M{x+8} {y} h-8 v84 h8 M{x+116} {y} h8 v84 h-8" fill="none" stroke="{INK}" stroke-width="2"/>'
 for i,row in enumerate(a):
  for j,v in enumerate(row):s+=text(x+34+j*55,y+30+i*39,str(v),28,INK,500,'middle')
 return s
b=text(38,44,'TWO MULTIPLICATION ORDERS, TWO DIFFERENT ANSWERS',18,GREEN,700)
for x,title,a in [(55,'XE',[[2,1],[3,0]]),(366,'EX',[[0,3],[1,2]]),(698,'XE + EX',[[2,4],[4,2]])]:
 b+=rect(x-15,80,230,174)+text(x+100,117,title,24,GREEN,700,'middle')+mat(x+38,139,a)
b+=text(291,181,'+',34,GREEN,700)+text(607,181,'=',34,GREEN,700)
b+=rect(40,296,880,159,'#f7f3ea')+text(64,335,'Doubling only XE gives',23,ORANGE,700)+mat(356,330,[[4,2],[6,0]])+text(532,367,'≠',38,ORANGE,700)+mat(629,330,[[2,4],[4,2]])
b+=text(64,422,'2XE misses the EX term.',20,MUTED)
save('matrix-order.svg',500,'Order matters for a matrix square','XE plus EX differs from twice XE for the matrix example.',b)
# 5. Computation and perturbation tracks.
b=text(38,44,'PROPAGATE A CHANGE THROUGH SIMPLE OPERATIONS',18,GREEN,700)
labels=[('x = 2','input','h'),('u = 4','u = x²','4h'),('v = 5','v = u + 1','4h'),('q = 25','q = v²','40h')]
for i,(value,op,change) in enumerate(labels):
 x=38+i*232
 b+=rect(x,98,188,127,'#f7f3ea')+text(x+94,141,value,27,INK,700,'middle')+text(x+94,187,op,22,MUTED,400,'middle')
 b+=rect(x,290,188,78)+text(x+94,340,change,29,GREEN,700,'middle')
 if i<3:
  b+=line(x+193,158,x+223,158,GREEN,3,arrow=True)+line(x+193,329,x+223,329,GREEN,3,arrow=True)
  b+=text(x+210,275,['× 2x','× 1','× 2v'][i],18,GREEN,700,'middle')
b+=text(38,422,'Values travel across the top; first-order changes travel across the bottom.',21,MUTED)
save('derivative-flow.svg',470,'A forward derivative calculation','The chain rule transforms h to 4h to 4h to 40h at x equals 2.',b)

# Mobile compositions keep labels readable instead of shrinking a wide diagram.
def crop(name,x,y,w,h,dx,dy,dw,dh):
 original=(OUT/name).read_text().split('<g font-family="Arial, Helvetica, sans-serif">',1)[1].rsplit('</g></svg>',1)[0]
 return f'<svg x="{dx}" y="{dy}" width="{dw}" height="{dh}" viewBox="{x} {y} {w} {h}">{original}</svg>'
b=text(24,39,'VALUES AND THEIR CHANGES',20,GREEN,700)
b+=text(24,78,'Original calculation',23,INK,700)
for i,(s,c) in enumerate([('Parameters X','weights · geometry'),('Computation F','model · simulation'),('Objective F(X)','loss · drag')]):
 y=98+i*112;b+=rect(24,y,432,86,'#f7f3ea')+text(240,y+35,s,25,INK,700,'middle')+text(240,y+65,c,21,MUTED,anchor='middle')
 if i<2:b+=line(240,y+89,240,y+108,GREEN,2,arrow=True)
b+=text(24,463,'Fix X. Now follow a perturbation.',23,INK,700)
for i,(s,c) in enumerate([('Input change H','a small perturbation'),('Derivative DF(X)','evaluated at the current X'),('Prediction DF(X)[H]','first-order output change')]):
 y=484+i*112;b+=rect(24,y,432,86)+text(240,y+35,s,24,INK,700,'middle')+text(240,y+65,c,21,MUTED,anchor='middle')
 if i<2:b+=line(240,y+89,240,y+108,GREEN,2,arrow=True)
save('sensitivity-map-mobile.svg',824,'Values and changes','A vertical version of the sensitivity map.',b,480)
b=text(24,39,'A CURVE AND ITS TANGENT',20,GREEN,700)
b+=crop('scalar-linearization.svg',30,68,565,445,12,63,456,360)
b+=rect(24,442,432,222,'#f7f3ea')+text(46,478,'At x = 3 + h, choose h = 0.5',23,INK,700)
b+=text(46,523,'Actual value: 12.25',25,GREEN,700)+text(46,563,'Tangent prediction: 12.00',25,ORANGE,700)+text(46,614,'Gap = h² = 0.25',25,INK,700)
b+=line(25,701,61,701,GREEN,4)+text(76,707,'y = x²',22)+line(25,747,61,747,ORANGE,3,'9 6')+text(76,753,'y = 9 + 6(x − 3)',22)
save('scalar-linearization-mobile.svg',784,'A curve and its tangent','Computed plot and a readable numerical comparison.',b,480)
b=text(24,39,'GRADIENTS AND LEVEL CURVES',20,GREEN,700)
b+=crop('vector-geometry.svg',25,59,511,453,10,64,460,408)
b+=rect(24,486,432,273,'#f7f3ea')
for yy,s,size,c,w in [(526,'Squared length: x₁² + x₂²',24,INK,700),(574,'Gradient: (6, 8)',25,GREEN,700),(619,'Tangent: (4, −3)',25,BLUE,700),(667,'6 × 4 + 8 × (−3) = 0',25,INK,700),(716,'Zero first-order change',23,MUTED,400),(745,'does not mean zero actual change.',21,MUTED,400)]:b+=text(46,yy,s,size,c,w)
save('vector-geometry-mobile.svg',789,'Gradient and level curves','A computed contour plot with explanatory directions below.',b,480)
b=text(24,39,'KEEP BOTH MULTIPLICATION ORDERS',19,GREEN,700)
for x,label,a in [(35,'XE',[[2,1],[3,0]]),(268,'EX',[[0,3],[1,2]])]:
 b+=rect(x-11,73,187,174)+text(x+82,112,label,26,GREEN,700,'middle')+mat(x+18,134,a)
b+=text(234,184,'+',28,GREEN,700,'middle')
b+=rect(24,278,432,169)+text(49,320,'XE + EX',26,GREEN,700)+mat(282,318,[[2,4],[4,2]])+text(49,373,'Correct',22,MUTED)+text(49,405,'linear rule',22,MUTED)
b+=rect(24,477,432,169,'#f7f3ea')+text(49,522,'2XE',26,ORANGE,700)+mat(282,517,[[4,2],[6,0]])+text(49,569,'Different',22,MUTED)+text(49,601,'answer',22,MUTED)
save('matrix-order-mobile.svg',675,'Two multiplication orders','XE and EX add to the correct derivative action. Doubling XE gives a different matrix.',b,480)
b=text(24,39,'THE CHAIN RULE IN SMALL STEPS',20,GREEN,700)+text(24,81,'Values',22,INK,700)+text(285,81,'Changes',22,GREEN,700)
for i,(value,op,change) in enumerate(labels):
 y=100+i*155
 b+=rect(24,y,207,100,'#f7f3ea')+text(127,y+39,value,27,INK,700,'middle')+text(127,y+76,op,23,MUTED,anchor='middle')
 b+=rect(275,y,181,100)+text(365,y+59,change,30,GREEN,700,'middle')
 if i<3:
  b+=line(125,y+109,125,y+143,GREEN,3,arrow=True)+line(365,y+109,365,y+143,GREEN,3,arrow=True)
  b+=text(277,y+135,['× 2x','× 1','× 2v'][i],21,GREEN,700,'middle')
b+=text(24,718,'At x = 2, the derivative is 40.',24,INK,700)
save('derivative-flow-mobile.svg',750,'Propagating a change','Values and perturbations flow down parallel columns.',b,480)
print('Generated 5 figures with desktop and mobile compositions.')
