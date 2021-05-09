const { React } = require('powercord/webpack');
const { TextInput } = require('powercord/components/settings');
const { encrypt, decrypt } = require('../crypto');

module.exports = class Gsettings extends React.PureComponent {
	render() {
		const { getSetting, updateSetting } = this.props;
		return (
			<div>
				<TextInput
					defaultValue={getSetting('api-key') ? decrypt(getSetting('api-key')) : undefined}
					// mainly for the new people who give there tokens everything so script kiddies won't have the token easily.
					// a comparison I made "it's like a condom it can still rip but you still had protection!"
					onChange={val => {
						if (val === '') return updateSetting('api-key', undefined);
						updateSetting('api-key', encrypt(val));
					}}
				>
					Personal token
				</TextInput>
				<p>
					<a
						onClick={() =>
							require('electron').shell.openExternal('https://github.com/settings/tokens/new?description=GitHub%20in%20Discord&scopes=public_repo')
						}
					>
						Make a token (just scroll down and click generate token and copy and paste the token)
					</a>
				</p>
			</div>
		);
	}
};
