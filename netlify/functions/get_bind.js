const axios = require('axios');

const BASE_URL = "https://100067.connect.garena.com";
const HEADERS = {
    "User-Agent": "GarenaMSDK/4.0.39 (M2007J22C; Android 10; en; US;)",
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept-Encoding": "gzip"
};

exports.handler = async (event) => {
    const { action, token, email, otp, identity_token, verifier_token } = event.queryStringParameters;

    try {
        let response;
        const params = { app_id: "100067", access_token: token };

        switch (action) {
            case 'get_bind_info':
                response = await axios.get(`${BASE_URL}/game/account_security/bind:get_bind_info`, { params, headers: HEADERS });
                break;
            
            case 'send_otp':
                response = await axios.post(`${BASE_URL}/game/account_security/bind:send_otp`, 
                    `app_id=100067&access_token=${token}&email=${email}&locale=en_PK&region=PK`, { headers: HEADERS });
                break;

            case 'check_links':
                response = await axios.get(`${BASE_URL}/bind/app/platform/info/get`, { params: { access_token: token }, headers: HEADERS });
                break;

            case 'cancel_request':
                response = await axios.post(`${BASE_URL}/game/account_security/bind:cancel_request`, `app_id=100067&access_token=${token}`, { headers: HEADERS });
                break;

            default:
                return { statusCode: 400, body: JSON.stringify({ error: "Action tidak sah" }) };
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response.data)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message, details: error.response?.data })
        };
    }
};
