const { React, getModule } = require('powercord/webpack');
const parser = getModule(['parse', 'parseTopic'], false);

const folderIcon = 'https://raw.githubusercontent.com/E-boi/assets/main/folder.svg';
const fileIcon = 'https://raw.githubusercontent.com/E-boi/assets/main/ghfile.svg';

module.exports = class githubModel extends React.PureComponent {
	render() {
		const { rootDir, onClick, path } = this.props;
		return (
			<div className={path ? 'Gin-folder' : 'Gout-folder'}>
				{path && (
					<div className='Gpath'>
						<p>{`/${path}/`}</p>
					</div>
				)}
				{rootDir?.map(tree => (
					<p
						className={
							tree.type === 'dir'
								? 'Gfolder'
								: `Gfile ${tree.name.split('.')[tree.name.split('.').length - 1]} ${tree.name.includes('.') ? '' : 'blank'}`
						}
					>
						{tree.type === 'dir'
							? [<img src={folderIcon} height={16} width={16} />, <a onClick={() => onClick(tree.path, 'folder')}>{tree.name}</a>]
							: [<img src={fileIcon} height={16} width={16} />, <a onClick={() => onClick(tree.name, 'file')}>{tree.name}</a>]}
					</p>
				))}
			</div>
		);
	}
};
