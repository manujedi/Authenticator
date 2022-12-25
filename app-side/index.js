import {MessageBuilder} from '../shared/message-side'

const messageBuilder = new MessageBuilder()

function getSendList(){
    let accList = settings.settingsStorage.getItem('accountList')
    let sendList = JSON.parse(accList)

    for(let i = 0; i < sendList.length;i++){
        delete sendList[i]['uri']
    }
    return sendList
}


AppSideService({
    onInit() {
        messageBuilder.listen(() => {
        })

        settings.settingsStorage.addListener('change', async ({ key, newValue, oldValue }) => {
            if (key === 'accountList' && newValue) {
                messageBuilder.call("refresh")
            }
        })

        messageBuilder.on('request', (ctx) => {
            const payload = messageBuilder.buf2Json(ctx.request.payload)
            if (payload.method === 'GET_ACCOUNT_LIST') {
                ctx.response({
                    data: {result: JSON.stringify(getSendList())}
                })
            }
        })
    },

    onRun() {
    },
    onDestroy() {
    },
})