import * as hmUI from '@zos/ui'
import {getDeviceInfo} from '@zos/device'
import auth from '../utils/auth.js'
import {px} from '@zos/utils'
import {back} from '@zos/router'
import { setPageBrightTime } from '@zos/display'

const {width: DEVICE_WIDTH, height: DEVICE_HEIGHT} = getDeviceInfo()

let acc
let textWidgetOTP
let textWidgetTime
let textWidgetOTPNext
let validUntil = -1
let otp = ""
let otp_n = ""


Page({


    onInit(params) {

        hmUI.setStatusBarVisible(false)
        setPageBrightTime({brightTime: -1,}) //changed back on page destroy


        acc = JSON.parse(params)
        //console.log(acc.account, acc.secret,acc.issuer, acc.period, acc.algorithm, acc.digits, acc.uri)

        var authObj = new auth(acc.account, acc.secret, acc.issuer, parseInt(acc.period), acc.algorithm)

        if (!('secret' in acc)) {
            back()
            return;
        }

        let textWidgetCode = hmUI.createWidget(hmUI.widget.TEXT, {
            text: String(acc.account),
            color: 0xffffff,
            text_size: px(48),
            x: px(0),
            y: px(-90),
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
            y: px(-20),
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
            y: px(50),
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

        validUntil = Math.round(new Date().getTime()/1000)

        setInterval(() => {
            let currTime = Math.round(new Date().getTime()/1000)
            let timeRemaining = validUntil - currTime
            if (timeRemaining <= 0 ) { //be on the save side, calc it two times
                console.log("calc. TOTP")

                if(otp_n === ""){
                    let otp_curr = authObj.getOtp(0)
                    let otp_next = authObj.getOtp(1)
                    let time = authObj.getRemininingTime()

                    otp = authObj.addSpaces(otp_curr.substring(otp_curr.length - parseInt(acc.digits)));
                    otp_n = authObj.addSpaces(otp_next.substring(otp_next.length - parseInt(acc.digits)));

                    validUntil = currTime + time
                    timeRemaining = validUntil - currTime
                }else{
                    otp = otp_n
                    let otp_next = authObj.getOtp(1)
                    let time = authObj.getRemininingTime()

                    otp_n = authObj.addSpaces(otp_next.substring(otp_next.length - parseInt(acc.digits)));

                    validUntil = currTime + time
                    timeRemaining = validUntil - currTime
                }

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
            textWidgetOTPNext.setProperty(hmUI.prop.text, {text_size: px(txtsize),y : px((DEVICE_HEIGHT/2) + 110 - (txtsize*5))})

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