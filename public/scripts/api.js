class ContactAPI {
    constructor(idToken, providerTag) {
        this.idToken = idToken
        this.providerTag = providerTag
        this.baseUrl = window.location.origin + '/api' + '/contact'
    }

    async create(contactData) {
        try {
            const { name, timezone } = contactData

            const url = this.baseUrl
    
            const requestOptions = {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.idToken,
                    'OpenID-Provider': this.providerTag
                },
                body: JSON.stringify({
                    name,
                    timezone
                })
            }
    
            const response = await fetch(url, requestOptions)
            return response.json()
    
        } catch (error) {
            console.log('Error creating new contact: %o', error)
        }
    }
}