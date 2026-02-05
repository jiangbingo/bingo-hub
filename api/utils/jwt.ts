/**
 * JWT 工具函数
 * 用于生成 BigModel API 的 JWT Token
 */

/**
 * 生成 BigModel API JWT Token
 *
 * BigModel API 使用 JWT 进行身份验证，API Key 格式为 {id}.{secret}
 *
 * @param apiKey - BigModel API Key (格式: id.secret)
 * @returns JWT Token 字符串
 * @throws 如果 API Key 格式无效或生成失败
 */
export async function generateJWT(apiKey: string): Promise<string> {
  try {
    const [id, secret] = apiKey.split('.');

    if (!id || !secret) {
      throw new Error('Invalid API key format');
    }

    // 创建 payload
    const now = Date.now();
    const payload = {
      api_key: id,
      exp: now + 3600000, // 1小时过期
      timestamp: now,
    };

    // 使用 Web Crypto API 生成签名
    const header = { alg: 'HS256', sign_type: 'SIGN' };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));

    const data = `${encodedHeader}.${encodedPayload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(data)
    );

    const encodedSignature = base64UrlEncode(
      Array.from(new Uint8Array(signature)).map(c => String.fromCharCode(c)).join('')
    );

    return `${data}.${encodedSignature}`;
  } catch (error) {
    console.error('JWT generation error:', error);
    throw new Error('Failed to generate JWT token');
  }
}

/**
 * Base64 URL 编码
 * 将字符串转换为 Base64 URL 安全格式
 *
 * @param str - 要编码的字符串
 * @returns Base64 URL 编码后的字符串
 */
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
