const { Button, Icon, Spinner } = require('powercord/components');
const { SelectInput } = require('powercord/components/settings');
const { close: closeModal } = require('powercord/modal');
const { get } = require('powercord/http');
const { React, getModule } = require('powercord/webpack');
const { Modal } = require('powercord/components/modal');
const { decrypt } = require('../crypto');
const parser = getModule(['parse', 'parseTopic'], false);
const {
	shell: { openExternal },
} = require('electron');

const imageTypes = ['png', 'jpg'];
const folderIcon = 'https://raw.githubusercontent.com/E-boi/assets/main/folder.svg';
const fileIcon = 'https://raw.githubusercontent.com/E-boi/assets/main/ghfile.svg';
const starIcon = 'https://raw.githubusercontent.com/E-boi/assets/main/star.svg';
const forkIcon = 'https://raw.githubusercontent.com/E-boi/assets/main/ghfork.svg';

module.exports = class githubModel extends React.PureComponent {
	constructor() {
		super();
		this.state = {};
	}

	finishRequest(state, url) {
		const branches = get(`${url}/branches`);
		if (this.props.getSetting('api-key')) branches.set('Authorization', `token ${decrypt(this.props.getSetting('api-key'))}`);
		branches.then(res => (state.branches = res.body));
		branches.catch(err => this.setState({ errMsg: err.message }));

		const repo = get(`${url}/contents`);
		if (this.props.getSetting('api-key')) repo.set('Authorization', `token ${decrypt(this.props.getSetting('api-key'))}`);
		repo.then(res => {
			state.rootDir = res.body;
			setTimeout(() => this.setState(state), 100); // only 1 rerender
		});
		repo.catch(err => this.setState({ errMsg: err.message }));
	}

	componentDidMount() {
		const state = {};
		const defaultB = get(`https://api.github.com/repos/${this.props.link[3]}/${this.props.link[4]}`);
		if (this.props.getSetting('api-key')) defaultB.set('Authorization', `token ${decrypt(this.props.getSetting('api-key'))}`);
		defaultB.then(res => {
			if (res.body.message?.includes('Moved')) {
				const newURL = get(res.body.url);
				if (this.props.getSetting('api-key')) newURL.set('Authorization', `token ${decrypt(this.props.getSetting('api-key'))}`);
				newURL.catch(err => this.setState({ errMsg: err.message }));
				return newURL.then(ress => {
					state.repoInfo = ress.body;
					state.selectedBranch = ress.body.default_branch;
					this.finishRequest(state, res.body.url);
				});
			}
			state.repoInfo = res.body;
			state.selectedBranch = res.body.default_branch;
			this.finishRequest(state, res.body.url);
		});
		defaultB.catch(err => this.setState({ errMsg: err.message }));
	}

	changeBranch(branch) {
		const repo = get(`${this.state.repoInfo.url}/contents/?ref=${branch}`);
		if (this.props.getSetting('api-key')) repo.set('Authorization', `token ${decrypt(this.props.getSetting('api-key'))}`);
		repo.then(res => this.setState({ rootDir: res.body, selectedBranch: branch, folder: null, file: null }));
		repo.catch(err => this.setState({ errMsg: err.message }));
	}

	viewFolder(folder, branch) {
		const repo = get(
			`${this.state.repoInfo?.url || `https://api.github.com/repos/${this.props.link[3]}/${this.props.link[4]}`}/contents/${folder.replace(
				/\/$/,
				''
			)}?ref=${branch || this.state.selectedBranch}`
		);
		if (this.props.getSetting('api-key')) repo.set('Authorization', `token ${decrypt(this.props.getSetting('api-key'))}`);
		repo.then(res => {
			if (this.props.file) this.props.file = null;
			this.setState({ folder: res.body });
		});
		repo.catch(err => this.setState({ errMsg: err.message }));
	}

	openFile(fileName, url) {
		if (url) {
			const file = get(`https://raw.githubusercontent.com/${this.props.link[3]}/${this.props.link[4]}/${url}`).then(res => {
				let content;
				const type = url.split('.');
				if (imageTypes.includes(type[type.length - 1])) content = new Buffer.from(res.body).toString('base64');
				else content = String(res.body);
				if (this.props.file) this.props.file = null;
				this.setState({ file: { path: url, content, type: type[type.length - 1], isImage: imageTypes.includes(type[type.length - 1]) } });
			});
			file.catch(err => {
				if (err.message.includes('400') || err.message.includes('404'))
					this.viewFolder(this.props.file?.replace('/', ' ').split(' ')[1], this.props.file?.replace('/', ' ').split(' ')[0]);
			});
			return;
		}
		const file = this.state[this.state.folder ? 'folder' : 'rootDir'].filter(m => m.name === fileName);
		const type = fileName.split('.');
		if (file.length === 0) return;
		get(file[0].download_url).then(res => {
			let content;
			if (imageTypes.includes(type[type.length - 1])) content = new Buffer.from(res.body).toString('base64');
			else content = String(res.body);
			this.setState({ file: { path: file[0].path, content, type: type[type.length - 1], isImage: imageTypes.includes(type[type.length - 1]) } });
		});
	}

	goBack() {
		const dir = this.state.folder[0].path.split('/');
		if (dir.length === 2) return this.setState({ folder: null });
		this.viewFolder(this.state.folder[0].path.replace(`/${dir[dir.length - 2]}/${dir[dir.length - 1]}`, ''));
	}

	render() {
		if (this.props.file) this.openFile(null, this.props.file);
		let path;
		if (this.state.folder && !this.state.file) {
			const dir = this.state.folder[0]?.path.split('/');
			path = this.state.folder[0].path.replace(`/${dir[dir.length - 1]}`, '');
		} else if (this.state.file) path = this.state.file.path;
		return (
			<Modal className={['githubModel', this.state.file ? `infile ${powercord.pluginManager.get('vpc-shiki')?.ready ? 'has-vpc' : ''}` : '']}>
				<Modal.Header>
					<p className="repo-name" onClick={() => openExternal(this.state.repoInfo?.html_url)}>
						{this.state.repoInfo ? this.state.repoInfo.name : this.props.link[4]}
					</p>
					{this.state.repoInfo && (
						<div className="star-svg" onClick={() => openExternal(`${this.state.repoInfo.html_url}/stargazers`)}>
							<img src={starIcon} />
							<p>{this.state.repoInfo.stargazers_count}</p>
						</div>
					)}
					{this.state.file && (
						<div className="back-outfile">
							<Icon name={'Arrow'} direction="LEFT" onClick={() => this.setState({ file: null })} />
						</div>
					)}
					{this.state.folder && this.state.repoInfo && !this.state.file && (
						<div className="back-outfile">
							<Icon name={'Arrow'} direction="LEFT" onClick={() => this.goBack()} />
						</div>
					)}
					{this.state.branches && !this.state.errMsg && (
						<SelectInput
							className="Gbranches"
							searchable={false}
							value={this.state.selectedBranch}
							onChange={change => this.changeBranch(change.value)}
							options={this.state.branches.map(branch => ({ label: branch.name, value: branch.name }))}
						/>
					)}
				</Modal.Header>
				<Modal.Content>
					{this.state.errMsg && (
						<div className="Gerror">
							<div className={getModule(['emptyStateImage', 'emptyStateSubtext'], false).emptyStateImage} />
							<p className={`Gerror-text ${getModule(['emptyStateImage', 'emptyStateSubtext'], false).emptyStateSubtext}`}>{this.state.errMsg}</p>
						</div>
					)}
					{!this.state.repoInfo && !this.state.folder && !this.state.file && !this.state.errMsg && (
						<p className="Gfetching">
							Getting repo
							<Spinner type="wanderingCubes" />
						</p>
					)}
					{this.state.file && !this.state.errMsg && (
						<div>
							<div className="Gpath">
								<p>{`/${path}`}</p>
							</div>
							{this.state.file.isImage && (
								<div className="Gimg scrollbarGhostHairline-1mSOM1">
									<img src={`data:${this.state.file.type};base64,${this.state.file.content}`} />
								</div>
							)}
							{!this.state.file.isImage &&
								parser.defaultRules.codeBlock.react({ content: this.state.file.content, lang: this.state.file.type }, null, {})}
						</div>
					)}
					{this.state.folder && !this.state.file && !this.state.errMsg && (
						<div className="Gin-folder">
							<div className="Gpath">
								<p>{`/${path}/`}</p>
							</div>
							{this.state.folder.map(tree => (
								<p
									className={[
										tree.type === 'dir' ? 'Gfolder' : 'Gfile',
										tree.type !== 'dir' ? tree.name.split('.')[tree.name.split('.').length - 1] : '',
										tree.type !== 'dir' ? (tree.name.includes('.') ? '' : 'blank') : '',
									]
										.join(' ')
										.trimEnd()}
								>
									{tree.type === 'dir'
										? [<img src={folderIcon} height={16} width={16} />, <a onClick={() => this.viewFolder(tree.path)}>{tree.name}</a>]
										: [<img src={fileIcon} height={16} width={16} />, <a onClick={() => this.openFile(tree.name)}>{tree.name}</a>]}
								</p>
							))}
						</div>
					)}
					{!this.state.folder && !this.state.file && this.state.rootDir && !this.state.errMsg && (
						<div className="Gout-folder">
							{this.state.rootDir?.map(tree => (
								<p
									className={[
										tree.type === 'dir' ? 'Gfolder' : 'Gfile',
										tree.type !== 'dir' ? tree.name.split('.')[tree.name.split('.').length - 1] : '',
										tree.type !== 'dir' ? (tree.name.includes('.') ? '' : 'blank') : '',
									]
										.join(' ')
										.trimEnd()}
								>
									{tree.type === 'dir'
										? [<img src={folderIcon} height={16} width={16} />, <a onClick={() => this.viewFolder(tree.path)}>{tree.name}</a>]
										: [<img src={fileIcon} height={16} width={16} />, <a onClick={() => this.openFile(tree.name)}>{tree.name}</a>]}
								</p>
							))}
						</div>
					)}
				</Modal.Content>
				<Modal.Footer>
					<Button
						style={{ paddingLeft: '5px', paddingRight: '10px' }}
						look={Button.Looks.LINK}
						color={Button.Colors.TRANSPARENT}
						onClick={closeModal}
					>
						Close
					</Button>
					{this.state.repoInfo && (
						<div className="repo-info">
							<div className="owner-profile" onClick={() => openExternal(this.state.repoInfo.owner.html_url)}>
								<img height={32} width={32} src={this.state.repoInfo.owner.avatar_url} />
								<p>{this.state.repoInfo.owner.login}</p>
							</div>
							<div className="fork-svg" onClick={() => openExternal(`${this.state.repoInfo.html_url}/network/members`)}>
								<img src={forkIcon} />
								<p>{this.state.repoInfo.forks}</p>
							</div>
						</div>
					)}
				</Modal.Footer>
			</Modal>
		);
	}
};
