export function selectStudy({selected='',hovered='',manual=false,pinned=false,dismissed=false},fallback=''){
  if(dismissed)return '';
  if(manual)return selected||fallback;
  if(pinned)return selected;
  return hovered||selected;
}
