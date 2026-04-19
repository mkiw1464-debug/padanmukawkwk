const axios = require('axios');

exports.handler = async (event, context) => {
    const token = event.queryStringParameters.token;

    if (!token) {
        return { statusCode: 400, body: JSON.stringify({ error: "Token diperlukan" }) };
    }

    try {
        const response = await axios.get("https://100067.connect.garena.com/game/account_security/bind:get_bind_info", {
            params: { app_id: "100067", access_token: token },
            headers: {
                'User-Agent': "GarenaMSDK/4.0.19P9(Redmi Note 5 ;Android 9;en;US;)",
            }
        });

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response.data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
// Dalam catch block get_bind.js
catch (error) {
    return {
        statusCode: 500,
        body: JSON.stringify({ 
            error: "error_token",
            debug: error.response ? error.response.data : "No response data" 
        })
    };
}

