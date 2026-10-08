const $=id=>document.getElementById(id);
const file=$('file'),source=$('source'),output=$('output'),extract=$('extract'),single=$('single'),trace=$('trace'),download=$('download'),status=$('status');
let loaded=false,edge=null,W=0,H=0,pathPoints=null;
for(const id of ['threshold','blur','thickness']) $(id).addEventListener('input',e=>$(id+'Value').value=e.target.value);
file.addEventListener('change',()=>{const f=file.files[0];if(!f)return;if(!/^image\/(png|jpeg|webp)$/.test(f.type)){setStatus('Unsupported image type.',true);return}
 const img=new Image();img.onload=()=>{const max=1600,s=Math.min(1,max/Math.max(img.width,img.height));W=source.width=Math.round(img.width*s);H=source.height=Math.round(img.height*s);source.getContext('2d').drawImage(img,0,0,W,H);source.style.display='block';$('sourceEmpty').style.display='none';loaded=true;extract.disabled=false;single.disabled=true;trace.disabled=true;download.disabled=true;setStatus('Picture loaded. Select Extract outlines.');URL.revokeObjectURL(img.src)};img.src=URL.createObjectURL(f)});
extract.onclick=()=>{if(loaded)extractOutline()};
function extractOutline(){setStatus('Extracting outlines…');const px=source.getContext('2d').getImageData(0,0,W,H).data;let gray=new Float32Array(W*H);
 for(let i=0,p=0;i<px.length;i+=4,p++)gray[p]=.299*px[i]+.587*px[i+1]+.114*px[i+2];for(let k=0;k<+$('blur').value;k++)gray=boxBlur(gray,W,H);
 edge=new Uint8Array(W*H);const t=+$('threshold').value;for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x,gx=-gray[i-W-1]+gray[i-W+1]-2*gray[i-1]+2*gray[i+1]-gray[i+W-1]+gray[i+W+1],gy=-gray[i-W-1]-2*gray[i-W]-gray[i-W+1]+gray[i+W-1]+2*gray[i+W]+gray[i+W+1];edge[i]=Math.hypot(gx,gy)>=t?1:0}renderEdges();pathPoints=null;single.disabled=false;trace.disabled=false;download.disabled=false;setStatus('Outline extraction complete. You can now build one continuous pen path.')}
function renderEdges(){clearSegments();svgMarkup='';$('vectorView').style.display='none';$('svgDownload').disabled=true;output.width=W;output.height=H;const o=output.getContext('2d'),im=o.createImageData(W,H);im.data.fill(255);const thick=+$('thickness').value;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(edge[y*W+x])for(let dy=-thick+1;dy<thick;dy++)for(let dx=-thick+1;dx<thick;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<W&&yy>=0&&yy<H){const q=(yy*W+xx)*4;im.data[q]=im.data[q+1]=im.data[q+2]=0;im.data[q+3]=255}}o.putImageData(im,0,0);output.style.display='block';$('outputEmpty').style.display='none'}
single.onclick=()=>buildContinuousPath();
function buildContinuousPath(){clearSegments();svgMarkup='';$('vectorView').style.display='none';$('svgDownload').disabled=true;output.style.display='block';if(!edge)return;setStatus('Building continuous pen path…');const pts=[];for(let y=0;y<H;y+=2)for(let x=0;x<W;x+=2)if(edge[y*W+x])pts.push({x,y});if(!pts.length){setStatus('No outline points found.',true);return}
 const used=new Uint8Array(pts.length),path=[],cell=24,buckets=new Map(),key=(x,y)=>Math.floor(x/cell)+','+Math.floor(y/cell);
 pts.forEach((p,i)=>{const k=key(p.x,p.y);if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(i)});
 let cur=0;used[cur]=1;path.push(pts[cur]);for(let n=1;n<pts.length;n++){const p=pts[cur],cx=Math.floor(p.x/cell),cy=Math.floor(p.y/cell);let best=-1,bd=Infinity;
  for(let r=0;r<=Math.max(Math.ceil(W/cell),Math.ceil(H/cell))&&best<0;r++)for(let yy=cy-r;yy<=cy+r;yy++)for(let xx=cx-r;xx<=cx+r;xx++){if(r&&xx>cx-r&&xx<cx+r&&yy>cy-r&&yy<cy+r)continue;for(const i of buckets.get(xx+','+yy)||[])if(!used[i]){const q=pts[i],d=(q.x-p.x)**2+(q.y-p.y)**2;if(d<bd){bd=d;best=i}}}
  if(best<0)break;cur=best;used[cur]=1;path.push(pts[cur])}
 pathPoints=path;trace.disabled=false;const o=output.getContext('2d');o.fillStyle='white';o.fillRect(0,0,W,H);o.strokeStyle='black';o.lineWidth=Math.max(1,+$('thickness').value);o.lineCap='round';o.lineJoin='round';o.beginPath();o.moveTo(path[0].x,path[0].y);for(let i=1;i<path.length;i++)o.lineTo(path[i].x,path[i].y);o.stroke();
 o.fillStyle='black';o.beginPath();o.arc(path[0].x,path[0].y,4,0,Math.PI*2);o.fill();setStatus('Single continuous path generated: '+path.length+' sampled outline points, with connecting/retraced travel where required.');download.disabled=false}

// Trace connected pixel paths, not horizontal/vertical scan-grid runs.
function traceGeometry(){
 const nbr=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]],seen=new Uint8Array(W*H),parts=[];
 const adjacent=i=>{const x=i%W,y=(i/W)|0,r=[];for(const [dx,dy] of nbr){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<W&&yy>=0&&yy<H&&edge[yy*W+xx])r.push(yy*W+xx)}return r};
 // Group connected edge pixels, then walk each group using local adjacency.
 for(let seed=0;seed<edge.length;seed++)if(edge[seed]&&!seen[seed]){
  const stack=[seed],pixels=[];seen[seed]=1;
  while(stack.length){const i=stack.pop();pixels.push(i);for(const j of adjacent(i))if(!seen[j]){seen[j]=1;stack.push(j)}}
  if(pixels.length<12)continue;
  const inPart=new Set(pixels),used=new Set(),degrees=new Map();
  for(const i of pixels)degrees.set(i,adjacent(i).filter(j=>inPart.has(j)).length);
  const starts=pixels.filter(i=>degrees.get(i)!==2);
  const queue=starts.length?starts:pixels.slice(0,1);
  for(const start of queue){
   for(const first of adjacent(start).filter(j=>inPart.has(j))){
    const key=(u,v)=>u<v?u+':'+v:v+':'+u;
    if(used.has(key(start,first)))continue;
    const chain=[start],prev0=start;let prev=prev0,cur=first;
    while(true){used.add(key(prev,cur));chain.push(cur);const options=adjacent(cur).filter(j=>inPart.has(j)&&j!==prev&&!used.has(key(cur,j)));
     if(degrees.get(cur)!==2||!options.length)break;
     prev=cur;cur=options[0];
    }
    if(chain.length>=7)parts.push(chain.map(i=>({x:i%W,y:(i/W)|0})));
   }
  }
 }
 return parts;
}
function geometryMarks(chains,target){
 const lengths=chains.map(c=>{let d=0;for(let i=1;i<c.length;i++)d+=Math.hypot(c[i].x-c[i-1].x,c[i].y-c[i-1].y);return d});
 const candidates=chains.map((c,i)=>({c,len:lengths[i],i})).filter(v=>v.len>=8).sort((a,b)=>b.len-a.len);
 const selected=candidates.slice(0,target),counts=selected.map(()=>1);
 let remaining=Math.max(0,target-selected.length),weight=selected.reduce((s,v)=>s+v.len,0);
 const fractions=selected.map(v=>remaining*v.len/(weight||1));
 fractions.forEach((v,i)=>counts[i]+=Math.floor(v));
 remaining=target-counts.reduce((a,b)=>a+b,0);
 const order=fractions.map((v,i)=>({i,f:v-Math.floor(v)})).sort((a,b)=>b.f-a.f);
 for(let i=0;i<remaining&&i<order.length;i++)counts[order[i].i]++;
 const marks=[];
 selected.forEach((v,k)=>{const c=v.c,n=counts[k],total=v.len;let cum=[0];for(let i=1;i<c.length;i++)cum.push(cum[i-1]+Math.hypot(c[i].x-c[i-1].x,c[i].y-c[i-1].y));
  for(let j=0;j<n;j++){const at=total*(j+.5)/n;let i=1;while(i<cum.length-1&&cum[i]<at)i++;const t=(at-cum[i-1])/Math.max(.001,cum[i]-cum[i-1]);marks.push({x:c[i-1].x+(c[i].x-c[i-1].x)*t,y:c[i-1].y+(c[i].y-c[i-1].y)*t,part:k+1,sub:j+1})}
 });
 return marks.sort((a,b)=>a.part-b.part||a.sub-b.sub);
}
let svgMarkup='';
let segmentedMarkup='',segmentGroups=[];
function clearSegments(){profileResult=null;diagnosticFootnotes=null;if($('downloadDiagnostics'))$('downloadDiagnostics').disabled=true;if($('profileReport'))$('profileReport').textContent='';if($('profileSvg'))$('profileSvg').disabled=true;if($('applyConsolidation'))$('applyConsolidation').disabled=true;numberJob++;if($('cancelNumber'))$('cancelNumber').disabled=true;if($('cleanPreview'))$('cleanPreview').disabled=true;segmentInventory=null;$('countSegments').disabled=true;$('numberSegments').disabled=true;$('inventory').textContent='';$('numberSegments').disabled=true;$('numberedDownload').disabled=true;numberedMarkup='';segmentedMarkup='';segmentGroups=[];for(const id of ['segment','allOn','allOff','toggleSegment','segmentDownload'])$(id).disabled=true;$('segmentInfo').textContent=''}
function buildSegments(){
 if(!segmentInventory){setStatus('Count line segments first to create geometric segment IDs.',true);return}
 const eligible=segmentInventory.eligible;
 segmentGroups=eligible.map((item,i)=>'<g id="segment-'+(i+1)+'" data-segment="'+(i+1)+'">'+svgPath(item.c,0,1)+'</g>');
 segmentedMarkup='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'"><rect width="100%" height="100%" fill="white"/>'+segmentGroups.join('')+'</svg>';
 const view=$('vectorView');view.innerHTML=segmentedMarkup;view.style.display='block';output.style.display='none';
 for(const id of ['allOn','allOff','toggleSegment','segmentDownload'])$(id).disabled=false;
 $('segmentId').max=eligible.length;
 $('segmentInfo').textContent=eligible.length+' independently toggleable candidate geometric segments; IDs match numbered segment inventory.';
 setStatus('Geometric segment SVG ready: '+eligible.length+' candidate segments.');
}
$('segment').onclick=buildSegments;
function setAllSegments(visible){$('vectorView').querySelectorAll('[data-segment]').forEach(el=>el.style.display=visible?'':'none')}
$('allOn').onclick=()=>setAllSegments(true);
$('allOff').onclick=()=>setAllSegments(false);
$('toggleSegment').onclick=()=>{const n=+$('segmentId').value,el=$('vectorView').querySelector('[data-segment="'+n+'"]');if(!el){setStatus('Segment ID not found.',true);return}el.style.display=el.style.display==='none'?'':'none'};
$('segmentDownload').onclick=()=>{if(!segmentedMarkup)return;const view=$('vectorView').querySelector('svg');const markup=new XMLSerializer().serializeToString(view);const blob=new Blob([markup],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='loftsims-v0.3.18-redo-segments.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};


let numberedMarkup='',segmentInventory=null;
let profileResult=null;
const endpointId=p=>p.x+','+p.y;
function profileSegments(items){
 // Union-find graph profiling: O(segments + endpoint incidences), not a quadratic adjacency graph.
 const n=items.length,parent=new Int32Array(n),size=new Int32Array(n),endpoints=new Map();
 for(let i=0;i<n;i++){parent[i]=i;size[i]=1;const c=items[i].c;for(const p of [c[0],c.at(-1)]){const k=endpointId(p);let v=endpoints.get(k);if(!v){v=[];endpoints.set(k,v)}v.push(i)}}
 const find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i]}return i};
 const union=(a,b)=>{a=find(a);b=find(b);if(a!==b){if(size[a]<size[b])[a,b]=[b,a];parent[b]=a;size[a]+=size[b]}};
 let open=0,junctions=0;
 for(const ids of endpoints.values()){if(ids.length===1)open++;if(ids.length>2)junctions++;for(let j=1;j<ids.length;j++)union(ids[0],ids[j])}
 let contours=0,largest=0;
 for(let i=0;i<n;i++)if(find(i)===i){contours++;largest=Math.max(largest,size[i])}
 const short=items.reduce((v,item)=>v+(item.len<8?1:0),0);
 const coverage=n?largest/n:0,shortRatio=n?short/n:0;
 const score=Math.max(1,Math.min(10,Math.round(1+5*coverage+3*(1-shortRatio)+Math.min(1,n/Math.max(1,contours))-Math.min(2,junctions/Math.max(1,n)*8))));
 return {segments:n,contours,open,junctions,short,coverage,shortRatio,score};
}
function consolidateSegments(items,mode){
 // Join only at exact shared endpoints. Preserve every vertex and all path lengths.
 const threshold={conservative:-0.985,balanced:-0.94,aggressive:-0.82}[mode]??-.94;
 const paths=items.map(v=>v.c.slice()),alive=new Uint8Array(paths.length).fill(1);
 const key=p=>endpointId(p);
 const direction=(c,end)=>{const a=end?c.at(-1):c[0],b=end?c[Math.max(0,c.length-4)]:c[Math.min(c.length-1,3)],d=Math.hypot(a.x-b.x,a.y-b.y)||1;return [(a.x-b.x)/d,(a.y-b.y)/d]};
 let merges=0;
 for(let pass=0;pass<4;pass++){
  const map=new Map();
  paths.forEach((c,i)=>{if(!alive[i])return;for(const p of [c[0],c.at(-1)]){const k=key(p);if(!map.has(k))map.set(k,[]);map.get(k).push(i)}});
  let changed=0;
  for(const [k,ids] of map){const active=[...new Set(ids)].filter(i=>alive[i]);if(active.length!==2)continue;
   const [a,b]=active,ca=paths[a],cb=paths[b],ae=key(ca.at(-1))===k,be=key(cb.at(-1))===k;
   const da=direction(ca,ae),db=direction(cb,be);
   if(da[0]*db[0]+da[1]*db[1]>threshold)continue;
   const left=ae?ca:ca.slice().reverse(),right=be?cb.slice().reverse():cb;
   paths[a]=left.concat(right.slice(1));alive[b]=0;changed++;merges++;
  }
  if(!changed)break;
 }
 const result=paths.filter((_,i)=>alive[i]).map(c=>({c,len:c.reduce((v,p,i)=>v+(i?Math.hypot(p.x-c[i-1].x,p.y-c[i-1].y):0),0)}));
 return {result,merges};
}
let diagnosticFootnotes=null;
function renderProfile(){
 if(!segmentInventory)return;
 setStatus('Profiling segment topology and consolidation proposal…');
 const before=profileSegments(segmentInventory.eligible),mode=$('consolidation').value;
 const proposal=consolidateSegments(segmentInventory.eligible,mode),after=profileSegments(proposal.result);
 profileResult={before,after,proposal,mode};
 const consistent=before.segments===segmentInventory.eligible.length&&after.segments===proposal.result.length;
 const reduction=before.segments-after.segments;
 diagnosticFootnotes={
  schema:'LoftSims.DiagnosticsFootnotes.v1',version:'v0.3.18-redo',stage:'SVG profiling',
  recordedAt:new Date().toISOString(),source:'Current in-memory geometric segment inventory',
  measurements:{...before,rawFragments:segmentInventory.rawCount,straight:segmentInventory.straight,curved:segmentInventory.curved},
  proposal:{mode,before:before.segments,after:after.segments,joins:proposal.merges,reduction,reductionPercent:before.segments?100*reduction/before.segments:0,projectedScore:after.score},
  assertions:{consistentCounts:consistent,nonIncreasingSegmentCount:after.segments<=before.segments,joinedCountMatchesReduction:proposal.merges===reduction},
  footnotes:[
   {id:'DF-001',observation:'Short fragments '+before.short+' / '+before.segments,impact:'Excessive fragmentation can prevent practical continuous numbering',hypothesis:'Skeleton junction topology and texture-driven edges',validation:'pending'},
   {id:'DF-002',observation:'Exact-endpoint consolidation joins '+proposal.merges,impact:'Limited reduction where endpoints are disconnected',hypothesis:'Exact endpoint matching is too restrictive for fragmented contours',validation:'pending'},
   {id:'DF-003',observation:'Profiled inventory '+before.segments+'; proposed '+after.segments,impact:'Counts must be consistent before downstream numbering',validation:consistent?'passed':'failed'}
  ],
  limitations:['Heuristic score, not independently calibrated','No inferred connections or lost-source-detail recovery','No visual fidelity validation']
 };
 const rows=[
  ['Suitability score',before.score+'/10 (heuristic)'],
  ['Detected candidates',before.segments.toLocaleString()],
  ['Connected contours',before.contours.toLocaleString()],
  ['Open endpoints',before.open.toLocaleString()],
  ['Junctions',before.junctions.toLocaleString()],
  ['Short fragments',before.short.toLocaleString()+' ('+(before.shortRatio*100).toFixed(1)+'%)'],
  ['Largest connected group',(before.coverage*100).toFixed(1)+'%'],
  ['Proposed '+mode+' segments',after.segments.toLocaleString()],
  ['Proposed reduction',reduction.toLocaleString()+' ('+(before.segments?100*reduction/before.segments:0).toFixed(2)+'%)'],
  ['Projected score',after.score+'/10'],
  ['Count consistency',consistent?'PASS':'FAIL']
 ];
 const report=$('profileReport');report.replaceChildren();
 const heading=document.createElement('h3');heading.textContent='SVG Profile · Diagnostics Footnotes';report.append(heading);
 const table=document.createElement('table');table.style.cssText='width:100%;border-collapse:collapse;font-size:13px';
 for(const [name,value] of rows){const tr=document.createElement('tr'),th=document.createElement('th'),td=document.createElement('td');th.textContent=name;td.textContent=String(value);th.style.cssText='text-align:left;padding:5px;border-bottom:1px solid #ddd';td.style.cssText='text-align:right;padding:5px;border-bottom:1px solid #ddd';tr.append(th,td);table.append(tr)}
 report.append(table);
 const note=document.createElement('p');note.textContent='DF-001: Heavy fragmentation. DF-002: Exact-endpoint joins are limited. DF-003: Count consistency '+(consistent?'passed':'failed')+'. Proposed consolidation preserves traced vertices but does not repair missing source geometry.';report.append(note);
 $('downloadDiagnostics').disabled=false;
 $('applyConsolidation').disabled=!consistent||proposal.merges===0;
 setStatus('Profile complete: '+before.segments.toLocaleString()+' candidates; '+proposal.merges+' proposed joins; score '+before.score+'/10.');
}
$('downloadDiagnostics').onclick=()=>{
 if(!diagnosticFootnotes)return;
 const blob=new Blob([JSON.stringify(diagnosticFootnotes,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='loftsims-v0.3.18-redo-diagnostics-footnotes.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('profileSvg').onclick=renderProfile;
$('consolidation').onchange=()=>{if(segmentInventory)renderProfile()};
$('applyConsolidation').onclick=()=>{
 if(!profileResult||!segmentInventory)return;
 const {proposal}=profileResult;
 // Retain the complete geometry, assigning IDs in the existing traversal order.
 const eligible=proposal.result.map((v,i)=>({...v,id:i+1}));
 segmentInventory.eligible=eligible;
 segmentInventory.straight=eligible.filter(v=>{const a=v.c[0],b=v.c.at(-1),dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);return v.c.every(p=>(d?Math.abs(dx*(a.y-p.y)-(a.x-p.x)*dy)/d:0)<=Math.max(1.5,v.len*.06))}).length;
 segmentInventory.curved=eligible.length-segmentInventory.straight;
 $('inventory').textContent='Consolidated candidate segments: '+eligible.length+' | Straight: '+segmentInventory.straight+' | Curved: '+segmentInventory.curved+'. All original traced vertices retained.';
 $('numberedDownload').disabled=true;numberedMarkup='';segmentedMarkup='';segmentGroups=[];
 for(const id of ['allOn','allOff','toggleSegment','segmentDownload'])$(id).disabled=true;
 renderProfile();setStatus('Consolidation applied: '+eligible.length+' segments. Preview or number to inspect.');
};

function countLineSegments(){
 if(!edge||!W||!H){setStatus('Extract outlines first.',true);return}
 const w=W,h=H,N=w*h,mask=new Uint8Array(edge),neighbors=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
 // Zhang-Suen thinning: collapse thick Sobel traces to single-pixel skeletons.
 for(let iter=0;iter<35;iter++){
  let changed=0;
  for(let pass=0;pass<2;pass++){
   const remove=[];
   for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const i=y*w+x;if(!mask[i])continue;
    const p=[mask[i-w],mask[i-w+1],mask[i+1],mask[i+w+1],mask[i+w],mask[i+w-1],mask[i-1],mask[i-w-1]];
    const n=p.reduce((a,b)=>a+b,0);if(n<2||n>6)continue;
    let turns=0;for(let k=0;k<8;k++)if(!p[k]&&p[(k+1)%8])turns++;
    if(turns!==1)continue;
    if(pass===0?(p[0]*p[2]*p[4]||p[2]*p[4]*p[6]):(p[0]*p[2]*p[6]||p[0]*p[4]*p[6]))continue;
    remove.push(i);
   }
   for(const i of remove)mask[i]=0;changed+=remove.length;
  }
  if(!changed)break;
 }
 const adjacency=i=>{const x=i%w,y=(i/w)|0,out=[];for(const [dx,dy] of neighbors){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h&&mask[yy*w+xx])out.push(yy*w+xx)}return out};
 const degree=new Uint8Array(N),pixels=[];for(let i=0;i<N;i++)if(mask[i]){degree[i]=adjacency(i).length;pixels.push(i)}
 const used=new Set(),chains=[],key=(a,b)=>a<b?a*N+b:b*N+a;
 function walk(start,next){
  const line=[start];let prev=start,cur=next;
  while(true){
   const k=key(prev,cur);if(used.has(k))break;used.add(k);line.push(cur);
   if(degree[cur]!==2)break;
   const opts=adjacency(cur).filter(v=>v!==prev&&!used.has(key(cur,v)));
   if(!opts.length)break;prev=cur;cur=opts[0];
  }
  if(line.length>=2)chains.push(line.map(i=>({x:i%w,y:(i/w)|0})));
 }
 for(const i of pixels)if(degree[i]!==2)for(const j of adjacency(i))if(!used.has(key(i,j)))walk(i,j);
 for(const i of pixels)if(degree[i]===2)for(const j of adjacency(i))if(!used.has(key(i,j)))walk(i,j);
 // Geometry-based subdivision: keep shared boundary points; do not skip geometry at splits.
 const pieces=[];
 for(const chain of chains){
  let start=0;
  for(let k=4;k<chain.length-4;k++){
   const a=chain[Math.max(start,k-4)],b=chain[k],c=chain[Math.min(chain.length-1,k+4)];
   const ax=b.x-a.x,ay=b.y-a.y,bx=c.x-b.x,by=c.y-b.y;
   const angle=Math.acos(Math.max(-1,Math.min(1,(ax*bx+ay*by)/(Math.hypot(ax,ay)*Math.hypot(bx,by)||1))));
   if(angle>0.60&&k-start>=4){pieces.push(chain.slice(start,k+1));start=k}
  }
  if(chain.length-start>=2)pieces.push(chain.slice(start));
 }

 // Preserve every positive-length traced piece; never discard short geometry merely to reduce label count.\n // Consolidate near-collinear chain fragments at shared endpoints, without bridging gaps.
 const candidates=pieces.map(c=>({c,len:c.reduce((sum,p,i)=>i?sum+Math.hypot(p.x-c[i-1].x,p.y-c[i-1].y):0,0)})).filter(v=>v.len>0);
 const endpointKey=p=>p.x+','+p.y;
 const endpointMap=new Map();
 candidates.forEach((v,i)=>{for(const p of [v.c[0],v.c[v.c.length-1]]){const k=endpointKey(p);if(!endpointMap.has(k))endpointMap.set(k,[]);endpointMap.get(k).push(i)}});
 const alive=new Uint8Array(candidates.length).fill(1);
 const tangent=(c,atEnd)=>{const n=c.length;if(n<2)return [0,0];const a=atEnd?c[n-1]:c[0],b=atEnd?c[Math.max(0,n-5)]:c[Math.min(n-1,4)];const d=Math.hypot(a.x-b.x,a.y-b.y)||1;return [(a.x-b.x)/d,(a.y-b.y)/d]};
 // Only merge endpoints with a near-straight continuation; cap iterations for stability.
 for(let pass=0;pass<3;pass++){
  let merged=0;
  for(const [key,indices] of endpointMap){
   const active=indices.filter(i=>alive[i]&&[endpointKey(candidates[i].c[0]),endpointKey(candidates[i].c.at(-1))].includes(key));
   if(active.length!==2)continue;
   const [ia,ib]=active,a=candidates[ia].c,b=candidates[ib].c;
   const ae=endpointKey(a.at(-1))===key,be=endpointKey(b.at(-1))===key;
   const ta=tangent(a,ae),tb=tangent(b,be),dot=ta[0]*tb[0]+ta[1]*tb[1];
   if(dot>-.94)continue;
   const left=ae?a:a.slice().reverse(),right=be?b.slice().reverse():b;
   const joined=left.concat(right.slice(1));
   candidates[ia]={c:joined,len:candidates[ia].len+candidates[ib].len};alive[ib]=0;merged++;
   const other=endpointKey(joined.at(-1));if(!endpointMap.has(other))endpointMap.set(other,[]);endpointMap.get(other).push(ia);
  }
  if(!merged)break;
 }
 const preserved=candidates.filter((v,i)=>alive[i]);
 // Build a segment adjacency graph by shared skeleton endpoints.
 // Walk connected contours first; begin at a free endpoint when one exists.
 const keyOf=p=>p.x+','+p.y;
 const endpoints=new Map();
 preserved.forEach((item,i)=>{for(const p of [item.c[0],item.c.at(-1)]){const k=keyOf(p);if(!endpoints.has(k))endpoints.set(k,[]);endpoints.get(k).push(i)}});
 const endpointDegree=k=>(endpoints.get(k)||[]).length;
 const pointOrder=(a,b)=>a.y-b.y||a.x-b.x;
 const orderedIndices=preserved.map((_,i)=>i).sort((ia,ib)=>{
  const a=preserved[ia].c,b=preserved[ib].c;
  const pa=pointOrder(a[0],a.at(-1))<=0?a[0]:a.at(-1),pb=pointOrder(b[0],b.at(-1))<=0?b[0]:b.at(-1);
  return pointOrder(pa,pb)||ia-ib;
 });
 const visited=new Uint8Array(preserved.length),ordered=[];
 const emit=(idx,fromKey)=>{
  visited[idx]=1;const item=preserved[idx],c=item.c;
  const oriented=fromKey&&keyOf(c.at(-1))===fromKey?c.slice().reverse():c;
  ordered.push({...item,c:oriented});
  return keyOf(oriented.at(-1));
 };
 // Iterative depth-first walk avoids recursive stack overflow on large drawings.
 function traverse(seed,fromKey){
  const stack=[{idx:seed,fromKey}];
  while(stack.length){
   const next=stack.pop();if(visited[next.idx])continue;
   const exit=emit(next.idx,next.fromKey);
   const neighbors=(endpoints.get(exit)||[]).filter(i=>!visited[i]);
   // Continue through an aligned neighbor first at junctions; otherwise stable coordinate order.
   const c=ordered.at(-1).c,p=c.at(-1),prev=c[Math.max(0,c.length-4)],vx=p.x-prev.x,vy=p.y-prev.y,vlen=Math.hypot(vx,vy)||1;
   neighbors.sort((ia,ib)=>{
    const score=i=>{const q=preserved[i].c,other=keyOf(q[0])===exit?q[Math.min(q.length-1,3)]:q[Math.max(0,q.length-4)];return ((other.x-p.x)*vx+(other.y-p.y)*vy)/(Math.hypot(other.x-p.x,other.y-p.y)*vlen||1)};
    return score(ia)-score(ib)||ib-ia;
   });
   for(const i of neighbors)stack.push({idx:i,fromKey:exit});
  }
 }
 // Prefer free endpoints, then closed loops, then isolated segments.
 for(const i of orderedIndices){
  if(visited[i])continue;
  const c=preserved[i].c,a=keyOf(c[0]),b=keyOf(c.at(-1));
  if(endpointDegree(a)!==1&&endpointDegree(b)!==1)continue;
  traverse(i,endpointDegree(a)===1?a:b);
 }
 for(const i of orderedIndices)if(!visited[i])traverse(i,null);
 const eligible=ordered.map((item,i)=>({...item,id:i+1}));

 const straight=[],curved=[];
 for(const item of eligible){const c=item.c,a=c[0],b=c[c.length-1];let maxDeviation=0;const dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy);
  for(const p of c){const dev=dist?Math.abs(dx*(a.y-p.y)-(a.x-p.x)*dy)/dist:Math.hypot(p.x-a.x,p.y-a.y);if(dev>maxDeviation)maxDeviation=dev}
  (maxDeviation>Math.max(1.5,item.len*0.06)?curved:straight).push(item);
 }
 segmentInventory={eligible,rawCount:pieces.length,straight:straight.length,curved:curved.length,chains:chains.length,edgeCount:pixels.length};
 $('inventory').textContent='Raw fragments: '+pieces.length+' | Consolidated candidates: '+eligible.length+' | Straight: '+straight.length+' | Curved: '+curved.length+' | Traced chains: '+chains.length+' | Skeleton pixels: '+pixels.length+'. Counts are estimates from the current geometry detector.';
 $('numberSegments').disabled=eligible.length===0;$('cleanPreview').disabled=eligible.length===0;$('segment').disabled=eligible.length===0;
 $('profileSvg').disabled=eligible.length===0;$('applyConsolidation').disabled=true;profileResult=null;diagnosticFootnotes=null;$('downloadDiagnostics').disabled=true;$('profileReport').textContent='';setStatus('Segment inventory ready: '+eligible.length+' candidates. Run Profile SVG before numbering.');
 return segmentInventory;
}
$('countSegments').onclick=countLineSegments;

let numberJob=0;
let cleanMarkup='';
const svgStart=(w,h,pad,scale)=>'<svg xmlns="http://www.w3.org/2000/svg" width="'+(w*scale+pad*2)+'" height="'+(h*scale+pad*2)+'" viewBox="0 0 '+(w*scale+pad*2)+' '+(h*scale+pad*2)+'"><rect width="100%" height="100%" fill="white"/>';
const svgPath=(c,pad,scale)=>{if(c.length<2)return '';let d='M'+(pad+c[0].x*scale)+' '+(pad+c[0].y*scale);for(let j=1;j<c.length;j++)d+='L'+(pad+c[j].x*scale)+' '+(pad+c[j].y*scale);return '<path d="'+d+'" fill="none" stroke="#111" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>'};
$('cleanPreview').onclick=async()=>{
 if(!segmentInventory)return;
 const job=++numberJob,eligible=segmentInventory.eligible,parts=[svgStart(W,H,120,4)],progress=$('numberProgress');
 $('cleanPreview').disabled=true;$('cancelNumber').disabled=false;$('numberedDownload').disabled=true;progress.value=0;
 for(let i=0;i<eligible.length;i++){
  parts.push(svgPath(eligible[i].c,120,4));
  if(i%50===49){progress.value=Math.round((i+1)/eligible.length*100);setStatus('Clean vector preview '+(i+1)+' / '+eligible.length);await yieldFrame();if(job!==numberJob)return}
 }
 if(job!==numberJob)return;
 parts.push('</svg>');cleanMarkup=parts.join('');
 const view=$('vectorView');view.innerHTML=cleanMarkup;view.style.display='block';output.style.display='none';
 progress.value=100;$('cleanPreview').disabled=false;$('cancelNumber').disabled=true;
 setStatus('Clean SVG preview ready: '+eligible.length+' candidate centerlines. No gray raster; visual validation required.');
};

$('cancelNumber').onclick=()=>{numberJob++;$('cancelNumber').disabled=true;$('numberSegments').disabled=!segmentInventory;$('cleanPreview').disabled=!segmentInventory;setStatus('Numbering cancelled.')};
const yieldFrame=()=>new Promise(resolve=>setTimeout(resolve,0));
async function numberLineSegments(){
 if(!segmentInventory){setStatus('Count line segments before numbering.',true);return}
 const job=++numberJob,eligible=segmentInventory.eligible,w=W,h=H;
 const scale=4,pad=120,ww=w*scale+pad*2,hh=h*scale+pad*2;
 const total=eligible.length,parts=[svgStart(w,h,pad,scale)];
 const requested=$('target').value;const limit=requested==='all'?total:Math.min(total,Number(requested)||200);
 const progress=$('numberProgress');progress.value=0;$('cancelNumber').disabled=false;$('numberSegments').disabled=true;$('numberedDownload').disabled=true;
 // Yield between bounded batches so Cancel and progress remain responsive.
 const update=async(n,stage)=>{progress.value=Math.round(n/Math.max(1,stage==='Placing labels'?limit:total)*100);setStatus(stage+' '+n+' / '+(stage==='Placing labels'?limit:total));await yieldFrame();return job===numberJob};
 for(let i=0;i<total;i++){
  parts.push(svgPath(eligible[i].c,pad,scale));
  if(i%50===49&&!(await update(i+1,'Drawing clean centerlines')))return;
 }
 if(!(await update(total,'Drawing clean centerlines')))return;
 // Spatial occupancy index avoids comparing every label with every previous label.
 const cell=20,occupied=new Map(),font=9,grid=12;
 const cellsFor=(x,y,w,h)=>{const cells=[];for(let cy=Math.floor(y/cell);cy<=Math.floor((y+h)/cell);cy++)for(let cx=Math.floor(x/cell);cx<=Math.floor((x+w)/cell);cx++)cells.push(cx+','+cy);return cells};
 const intersects=(a,b)=>a.x<b.x+b.w+4&&a.x+a.w+4>b.x&&a.y<b.y+b.h+4&&a.y+a.h+4>b.y;
 const overlaps=box=>cellsFor(box.x-4,box.y-4,box.w+8,box.h+8).some(k=>(occupied.get(k)||[]).some(b=>intersects(box,b)));
 const reserve=box=>{for(const k of cellsFor(box.x,box.y,box.w,box.h)){if(!occupied.has(k))occupied.set(k,[]);occupied.get(k).push(box)}};
 let placed=0,unplaced=0;
 for(let i=0;i<limit;i++){
  const c=eligible[i].c,p=c[Math.floor(c.length/2)],x=pad+p.x*scale,y=pad+p.y*scale,label=String(i+1),tw=label.length*6+4,th=12;
  parts.push('<circle cx="'+x+'" cy="'+y+'" r="1.7" fill="#1477d2"/>');
  let found=null;
  // Local placement only, without leader lines or unbounded searches.
  for(let ring=1;ring<=5&&!found;ring++){
   for(let k=-ring;k<=ring&&!found;k++)for(const [dx,dy] of [[k,-ring],[k,ring],[-ring,k],[ring,k]]){
    const cx=x+dx*grid,cy=y+dy*grid,box={x:cx-tw/2,y:cy-th,w:tw,h:th};
    if(box.x<4||box.x+tw>ww-4||box.y<4||box.y+th>hh-4||overlaps(box))continue;
    found={cx,cy,box};break;
   }
  }
  if(found){reserve(found.box);placed++;parts.push('<text x="'+found.cx+'" y="'+found.cy+'" font-size="'+font+'" font-family="Arial,sans-serif" fill="#1477d2" text-anchor="middle">'+label+'</text>')}
  else unplaced++;
  if(i%50===49&&!(await update(i+1,'Placing labels')))return;
 }
 if(!(await update(limit,'Placing labels')))return;
 parts.push('</svg>');
 numberedMarkup=parts.join('');
 const view=$('vectorView');view.innerHTML=numberedMarkup;view.style.display='block';output.style.display='none';
 $('numberedDownload').disabled=false;$('cancelNumber').disabled=true;$('numberSegments').disabled=false;
 $('segmentInfo').textContent='Detected '+total+' candidates; numbered dots '+limit+'; labels placed '+placed+'; labels omitted '+unplaced+'; deliberately not numbered '+(total-limit)+'. Clean vector centerlines are experimental.';
 setStatus('Numbering completed: '+limit+' dots, '+placed+' labels placed, '+unplaced+' label placement failures.',unplaced>0);
}
$('numberSegments').onclick=numberLineSegments;
$('numberedDownload').onclick=()=>{if(!numberedMarkup)return;const url=URL.createObjectURL(new Blob([numberedMarkup],{type:'image/svg+xml'})),a=document.createElement('a');a.href=url;a.download='loftsims-v0.3.18-redo-numbered.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};

const svgEsc=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
// Fidelity-first SVG: embed the exact displayed PNG pixels; no vector simplification.
trace.onclick=async()=>{
 const width=output.width,height=output.height;
 if(!width||!height){setStatus('Generate an outline or single-line image first.',true);return}
 const ctx=output.getContext('2d'),original=ctx.getImageData(0,0,width,height);
 const png=output.toDataURL('image/png');
 svgMarkup='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'"><image x="0" y="0" width="'+width+'" height="'+height+'" href="'+png+'" xlink:href="'+png+'" image-rendering="pixelated"/></svg>';
 const blob=new Blob([svgMarkup],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),img=new Image();
 try{
  const loadedImage=await new Promise((resolve,reject)=>{img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('SVG render failed'));img.src=url});
  const check=document.createElement('canvas');check.width=width;check.height=height;
  const c=check.getContext('2d',{willReadFrequently:true});c.drawImage(loadedImage,0,0,width,height);
  const actual=c.getImageData(0,0,width,height).data,expected=original.data;
  let changed=0;for(let i=0;i<expected.length;i+=4)if(expected[i]!==actual[i]||expected[i+1]!==actual[i+1]||expected[i+2]!==actual[i+2]||expected[i+3]!==actual[i+3])changed++;
  $('svgDownload').disabled=changed!==0;$('segment').disabled=changed!==0;$('countSegments').disabled=changed!==0;$('numberSegments').disabled=true;segmentInventory=null;$('inventory').textContent='';
  const view=$('vectorView');view.innerHTML=svgMarkup;view.style.display='block';
  output.style.display='none';
  setStatus(changed===0?'SVG fidelity PASS: '+width+'×'+height+' pixels, zero mismatches. SVG download enabled.':'SVG fidelity FAIL: '+changed+' mismatched pixels. SVG download disabled.',changed!==0);
 }catch(err){$('svgDownload').disabled=true;setStatus('SVG verification failed: '+err.message,true)}
 finally{URL.revokeObjectURL(url)}
};
$('svgDownload').onclick=()=>{if(!svgMarkup)return;const blob=new Blob([svgMarkup],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='loftsims-v0.3.5-redo-lossless.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
function boxBlur(src,w,h){const dst=new Float32Array(src.length);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let s=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h){s+=src[yy*w+xx];n++}}dst[y*w+x]=s/n}return dst}
download.onclick=()=>{const a=document.createElement('a');a.download='loftsims-v0.3.6-redo-outline.png';a.href=output.toDataURL('image/png');a.click()};
function setStatus(msg,error=false){status.textContent=msg;status.className='status'+(error?' error':'')}