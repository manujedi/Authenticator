import * as hmUI from '@zos/ui'
import { getText } from '@zos/i18n'
import {push} from '@zos/router'
import { getDeviceInfo } from '@zos/device'
import auth from '../../../utils/auth.js'
import { px } from '@zos/utils'
import { localStorage } from '@zos/storage'

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo()

const { messageBuilder } = getApp()._options.globalData
let scrollList
let otpList = []

Page({

  onMessage(){
    messageBuilder.on('call', ({ payload: buf }) => {
      console.log('am i actually called?')
    })
  },

  getAccounts(){

    console.log("Loading account list from storage")
    let storList = JSON.parse(localStorage.getItem('otpList', '[]') )
    while(otpList.length > 0) {
      otpList.pop();
    }
    for (let i = 0; i < storList.length; i++) {
      otpList.push(storList[i])
    }

    console.log("Requesting account list from device")
    messageBuilder.request({
      method: 'GET_ACCOUNT_LIST'
    }).then(({ result }) => {
      let tmpList = JSON.parse(result)
      while(otpList.length > 0) {
        otpList.pop();
      }

      for (let i = 0; i < tmpList.length; i++) {
        otpList.push(tmpList[i])
      }
      console.log("done recieving, otp Len: ", otpList.length)
      this.updateList()
    })
    .catch((res) => {})
  },


  updateList(){
    for (let i = 0; i < otpList.length; i++) {
      console.log(otpList[i].account)
    }
    scrollList.setProperty(hmUI.prop.UPDATE_DATA, {

      data_type_config: [
        {
          start: 0,
          end: otpList.length-1,
          type_id: 0
        }
      ],
      //Configuration the length of information
      data_type_config_count: 1,
      data_array: otpList,
      data_count: otpList.length,
      on_page: 0,
    })

  },

  onInit() {
  },

  build() {


    this.onMessage()
    this.getAccounts()

    if(otpList.length == 0){
      //add dummy
      otpList.push({account:"Add from Settings\nand restart App"})
    }

    function showCode(item, index, data_key) {
      console.log(index, data_key, typeof index, typeof data_key)
      push({
        url: 'page/gtr/home/code.page',
        params: JSON.stringify(otpList[index]),
        },)
    }


    scrollList = hmUI.createWidget(hmUI.widget.SCROLL_LIST, {
      x: 0,
      y: 0,
      h: DEVICE_HEIGHT,
      w: DEVICE_WIDTH,
      item_space: 20,
      snap_to_center: true,
      item_enable_horizon_drag: false,
      item_drag_max_distance: 0,
      item_config: [
        {
          type_id: 0,
          item_bg_color: 0x000000,
          item_bg_radius: 0,
          text_view: [
            { x: 0, y: 0, w: DEVICE_WIDTH, h: 80, key: 'account', color: 0xffffff, text_size: 36 },
            { x: 0, y: 0, w: DEVICE_WIDTH, h: 80, key: 'issuer', color: 0xffffff, text_size: 36 },
          ],
          text_view_count: 1,
          image_view_count: 0,
          item_height: 80
        }
      ],

      item_config_count: 1,
      data_array: otpList,
      data_count: otpList.length,
      item_click_func: (item, index, data_key) => {
        showCode(item, index, data_key)
      },
      item_focus_change_func: (list, index, focus) => {
      },
      data_type_config: [
        {
          start: 0,
          end: otpList.length-1,
          type_id: 0
        }
      ],
      data_type_config_count: 1,
    })

  },
  onReady() {console.log('ready')},

  onShow() {console.log('show')},

  onHide() {console.log('hide')},


  onDestroy() {
    console.log("writing data")
    localStorage.setItem('otpList', JSON.stringify(otpList))
    console.log('destroy')
  },

})