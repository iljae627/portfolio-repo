export function archiveFallback(source) {
  if (source === '네이버 블로그') return {src: '/images/logos/naver-blog.png', type: 'naver'};
  if (source === 'GitHub') return {src: '/images/logos/github.svg', type: 'github'};
  return {src: '/images/logos/journal.svg', type: 'journal'};
}
