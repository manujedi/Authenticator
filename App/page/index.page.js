import * as hmUI from '@zos/ui'
import {push} from '@zos/router'
import {getDeviceInfo} from '@zos/device'
import {localStorage} from '@zos/storage'

const {width: DEVICE_WIDTH, height: DEVICE_HEIGHT} = getDeviceInfo()

const {messageBuilder} = getApp()._options.globalData
let scrollList
let otpList = []
let dummylist = [
    {account: "Add an Account", issuer: "A \"otpauth://\" link"},
    {account: "in the Zepp App", issuer: "Profile -> My devices -> App settings"},
    {account: "and click HERE"},
]

Page({

    onMessage() {
        messageBuilder.on('call', ({payload: buf}) => {
            this.getAccounts()
        })
    },

    getAccounts() {

        console.log("Loading account list from storage")
        otpList = JSON.parse(localStorage.getItem('otpList', '[]'))

        console.log("Requesting account list from device")
        messageBuilder.request({
            method: 'GET_ACCOUNT_LIST'
        }).then(({result}) => {
            let tmpList = JSON.parse(result)

            if (tmpList.length > 0) {
                otpList = JSON.parse(JSON.stringify(tmpList))
            } else {
                otpList = JSON.parse(JSON.stringify(dummylist))
            }
            console.log("done recieving, otp Len: ", otpList.length)
            this.updateList()

        })
            .catch((res) => {
            })
    },

    updateList() {
        scrollList.setProperty(hmUI.prop.UPDATE_DATA, {
            data_array: otpList,
            data_count: otpList.length,
        })

    },

    onInit() {
    },

    build() {


        this.onMessage()
        this.getAccounts()

        if (otpList.length == 0)
            //hacky deepcopy
            otpList = JSON.parse(JSON.stringify(dummylist))

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
        console.log("writing data")
        localStorage.setItem('otpList', JSON.stringify(otpList))
        console.log('destroy')
    },

})