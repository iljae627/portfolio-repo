import * as T from 'three';

// Procedural studio surfaces; no downloaded photograph or reference screenshot.
export function brushedMetal(color) {
  let map = null;
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    for (let y=0; y<512; y++) {
      const value = 182 + Math.round(Math.sin(y*8.23)*8 + Math.sin(y*.73)*4);
      ctx.fillStyle=`rgb(${value} ${value} ${value})`; ctx.fillRect(0,y,512,1);
    }
    map=new T.CanvasTexture(canvas); map.wrapS=map.wrapT=T.RepeatWrapping; map.repeat.set(1,2);
  }
  return new T.MeshPhysicalMaterial({color,metalness:1,roughness:.24,roughnessMap:map,
    clearcoat:.35,clearcoatRoughness:.16,anisotropy:.7,anisotropyRotation:Math.PI/2});
}

export function phoneDisplay() {
  if (typeof document === 'undefined') return null;
  const c=document.createElement('canvas'); c.width=768;c.height=1536;
  const x=c.getContext('2d');
  x.fillStyle='#eef4ef';x.beginPath();x.roundRect(0,0,768,1536,70);x.fill();
  const glow=x.createRadialGradient(650,540,0,650,540,900);glow.addColorStop(0,'#b4d8c1');glow.addColorStop(1,'#eef4ef');
  x.fillStyle=glow;x.fillRect(0,100,768,1330);
  x.fillStyle='#263c36';x.font='500 38px sans-serif';x.textAlign='left';x.fillText('09:41',58,82);
  for(let i=0;i<4;i++)x.fillRect(590+i*17,61-i*5,10,12+i*5);
  x.font='500 102px sans-serif';x.textAlign='center';x.fillText('Android',384,390);
  x.font='28px sans-serif';x.fillStyle='#537366';x.fillText('explore the boundaries',384,446);
  for(let i=0;i<3;i++) {
    x.fillStyle='rgba(255,255,255,.80)';x.beginPath();x.roundRect(78,610+i*180,612,142,34);x.fill();
    x.fillStyle=['#679c85','#518875','#7faaa1'][i];x.beginPath();x.roundRect(108,645+i*180,70,70,20);x.fill();
    x.fillStyle='#37564b';x.font='500 30px sans-serif';x.textAlign='left';x.fillText(['Components','Storage','Runtime'][i],208,677+i*180);
    x.fillStyle='#9bb4a8';x.fillRect(210,699+i*180,300-i*36,8);
  }
  x.fillStyle='#3b564b';x.beginPath();x.roundRect(268,1478,232,10,5);x.fill();
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;return texture;
}

export function marbleSurface() {
  const c=document.createElement('canvas');c.width=c.height=1024;
  const x=c.getContext('2d');x.fillStyle='#e8e1d5';x.fillRect(0,0,1024,1024);
  let seed=87;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<45000;i++) {const v=random();x.fillStyle=v>.5?'rgba(255,255,255,.12)':'rgba(108,94,72,.04)';x.fillRect(random()*1024,random()*1024,1+random()*3,1);}
  for(let i=0;i<13;i++) {
    const y=random()*1300-150;x.beginPath();x.moveTo(-100,y);
    x.bezierCurveTo(250,y-60+random()*140,560,y+180+random()*90,1124,y+70);
    x.strokeStyle=`rgba(129,115,94,${.025+random()*.035})`;x.lineWidth=.6+random()*2.1;x.stroke();
  }
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(8,8);return texture;
}

export function foliageShadow() {
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');
  x.filter='blur(9px)';x.strokeStyle='rgba(61,54,42,.17)';x.fillStyle='rgba(61,54,42,.15)';x.lineWidth=5;
  for(let b=0;b<4;b++) {
    x.beginPath();x.moveTo(550,500-b*65);x.quadraticCurveTo(280,280,180+b*65,-20);x.stroke();
    for(let i=0;i<9;i++){const px=210+b*55+i*17,py=i*54;x.beginPath();x.ellipse(px+(i%2?26:-30),py,19,47,(i%2?-.8:.8),0,Math.PI*2);x.fill();}
  }
  x.filter='none';x.globalCompositeOperation='destination-in';
  const fade=x.createRadialGradient(256,256,100,256,256,252);fade.addColorStop(0,'white');fade.addColorStop(1,'transparent');x.fillStyle=fade;x.fillRect(0,0,512,512);
  return new T.CanvasTexture(c);
}

export function batteryMark(){
  if(typeof document==='undefined')return null;
  const c=document.createElement('canvas');c.width=384;c.height=576;const x=c.getContext('2d');
  x.fillStyle='#b2bab7';x.font='500 42px sans-serif';x.fillText('Li-ion',24,76);
  x.lineWidth=3;x.strokeStyle='#a5aeaa';x.strokeRect(25,123,126,69);x.fillRect(151,143,8,28);
  x.font='22px sans-serif';x.fillText('RECHARGEABLE',24,235);
  for(let i=0;i<6;i++)x.fillRect(25,265+i*18,250-(i%3)*25,3);
  x.font='55px sans-serif';x.fillText('↺',24,470);
  x.font='17px sans-serif';x.fillText('RECYCLE',24,514);
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;return texture;
}
