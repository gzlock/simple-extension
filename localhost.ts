import { serve } from "https://deno.land/std@0.180.0/http/server.ts" // 确保使用适合你 Deno 版本的 std 库

console.info("HTTP server running on http://localhost:80/")

serve(
  async (req: Request) => {
    // 创建响应头
    const headers = new Headers()
    // 设置 Cookie
    headers.set("Set-Cookie", "A=1; Path=/") // Path=/ 确保 cookie 在整个站点可用
    headers.set("Content-Type", "text/html; charset=utf-8") // 设置内容类型为 HTML

    // 返回一个带有 Cookie 和空白内容的响应
    return new Response("", {
      // 空字符串作为响应体，即空白页面
      status: 200,
      headers: headers,
    })
  },
  { port: 80 },
) // 指定监听端口为 80