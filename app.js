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
function renderEdges(){svgMarkup='';$('vectorView').style.display='none';$('svgDownload').disabled=true;output.width=W;output.height=H;const o=output.getContext('2d'),im=o.createImageData(W,H);im.data.fill(255);const thick=+$('thickness').value;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(edge[y*W+x])for(let dy=-thick+1;dy<thick;dy++)for(let dx=-thick+1;dx<thick;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<W&&yy>=0&&yy<H){const q=(yy*W+xx)*4;im.data[q]=im.data[q+1]=im.data[q+2]=0;im.data[q+3]=255}}o.putImageData(im,0,0);output.style.display='block';$('outputEmpty').style.display='none'}
single.onclick=()=>buildContinuousPath();
function buildContinuousPath(){svgMarkup='';$('vectorView').style.display='none';$('svgDownload').disabled=true;output.style.display='block';if(!edge)return;setStatus('Building continuous pen path…');const pts=[];for(let y=0;y<H;y+=2)for(let x=0;x<W;x+=2)if(edge[y*W+x])pts.push({x,y});if(!pts.length){setStatus('No outline points found.',true);return}
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
  $('svgDownload').disabled=changed!==0;
  const view=$('vectorView');view.innerHTML=svgMarkup;view.style.display='block';
  output.style.display='none';
  setStatus(changed===0?'SVG fidelity PASS: '+width+'×'+height+' pixels, zero mismatches. SVG download enabled.':'SVG fidelity FAIL: '+changed+' mismatched pixels. SVG download disabled.',changed!==0);
 }catch(err){$('svgDownload').disabled=true;setStatus('SVG verification failed: '+err.message,true)}
 finally{URL.revokeObjectURL(url)}
};
$('svgDownload').onclick=()=>{if(!svgMarkup)return;const blob=new Blob([svgMarkup],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='loftsims-v0.3.4-redo-lossless.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
function boxBlur(src,w,h){const dst=new Float32Array(src.length);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let s=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h){s+=src[yy*w+xx];n++}}dst[y*w+x]=s/n}return dst}
download.onclick=()=>{const a=document.createElement('a');a.download='loftsims-v0.3.4-redo-outline.png';a.href=output.toDataURL('image/png');a.click()};
function setStatus(msg,error=false){status.textContent=msg;status.className='status'+(error?' error':'')}