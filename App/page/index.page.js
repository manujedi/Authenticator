import * as hmUI from '@zos/ui'
import {push} from '@zos/router'
import {getDeviceInfo} from '@zos/device'

const {width: DEVICE_WIDTH, height: DEVICE_HEIGHT} = getDeviceInfo()

const {messageBuilder} = getApp()._options.globalData
let scrollList

let otpList = [
    {account: "Plex", issuer:"plex.tv/web", secret:"JBSWY3DPEHPK3PXP",algorithm:"SHA-1", digits:6 , period:30},
]


Page({

    onInit() {
    },

    build() {
        hmUI.setStatusBarVisible(false)

        function showCode(item, index, data_key) {
            push({
                url: 'page/code.page',
                params: JSON.stringify(otpList[index]),
            },)
        }

        scrollList = hmUI.createWidget(hmUI.widget.SCROLL_LIST, {
            x: 20,
            y: 0,
            h: DEVICE_HEIGHT,
            w: DEVICE_WIDTH-40,
            item_space: 20,
            snap_to_center: true,
            item_config: [
                {
                    type_id: 0,
                    item_bg_color: 0x303030,
                    item_bg_radius: 40,
                    text_view: [
                        {x: 20, y: 0, w: DEVICE_WIDTH-80, h: 60, key: 'account', color: 0xffffff, text_size: px(48)},
                        {x: 20, y: 60, w: DEVICE_WIDTH-80, h: 40, key: 'issuer', color: 0xffffff, text_size: px(24)},
                    ],
                    text_view_count: 2,
                    image_view_count: 0,
                    item_height: 100
                }
            ],

            item_config_count: 1,
            data_array: otpList,
            data_count: otpList.length,
            item_click_func: (item, index, data_key) => {
                showCode(item, index, data_key)
            },
        })

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
    },

})