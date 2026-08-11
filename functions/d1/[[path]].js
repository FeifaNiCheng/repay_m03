// Pages Function：代理 D1 REST API 请求，生产环境用
// 开发环境由 Vite proxy 处理，不走这里
export async function onRequestPost ({ request, env }) {
  const url = new URL(request.url)
  // /d1/accounts/xxx/... -> /client/v4/accounts/xxx/...
  const targetUrl = 'https://api.cloudflare.com/client/v4' + url.pathname.replace(/^\/d1/, '') + url.search

  const body = await request.text()
  const resp = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.VITE_D1_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body
  })

  const data = await resp.text()
  return new Response(data, {
    status: resp.status,
    headers: { 'Content-Type': 'application/json' }
  })
}
