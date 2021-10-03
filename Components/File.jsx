const { React, getModule } = require('powercord/webpack');
const parser = getModule(['parse', 'parseTopic'], false);
const classes = {
	markup: getModule(['markup'], false).markup,
	scrollbarGhostHairline: getModule(['scrollbarGhostHairline'], false).scrollbarGhostHairline,
};

module.exports = class githubModel extends React.PureComponent {
	render() {
		const { file, path } = this.props;
		return (
			<div className={classes.markup}>
				<div className='Gpath'>
					<p>{`/${path}`}</p>
				</div>
				{file.isImage && (
					<div className={`Gimg ${classes.scrollbarGhostHairline}`}>
						<img src={`data:${file.type};base64,${file.content}`} />
					</div>
				)}
				{!file.isImage && parser.defaultRules.codeBlock.react({ content: file.content, lang: file.type }, null, {})}
			</div>
		);
	}
};
