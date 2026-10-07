const $=id=>document.getElementById(id);
const file=$('file'),source=$('source'),output=$('output'),extract=$('extract'),download=$('download'),status=$('status');
let loaded=false;
for(const id of ['threshold','blur','thickness']) $(id).addEventListener('input',e=>$(id+'Value').value=e.target.value);
file.addEventListener('change',()=>{
 const f=file.files[0]; if(!f)return;
 if(!/^image\/(png|jpeg|webp)$/.test(f.type)){setStatus('Unsupported image type.',true);return}
 const img=new Image(); img.onload=()=>{
  const max=1600,scale=Math.min(1,max/Math.max(img.width,img.height));
  source.width=Math.round(img.width*scale);source.height=Math.round(img.height*scale);
  source.getContext('2d').drawImage(img,0,0,source.width,source.height);
  source.style.display='block';$('sourceEmpty').style.display='none';loaded=true;extract.disabled=false;download.disabled=true;
  setStatus('Picture loaded. Select Extract outlines.');
  URL.revokeObjectURL(img.src);
 };img.src=URL.createObjectURL(f);
});
extract.addEventListener('click',()=>{if(!loaded)return;extractOutline();});
function extractOutline(){
 setStatus('Extracting outlines…');
 const w=source.width,h=source.height,ctx=source.getContext('2d'),px=ctx.getImageData(0,0,w,h).data;
 let gray=new Float32Array(w*h);
 for(let i=0,p=0;i<px.length;i+=4,p++)gray[p]=.299*px[i]+.587*px[i+1]+.114*px[i+2];
 const passes=+$('blur').value;
 for(let k=0;k<passes;k++)gray=boxBlur(gray,w,h);
 const edge=new Float32Array(w*h),thr=+$('threshold').value;
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
  const i=y*w+x;
  const gx=-gray[i-w-1]+gray[i-w+1]-2*gray[i-1]+2*gray[i+1]-gray[i+w-1]+gray[i+w+1];
  const gy=-gray[i-w-1]-2*gray[i-w]-gray[i-w+1]+gray[i+w-1]+2*gray[i+w]+gray[i+w+1];
  edge[i]=Math.hypot(gx,gy)>=thr?1:0;
 }
 output.width=w;output.height=h;const o=output.getContext('2d'),im=o.createImageData(w,h);
 im.data.fill(255); const thick=+$('thickness').value;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(edge[y*w+x]){
  for(let dy=-thick+1;dy<thick;dy++)for(let dx=-thick+1;dx<thick;dx++){
   const xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h){const q=(yy*w+xx)*4;im.data[q]=im.data[q+1]=im.data[q+2]=0;im.data[q+3]=255}
  }
 }
 o.putImageData(im,0,0);output.style.display='block';$('outputEmpty').style.display='none';download.disabled=false;setStatus('Outline extraction complete.');
}
function boxBlur(src,w,h){const dst=new Float32Array(src.length);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let s=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){let xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h){s+=src[yy*w+xx];n++}}dst[y*w+x]=s/n}return dst}
download.addEventListener('click',()=>{const a=document.createElement('a');a.download='loftsims-outline.png';a.href=output.toDataURL('image/png');a.click()});
function setStatus(msg,error=false){status.textContent=msg;status.className='status'+(error?' error':'')}