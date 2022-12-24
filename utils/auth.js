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

        for(let i = 0; i < base32.length; i+=8){

            //PADDING
            let pad = (base32.slice(i,i+8).match(/=/g) || []).length
            let bytesToUse
            if(pad == 6)
                bytesToUse = 1
            else if (pad == 4)
                bytesToUse = 2
            else if (pad == 3)
                bytesToUse = 3
            else if (pad == 1)
                bytesToUse = 4
            else if(pad == 0)
                bytesToUse = 5

            bits = "";

            for (let j = i; j < i + 8; j++) {
                let val = base32chars.indexOf(base32.charAt(j).toUpperCase());
                bits += leftpad(val.toString(2), 5, '0')
            }
            for (let j = 0; j < bytesToUse*8; j += 4) {
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


    this.getOtp = function () {

        var key = base32tohex(secret);
        var epoch = Math.round(new Date().getTime() / 1000.0);
        var time = leftpad(dec2hex(Math.floor(epoch / period)), 16, '0');

        // // updated for jsSHA v2.0.0 - http://caligatio.github.io/jsSHA/
        var shaObj = new jsSHA(sha, "HEX");
        shaObj.setHMACKey(key, "HEX");
        shaObj.update(time);
        var hmac = shaObj.getHMAC("HEX");
        if (hmac == 'KEY MUST BE IN BYTE INCREMENTS') {
        } else {
            var offset = hex2dec(hmac.substring(hmac.length - 1));
        }

        var otp = (hex2dec(hmac.substring(offset * 2, offset*2 + 8)) & hex2dec('7fffffff')) + '';
        time = 1 - (epoch / period) + Math.floor(epoch / period)
        time = Math.round(time * period)
        return {otp: String(otp), time: time};
    }
}