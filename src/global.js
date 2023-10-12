function getCookieValue(cookieName) {
    let cookieArray = document.cookie.split(';');
    for (let cookie of cookieArray) {
      let [name, value] = cookie.trim().split('=');
      if (name === cookieName) {
        return value;
      }
    }
    return '';
 }

async function sha256(text) {
     if (text) {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);

      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

      return hashHex;
    }
      return null;
}