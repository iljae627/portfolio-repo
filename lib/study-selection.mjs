export function selectStudy({selected='',hovered='',near=false,manual=false,pinned=false,dismissed=false},fallback=''){
  if(dismissed)return '';
  if(manual)return selected||fallback;
  if(pinned)return selected;
  return hovered||(near?selected:'');
}

// Screen-space hit areas include the dotted box and the entire elbow connector.
export function nearStudy(point,{box,line=[],card},padding=24){
  if(!point)return false;
  const inside=rect=>rect&&point.x>=rect.x-padding&&point.x<=rect.x+rect.width+padding&&point.y>=rect.y-padding&&point.y<=rect.y+rect.height+padding;
  if(inside(box)||inside(card))return true;
  return line.slice(1).some((end,index)=>{
    const start=line[index],dx=end.x-start.x,dy=end.y-start.y,length=dx*dx+dy*dy;
    const t=length?Math.max(0,Math.min(1,((point.x-start.x)*dx+(point.y-start.y)*dy)/length)):0;
    return Math.hypot(point.x-start.x-t*dx,point.y-start.y-t*dy)<=padding;
  });
}
