import * as hmUI from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import auth from '../../../utils/auth.js'
import { px } from '@zos/utils'
import {back} from '@zos/router'

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo()

let acc
let textWidget
let textWidgetText = ""
let timeRemaining = 0

Page({

  onInit(params) {

    acc = JSON.parse(params)
    console.log(acc.account, acc.secret,acc.issuer, acc.period, acc.algorithm, acc.digits, acc.uri)


    textWidget = hmUI.createWidget(hmUI.widget.TEXT, {
    text: 'loading...',
    color: 0xffffff,
    text_size: px(36),
    x: px(0),
    y: px(0),
    w: px(DEVICE_WIDTH),
    h: px(DEVICE_HEIGHT),
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
    })

    textWidget.addEventListener(hmUI.event.CLICK_DOWN, function (info) {
      back()
    })

    setInterval(() => {
      if(timeRemaining < 2) { //be on the save side, calc it two times
        console.log("calc. TOTP")
        var authObj = new auth(acc.account, acc.secret, acc.issuer, parseInt(acc.period), acc.algorithm)
        let {otp, time} = authObj.getOtp()
        otp = otp.substring(otp.length - parseInt(acc.digits));
        timeRemaining = time
        textWidgetText = otp
      }
      textWidget.setProperty(hmUI.prop.text, {
        text: textWidgetText + "\n" + String(timeRemaining) + "s",
      })
      timeRemaining -= 1
      console.log("refreshed TOTP")
    }, 1000)
  },

  onReady() {
    console.log('ready')
  },

  onShow() {console.log('show')},

  onHide() {console.log('hide')},

  onDestroy() {console.log('destroy')},

})