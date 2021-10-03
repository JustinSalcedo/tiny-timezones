const qs = window.Qs

const payloadEncoded = qs.parse(window.location.search, { ignoreQueryPrefix: true }).payload

window.addEventListener("load", () => {
    sessionStorage.setItem('payload', payloadEncoded)
    
    const baseUrl = window.location.origin
    window.location.href = baseUrl + '/app'
})