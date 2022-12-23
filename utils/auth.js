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

        //strip padding? better method?
        base32 = base32.replaceAll('=', '')

        for (var i = 0; i < base32.length; i++) {
            var val = base32chars.indexOf(base32.charAt(i).toUpperCase());
            bits += leftpad(val.toString(2), 5, '0');
        }

        for (var i = 0; i + 4 <= bits.length; i += 4) {
            var chunk = bits.substr(i, 4);
            hex = hex + parseInt(chunk, 2).toString(16);
        }
        //TODO do this for other length also? This is needed when the last char is a Q = 10000 which yields one hex char too much
        if(hex.length == 65 && hex[64] == '0')
            hex = hex.slice(0,-1)
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

        var otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec('7fffffff')) + '';
        otp = (otp).substr(otp.length - 6, 6);
        time = 1 - (epoch / period) + Math.floor(epoch / period)
        time = Math.round(time * period)
        return {otp: String(otp), time: time};
    }
}