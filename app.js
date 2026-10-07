const $=id=>document.getElementById(id);
const file=$('file'),source=$('source'),output=$('output'),extract=$('extract'),single=$('single'),trace=$('trace'),download=$('download'),status=$('status');
let loaded=false,edge=null,W=0,H=0,pathPoints=null;
for(const id of ['threshold','blur','thickness']) $(id).addEventListener('input',e=>$(id+'Value').value=e.target.value);
file.addEventListener('change',()=>{const f=file.files[0];if(!f)return;if(!/^image\/(png|jpeg|webp)$/.test(f.type)){setStatus('Unsupported image type.',true);return}
 const img=new Image();img.onload=()=>{const max=1600,s=Math.min(1,max/Math.max(img.width,img.height));W=source.width=Math.round(img.width*s);H=source.height=Math.round(img.height*s);source.getContext('2d').drawImage(img,0,0,W,H);source.style.display='block';$('sourceEmpty').style.display='none';loaded=true;extract.disabled=false;single.disabled=true;trace.disabled=true;download.disabled=true;setStatus('Picture loaded. Select Extract outlines.');URL.revokeObjectURL(img.src)};img.src=URL.createObjectURL(f)});
extract.onclick=()=>{if(loaded)extractOutline()};
function extractOutline(){setStatus('Extracting outlines…');const px=source.getContext('2d').getImageData(0,0,W,H).data;let gray=new Float32Array(W*H);
 for(let i=0,p=0;i<px.length;i+=4,p++)gray[p]=.299*px[i]+.587*px[i+1]+.114*px[i+2];for(let k=0;k<+$('blur').value;k++)gray=boxBlur(gray,W,H);
 edge=new Uint8Array(W*H);const t=+$('threshold').value;for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x,gx=-gray[i-W-1]+gray[i-W+1]-2*gray[i-1]+2*gray[i+1]-gray[i+W-1]+gray[i+W+1],gy=-gray[i-W-1]-2*gray[i-W]-gray[i-W+1]+gray[i+W-1]+2*gray[i+W]+gray[i+W+1];edge[i]=Math.hypot(gx,gy)>=t?1:0}renderEdges();pathPoints=null;single.disabled=false;trace.disabled=true;download.disabled=false;setStatus('Outline extraction complete. You can now build one continuous pen path.')}
function renderEdges(){output.width=W;output.height=H;const o=output.getContext('2d'),im=o.createImageData(W,H);im.data.fill(255);const thick=+$('thickness').value;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(edge[y*W+x])for(let dy=-thick+1;dy<thick;dy++)for(let dx=-thick+1;dx<thick;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<W&&yy>=0&&yy<H){const q=(yy*W+xx)*4;im.data[q]=im.data[q+1]=im.data[q+2]=0;im.data[q+3]=255}}o.putImageData(im,0,0);output.style.display='block';$('outputEmpty').style.display='none'}
single.onclick=()=>buildContinuousPath();
function buildContinuousPath(){if(!edge)return;setStatus('Building continuous pen path…');const pts=[];for(let y=0;y<H;y+=2)for(let x=0;x<W;x+=2)if(edge[y*W+x])pts.push({x,y});if(!pts.length){setStatus('No outline points found.',true);return}
 const used=new Uint8Array(pts.length),path=[],cell=24,buckets=new Map(),key=(x,y)=>Math.floor(x/cell)+','+Math.floor(y/cell);
 pts.forEach((p,i)=>{const k=key(p.x,p.y);if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(i)});
 let cur=0;used[cur]=1;path.push(pts[cur]);for(let n=1;n<pts.length;n++){const p=pts[cur],cx=Math.floor(p.x/cell),cy=Math.floor(p.y/cell);let best=-1,bd=Infinity;
  for(let r=0;r<=Math.max(Math.ceil(W/cell),Math.ceil(H/cell))&&best<0;r++)for(let yy=cy-r;yy<=cy+r;yy++)for(let xx=cx-r;xx<=cx+r;xx++){if(r&&xx>cx-r&&xx<cx+r&&yy>cy-r&&yy<cy+r)continue;for(const i of buckets.get(xx+','+yy)||[])if(!used[i]){const q=pts[i],d=(q.x-p.x)**2+(q.y-p.y)**2;if(d<bd){bd=d;best=i}}}
  if(best<0)break;cur=best;used[cur]=1;path.push(pts[cur])}
 pathPoints=path;trace.disabled=false;const o=output.getContext('2d');o.fillStyle='white';o.fillRect(0,0,W,H);o.strokeStyle='black';o.lineWidth=Math.max(1,+$('thickness').value);o.lineCap='round';o.lineJoin='round';o.beginPath();o.moveTo(path[0].x,path[0].y);for(let i=1;i<path.length;i++)o.lineTo(path[i].x,path[i].y);o.stroke();
 o.fillStyle='black';o.beginPath();o.arc(path[0].x,path[0].y,4,0,Math.PI*2);o.fill();setStatus('Single continuous path generated: '+path.length+' sampled outline points, with connecting/retraced travel where required.');download.disabled=false}

// Segment detector: maximal straight runs in four principal pixel directions.
// Curved contours are approximated by successive short directional runs.
function detectSegments(){
 const dirs=[[1,0],[0,1],[1,1],[1,-1]],out=[],minLength=5;
 for(const [dx,dy] of dirs){
  const visited=new Uint8Array(edge.length);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
   const i=y*W+x;if(!edge[i]||visited[i])continue;
   const px=x-dx,py=y-dy;
   if(px>=0&&px<W&&py>=0&&py<H&&edge[py*W+px])continue;
   let xx=x,yy=y,len=0;
   while(xx>=0&&xx<W&&yy>=0&&yy<H&&edge[yy*W+xx]&&!visited[yy*W+xx]){
    visited[yy*W+xx]=1;len++;xx+=dx;yy+=dy;
   }
   if(len>=minLength)out.push({x:x+(len-1)*dx/2,y:y+(len-1)*dy/2,len,dx,dy});
  }
 }
 return out.sort((a,b)=>Math.floor(a.y/28)-Math.floor(b.y/28)||a.x-b.x);
}
trace.onclick=()=>{
 if(!edge)return;
 const segments=detectSegments(),scale=4,pad=120;
 output.width=W*scale+2*pad;output.height=H*scale+2*pad;
 const o=output.getContext('2d');o.fillStyle='white';o.fillRect(0,0,output.width,output.height);
 o.fillStyle='black';const width=Math.max(1,+$('thickness').value*scale);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(edge[y*W+x])o.fillRect(pad+x*scale,pad+y*scale,width,width);
 const occupied=new Set(),font=20,cell=34,cols=Math.ceil(output.width/cell),rows=Math.ceil(output.height/cell);
 o.font='bold '+font+'px Arial';o.textAlign='center';o.textBaseline='middle';
 let labeled=0;
 for(const seg of segments){
  const ax=pad+seg.x*scale,ay=pad+seg.y*scale;
  let found=null;
  for(let ring=2;ring<20&&!found;ring++){
   for(let k=0;k<16;k++){
    const angle=k*Math.PI/8,cx=Math.round(ax/cell+ring*Math.cos(angle)),cy=Math.round(ay/cell+ring*Math.sin(angle));
    if(cx<1||cy<1||cx>=cols-1||cy>=rows-1)continue;
    const key=cy*cols+cx;
    if(occupied.has(key))continue;
    const lx=cx*cell,ly=cy*cell;
    const ix=Math.max(0,Math.min(W-1,Math.round((lx-pad)/scale))),iy=Math.max(0,Math.min(H-1,Math.round((ly-pad)/scale)));
    if(edge[iy*W+ix])continue;
    found={lx,ly,key};break;
   }
  }
  if(!found)continue;
  occupied.add(found.key);labeled++;
  o.strokeStyle='#777';o.lineWidth=1;o.beginPath();o.moveTo(ax,ay);o.lineTo(found.lx,found.ly);o.stroke();
  const label=String(labeled),tw=Math.max(32,o.measureText(label).width+12);
  o.fillStyle='white';o.fillRect(found.lx-tw/2,found.ly-13,tw,26);
  o.fillStyle='black';o.fillText(label,found.lx,found.ly);
 }
 setStatus('Tracing sheet: '+labeled+' straight-run references at 4× resolution. Curves are represented by short directional segments; review before release.');
};
function boxBlur(src,w,h){const dst=new Float32Array(src.length);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let s=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h){s+=src[yy*w+xx];n++}}dst[y*w+x]=s/n}return dst}
download.onclick=()=>{const a=document.createElement('a');a.download='loftsims-v0.3.1-redo-tracing.png';a.href=output.toDataURL('image/png');a.click()};
function setStatus(msg,error=false){status.textContent=msg;status.className='status'+(error?' error':'')}