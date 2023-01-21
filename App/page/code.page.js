import * as hmUI from '@zos/ui'
import {getDeviceInfo} from '@zos/device'
import auth from '../utils/auth.js'
import {px} from '@zos/utils'
import {back} from '@zos/router'

const {width: DEVICE_WIDTH, height: DEVICE_HEIGHT} = getDeviceInfo()

let acc
let textWidgetOTP
let textWidgetTime
let textWidgetOTPNext
let timeRemaining = -1

Page({

    onInit(params) {

        acc = JSON.parse(params)
        //console.log(acc.account, acc.secret,acc.issuer, acc.period, acc.algorithm, acc.digits, acc.uri)

        var authObj = new auth(acc.account, acc.secret, acc.issuer, parseInt(acc.period), acc.algorithm)

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

        textWidgetOTPNext = hmUI.createWidget(hmUI.widget.TEXT, {
            text: '',
            color: 0xffffff,
            text_size: px(32),
            x: px(0),
            y: px(130),
            w: px(DEVICE_WIDTH),
            h: px(DEVICE_HEIGHT),
            align_h: hmUI.align.CENTER_H,
            align_v: hmUI.align.CENTER_V,
            text_style: hmUI.text_style.none,
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
        textWidgetOTPNext.addEventListener(hmUI.event.CLICK_DOWN, function (info) {
            back()
        })

        setInterval(() => {
            if (timeRemaining < 0) { //be on the save side, calc it two times
                console.log("calc. TOTP")
                let {otp_curr, otp_next, time} = authObj.getOtp()
                console.log(otp_curr,otp_next)
                let otp = otp_curr.substring(otp_curr.length - parseInt(acc.digits));
                let otp_n = otp_next.substring(otp_next.length - parseInt(acc.digits));
                timeRemaining = time
                textWidgetOTP.setProperty(hmUI.prop.text, {
                    text: otp,
                })
                textWidgetOTPNext.setProperty(hmUI.prop.text, {
                    text: otp_n,
                    text_size: px(0),
                })
            }
            if (timeRemaining < 10)
                textWidgetTime.setProperty(hmUI.prop.text, {color: 0xFF0000, text: String(timeRemaining) + "s",})
            else if (timeRemaining < 20)
                textWidgetTime.setProperty(hmUI.prop.text, {color: 0xFFFF00, text: String(timeRemaining) + "s",})
            else
                textWidgetTime.setProperty(hmUI.prop.text, {color: 0x00FF00, text: String(timeRemaining) + "s",})

            let txtsize = 30 - timeRemaining < 0 ? 0 : 48-timeRemaining
            textWidgetOTPNext.setProperty(hmUI.prop.text, {text_size: px(txtsize),})
            timeRemaining -= 1
            console.log("refreshed TOTP")

            //refresh time, this can happen if the screen goes dark
            let realTime = authObj.getRemininingTime();
            timeRemaining = timeRemaining > realTime ? realTime : timeRemaining;

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