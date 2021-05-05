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
					onChange={val => updateSetting('api-key', encrypt(val))}
				>
					Personal token
				</TextInput>
				<p>
					<a
						onClick={() =>
							require('electron').shell.openExternal('https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token')
						}
					>
						Make a token (make sure the token has permission to read public repos)
					</a>
				</p>
			</div>
		);
	}
};
