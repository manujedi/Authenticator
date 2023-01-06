import * as hmUI from '@zos/ui'
import {getDeviceInfo} from '@zos/device'
import auth from '../utils/auth.js'
import {px} from '@zos/utils'
import {back} from '@zos/router'

const {width: DEVICE_WIDTH, height: DEVICE_HEIGHT} = getDeviceInfo()

let acc
let textWidgetOTP
let textWidgetTime
let textWidgetOTPText = ""
let timeRemaining = 0

Page({

    onInit(params) {

        acc = JSON.parse(params)
        //console.log(acc.account, acc.secret,acc.issuer, acc.period, acc.algorithm, acc.digits, acc.uri)

        if (!('secret' in acc)) {
            back()
            return;
        }

        let textWidgetCode = hmUI.createWidget(hmUI.widget.TEXT, {
            text: 'Code',
            color: 0xffffff,
            text_size: px(48),
            x: px(0),
            y: px(-70),
            w: px(DEVICE_WIDTH),
            h: px(DEVICE_HEIGHT),
            align_h: hmUI.align.CENTER_H,
            align_v: hmUI.align.CENTER_V,
            text_style: hmUI.text_style.NONE,
        })

        textWidgetOTP = hmUI.createWidget(hmUI.widget.TEXT, {
            text: 'loading...',
            color: 0xffffff,
            text_size: px(64),
            x: px(0),
            y: px(0),
            w: px(DEVICE_WIDTH),
            h: px(DEVICE_HEIGHT),
            align_h: hmUI.align.CENTER_H,
            align_v: hmUI.align.CENTER_V,
            text_style: hmUI.text_style.none,
        })

        textWidgetTime = hmUI.createWidget(hmUI.widget.TEXT, {
            text: '',
            color: 0xffffff,
            text_size: px(48),
            x: px(0),
            y: px(70),
            w: px(DEVICE_WIDTH),
            h: px(DEVICE_HEIGHT),
            align_h: hmUI.align.CENTER_H,
            align_v: hmUI.align.CENTER_V,
            text_style: hmUI.text_style.NONE,
        })

        //do it for all
        textWidgetOTP.addEventListener(hmUI.event.CLICK_DOWN, function (info) {
            back()
        })
        textWidgetCode.addEventListener(hmUI.event.CLICK_DOWN, function (info) {
            back()
        })
        textWidgetTime.addEventListener(hmUI.event.CLICK_DOWN, function (info) {
            back()
        })

        setInterval(() => {
            if (timeRemaining < 2) { //be on the save side, calc it two times
                console.log("calc. TOTP")
                var authObj = new auth(acc.account, acc.secret, acc.issuer, parseInt(acc.period), acc.algorithm)
                let {otp, time} = authObj.getOtp()
                otp = otp.substring(otp.length - parseInt(acc.digits));
                timeRemaining = time
                textWidgetOTPText = otp
                textWidgetOTP.setProperty(hmUI.prop.text, {
                    text: textWidgetOTPText,
                })
            }
            if (timeRemaining < 10)
                textWidgetTime.setProperty(hmUI.prop.text, {color: 0xFF0000, text: String(timeRemaining) + "s",})
            else if (timeRemaining < 20)
                textWidgetTime.setProperty(hmUI.prop.text, {color: 0xFFFF00, text: String(timeRemaining) + "s",})
            else
                textWidgetTime.setProperty(hmUI.prop.text, {color: 0x00FF00, text: String(timeRemaining) + "s",})
            timeRemaining -= 1
            console.log("refreshed TOTP")
        }, 1000)
    },

    onReady() {
        console.log('ready')
    },


    onShow() {
        console.log('show')
    },

    onHide() {
        console.log('hide')
    },

    onDestroy() {
        console.log('destroy')
    },

})