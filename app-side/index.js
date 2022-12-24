import { MessageBuilder } from '../shared/message-side'

const messageBuilder = new MessageBuilder()


AppSideService({
  onInit() {
    messageBuilder.listen(() => {})

    messageBuilder.on('request', (ctx) => {
      const payload = messageBuilder.buf2Json(ctx.request.payload)
      let accList = settings.settingsStorage.getItem('accountList')

      if (payload.method === 'GET_ACCOUNT_LIST') {

        ctx.response({
          data: { result: accList}
        })
      }
    })
  },

  onRun() {},
  onDestroy() {},
})