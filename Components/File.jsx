const { React, getModule } = require('powercord/webpack');
const parser = getModule(['parse', 'parseTopic'], false);

module.exports = class githubModel extends React.PureComponent {
	render() {
		const { file, path } = this.props;
		return (
			<div>
				<div className='Gpath'>
					<p>{`/${path}`}</p>
				</div>
				{file.isImage && (
					<div className='Gimg scrollbarGhostHairline-1mSOM1'>
						<img src={`data:${file.type};base64,${file.content}`} />
					</div>
				)}
				{!file.isImage && parser.defaultRules.codeBlock.react({ content: file.content, lang: file.type }, null, {})}
			</div>
		);
	}
};
