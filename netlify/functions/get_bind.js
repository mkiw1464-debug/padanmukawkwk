const axios = require('axios');

exports.handler = async (event, context) => {
    // Ambil token dari URL parameter (?token=...)
    const token = event.queryStringParameters.token;

    if (!token) {
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Token diperlukan" })
        };
    }

    try {
        // Logik asal untuk request ke Garena
        const response = await axios.get("https://100067.connect.garena.com/game/account_security/bind:get_bind_info", {
            params: { 
                app_id: "100067", 
                access_token: token 
            },
            headers: {
                'User-Agent': "GarenaMSDK/4.0.19P9(Redmi Note 5 ;Android 9;en;US;)",
                'Connection': "Keep-Alive"
            },
            timeout: 30000 // 30 saat
        });

        // Jika berjaya
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response.data)
        };

    } catch (error) {
        // Blok catch yang betul
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                status: "error",
                message: error.message,
                // Paparkan respon dari Garena jika ada untuk senang debug
                details: error.response ? error.response.data : "Tiada respon dari server"
            })
        };
    }
};
