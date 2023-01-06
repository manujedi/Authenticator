/*
{
    account
    secret
    issuer
	period
	algorithm
	digits
    uri
}
*/


AppSettingsPage({
    state: {
        accountList: [],
        props: {},
    },
    uriToObj(uri) {
        try {
            if (uri.startsWith('otpauth://totp/')) {
                let obj = {uri: uri}
                uri = uri.replace('otpauth://totp/', '')
                let [name, params] = uri.split('?')
                params = params.split('&')

                if (name.length > 0) {
                    //https://github.com/google/google-authenticator/wiki/Key-Uri-Format#label
                    //name = decodeURI(name) not available on Zepp?
                    //simple uri decode TODO: do better
                    name = name.replaceAll('%3A', ':')
                    name = name.replaceAll('%20', ' ')
                    name = name.replaceAll('%40', '@')
                    obj['account'] = name
                } else {
                    throw "no label"
                }

                params.forEach(element => {
                    let key = element.slice(0, element.indexOf('='))
                    let val = element.slice(element.indexOf('=') + 1)
                    obj[key] = val
                });


                //required data
                if (!('secret' in obj)) {
                    throw "no secret"
                }

                //optional
                if (!('issuer' in obj)) {
                    obj['issuer'] = 'NO ISSUER'
                } else {
                    obj['issuer'] = obj['issuer'].replaceAll('%3A', ':')
                    obj['issuer'] = obj['issuer'].replaceAll('%20', ' ')
                    obj['issuer'] = obj['issuer'].replaceAll('%40', '@')
                }
                if (!('period' in obj)) {
                    obj['period'] = String(30)
                }
                if (!('algorithm' in obj)) {
                    obj['algorithm'] = 'SHA-1'
                }
                if (!('digits' in obj)) {
                    obj['digits'] = String(6)
                }

                //Fix different Algo names
                if (obj['algorithm'] == "sha512" || obj['algorithm'] == "SHA512" || obj['algorithm'] == "sha-512")
                    obj['algorithm'] = "SHA-512"
                if (obj['algorithm'] == "sha256" || obj['algorithm'] == "SHA256" || obj['algorithm'] == "sha-256")
                    obj['algorithm'] = "SHA-256"
                if (obj['algorithm'] == "sha1" || obj['algorithm'] == "SHA1" || obj['algorithm'] == "sha-1")
                    obj['algorithm'] = "SHA-1"


                return obj
            }else{
                throw "link parsing error"
            }
        } catch (e) {
            //no idea how a toast should be written
            //this.showToast({text:"asd"})
        }
        return null
    },
    addAccountList(val) {
        var obj = this.uriToObj(val)
        if (obj) {
            this.state.accountList.push(obj)
            this.setItem()
        }
    },
    editAccountList(val, index) {
        var obj = this.uriToObj(val)
        this.state.accountList[index] = obj
        this.setItem()
    },
    deleteAccountList(index) {
        this.state.accountList = this.state.accountList.filter((_, ind) => {
            return ind !== index
        })
        this.setItem()
    },
    setItem() {
        const newStr = JSON.stringify(this.state.accountList)
        this.state.props.settingsStorage.setItem('accountList', newStr)
    },
    setState(props) {
        this.state.props = props

        if (props.settingsStorage.getItem('accountList')) {
            this.state.accountList = JSON.parse(
                props.settingsStorage.getItem('accountList')
            )
        } else {
            this.state.accountList = []
            console.log('Initilized')
        }
    },
    build(props) {
        this.setState(props)

        const contentItems = []

        const tutText = View(
            {
                style: {
                    fontSize: '24px',
                    borderRadius: '30px',
                    color: 'black',
                    textAlign: 'center',
                    padding: '10px 15px',
                    width: '100%',
                },
            },
            [
                Section({
                    title: '',
                    description: 'Add a TOTP URI in the format otpauth://totp/{Label}?secret={SECRET}&issuer={ISSUER}&algorithm={ALGO}&digits={DIGITS}&period={PERIOD}'
                }),
            ]
        )

        const warningText = View(
            {
                style: {
                    fontSize: '24px',
                    borderRadius: '30px',
                    color: 'red',
                    textAlign: 'center',
                    padding: '10px 15px',
                    width: '100%',
                },
            },
            [
                Section({title: '', description: 'NO DATA IS BACKED UP'}),
            ]
        )

        const addButton = View(
            {
                style: {
                    fontSize: '12px',
                    borderRadius: '30px',
                    background: '#409EFF',
                    color: 'white',
                    textAlign: 'center',
                    padding: '10px 15px',
                    width: '30%',
                },
            },
            [
                TextInput({
                    label: 'Add URI',
                    onChange: (val) => {
                        this.addAccountList(val)
                    },
                }),
            ]
        )


        this.state.accountList.forEach((item, i) => {
            contentItems.push(
                View(
                    {
                        style: {
                            borderBottom: '1px solid #eaeaea',
                            padding: '6px 0',
                            marginBottom: '6px',
                            display: 'flex',
                            flexDirection: 'row',
                        },
                    },
                    [
                        View(
                            {
                                style: {
                                    flex: 1,
                                    display: 'flex',
                                    justfyContent: 'center',
                                    alignItems: 'center',
                                },
                            },
                            [
                                View(
                                    {},
                                    [
                                        Section({
                                            description: 'Label: ' + item.account
                                        }),
                                        Section({
                                            description: 'Secret: ' + item.secret.slice(0, 5) + '...'
                                        }),
                                        Section({
                                            description: 'Issuer: ' + item.issuer
                                        }),
                                        Section({
                                            description: 'Period: ' + item.period + ' Algorithm: ' + item.algorithm + '  Digits: ' + item.digits
                                        }),
                                    ]
                                )
                            ]
                        ),
                        Button({
                            label: 'del',
                            style: {
                                fontSize: '12px',
                                borderRadius: '30px',
                                background: '#D85E33',
                                color: 'white',
                            },
                            onClick: () => {
                                this.deleteAccountList(i)
                            },
                        }),
                    ]
                )
            )
        })

        return View(
            {
                style: {
                    padding: '12px 20px',
                },
            },
            [
                tutText,
                warningText,
                contentItems.length > 0 &&
                View(
                    {
                        style: {
                            marginTop: '12px',
                            padding: '10px',
                            border: '1px solid #eaeaea',
                            borderRadius: '6px',
                            backgroundColor: 'white',
                        },
                    },
                    contentItems
                ),
                addButton,
            ]
        )
    },
})
