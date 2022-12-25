import {MessageBuilder} from '../shared/message-side'

const messageBuilder = new MessageBuilder()


AppSideService({
    onInit() {
        messageBuilder.listen(() => {
        })

        messageBuilder.on('request', (ctx) => {
            const payload = messageBuilder.buf2Json(ctx.request.payload)

            let accList = settings.settingsStorage.getItem('accountList')
            let sendList = JSON.parse(accList)

            for(let i = 0; i < sendList.length;i++){
                delete sendList[i]['uri']
            }

            if (payload.method === 'GET_ACCOUNT_LIST') {

                ctx.response({
                    data: {result: JSON.stringify(sendList)}
                })
            }
        })
    },

    onRun() {
    },
    onDestroy() {
    },
})