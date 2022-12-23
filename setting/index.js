
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
		if(uri.startsWith('otpauth://totp/')){
			var obj = {uri : uri}
			uri = uri.replace('otpauth://totp/','')
			let [name,params] = uri.split('?')
			params = params.split('&')
	
			if(name.length > 0){
				obj['account'] = name
			}else{
				return null
			}
				
			params.forEach(element => {
				let key = element.slice(0,element.indexOf('='))
				let val = element.slice(element.indexOf('=')+1)
				console.log(key, " is ", val)
				obj[key] = val
			});


			//required data
			if(!('secret' in obj)){
				return null
			}

			if(!('issuer' in obj)){
				return null
			}
	
			//optional
			if(!('period' in obj)){
				obj['period'] = String(30)
			}
			if(!('algorithm' in obj)){
				obj['algorithm'] = 'SHA-1'
			}
			//TODO: MAP more Algorithms? SHA1 -> SHA-1, sha256 -> SHA-256
			if(obj['algorithm'] == "sha256" || obj['algorithm'] == "SHA256")
				obj['algorithm'] = "SHA-256"
			if(obj['algorithm'] == "sha1" || obj['algorithm'] == "SHA1")
				obj['algorithm'] = "SHA-1"


			if(!('digits' in obj)){
				obj['digits'] = String(6)
			}
	
			return obj
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
									flexDirection: 'row',
									justfyContent: 'center',
									alignItems: 'center',
								},
							},
							[
								TextInput({
									label: item.issuer,
									bold: true,
									value: item.uri,
									subStyle: {
										color: '#333',
										fontSize: '14px',
									},
									maxLength: 200,
									onChange: (val) => {
										if (val.length > 0 && val.length <= 200) {
											this.editAccountList(val, i)
										}
									},
								}),
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
				addButton,
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
			]
		)
	},
})
