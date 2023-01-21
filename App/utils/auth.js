import jsSHA from "./sha.js"

export default function (account, secret, issuer, period, sha) {

    function dec2hex(s) {
        return (s < 15.5 ? '0' : '') + Math.round(s).toString(16);
    }
    function hex2dec(s) {
        return parseInt(s, 16);
    }
    function base32tohex(base32) {
        var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        var bits = "";
        var hex = "";

        for (let i = 0; i < base32.length; i += 8) {

            //PADDING
            let pad = (base32.slice(i, i + 8).match(/=/g) || []).length
            let bytesToUse
            if (pad == 6)
                bytesToUse = 1
            else if (pad == 4)
                bytesToUse = 2
            else if (pad == 3)
                bytesToUse = 3
            else if (pad == 1)
                bytesToUse = 4
            else if (pad == 0)
                bytesToUse = 5

            bits = "";

            for (let j = i; j < i + 8; j++) {
                let val = base32chars.indexOf(base32.charAt(j).toUpperCase());
                bits += leftpad(val.toString(2), 5, '0')
            }
            for (let j = 0; j < bytesToUse * 8; j += 4) {
                let chunk = bits.substring(j, j + 4);
                let hexval = "" + parseInt(chunk, 2).toString(16);
                hex += hexval
            }
        }
        return hex;
    }
    function leftpad(str, len, pad) {
        if (len + 1 >= str.length) {
            str = Array(len + 1 - str.length).join(pad) + str;
        }
        return str;
    }

    this.getRemininingTime = function (){
        let epoch = Math.round(new Date().getTime() / 1000.0);
        let time = 1 - (epoch / period) + Math.floor(epoch / period)
        time = Math.round(time * period)
        return time;
    }

    this.getOtp = function () {

        let key = base32tohex(secret);
        let epoch = Math.round(new Date().getTime() / 1000.0);
        let iteration = Math.floor(epoch / period)
        let time_curr = leftpad(dec2hex(iteration), 16, '0');
        let time_next = leftpad(dec2hex(iteration+1), 16, '0');

        // // updated for jsSHA v2.0.0 - http://caligatio.github.io/jsSHA/
        let shaObj_cur = new jsSHA(sha, "HEX");
        let shaObj_next = new jsSHA(sha, "HEX");
        shaObj_cur.setHMACKey(key, "HEX");
        shaObj_next.setHMACKey(key, "HEX");
        shaObj_cur.update(time_curr);
        shaObj_next.update(time_next);

        let offset = 0

        //current otp value
        let hmac = shaObj_cur.getHMAC("HEX");
        if (hmac == 'KEY MUST BE IN BYTE INCREMENTS') {
        } else {
            offset = hex2dec(hmac.substring(hmac.length - 1));
        }
        let otp_curr = (hex2dec(hmac.substring(offset * 2, offset * 2 + 8)) & hex2dec('7fffffff')) + '';

        //next otp value
        hmac = shaObj_next.getHMAC("HEX");
        if (hmac == 'KEY MUST BE IN BYTE INCREMENTS') {
        } else {
            offset = hex2dec(hmac.substring(hmac.length - 1));
        }
        let otp_next = (hex2dec(hmac.substring(offset * 2, offset * 2 + 8)) & hex2dec('7fffffff')) + '';

        let time = 1 - (epoch / period) + Math.floor(epoch / period)
        time = Math.round(time * period)
        return {otp_curr: String(otp_curr),otp_next: String(otp_next), time: time};
    }
}