const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function getCSRFToken(cookie) {
    return new Promise((resolve, reject) => {
        axios.request({
            url: "https://auth.roblox.com/v2/logout",
            method: "post",
            headers: {
                Cookie: ".ROBLOSECURITY=" + cookie
            }
        }).catch(function (error) {
            resolve(error.response.headers["x-csrf-token"])
        })
    })
}

function promptForCookie() {
    return new Promise((resolve) => {
        rl.question('Input your cookie: ', (cookie) => {
            rl.close();
            resolve(cookie);
        });
    });
}

async function fetchVerificationLink(cookie) {
    const url = 'https://apis.roblox.com/age-verification-service/v1/veriff-id-verification/start-verification';

    const headers = {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/json;charset=UTF-8',
        pragma: 'no-cache',
        'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Brave";v="114"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'sec-gpc': '1',
        'x-csrf-token': await getCSRFToken(cookie),
        cookie: ".ROBLOSECURITY=" + cookie
    };

    const body = {
        generateLink: true
    };

    try {
        const response = await axios.post(url, body, { headers, withCredentials: true });
        const verificationLink = response.data.verificationLink;
        return verificationLink;
    } catch (error) {
        console.error('Error occurred while fetching verification link:', error);
        return null;
    }
}

async function main() {
    try {
        const cookie = await promptForCookie();
        const verificationLink = await fetchVerificationLink(cookie);

        if (verificationLink) {
            console.log('Verification Link:', verificationLink);
        }
    } catch (error) {
        console.error('An error occurred (possibly because you tried verifying but failed, re-try in 7 days):', error);
    }
}

main();
