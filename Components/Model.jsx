const { Button } = require('powercord/components');
const { SelectInput } = require('powercord/components/settings');
const { close: closeModal } = require('powercord/modal');
const { get } = require('powercord/http');
const { React } = require('powercord/webpack');
const { Modal } = require('powercord/components/modal');
const { decrypt } = require('../crypto');
const {
	shell: { openExternal },
} = require('electron');

module.exports = class githubModel extends React.PureComponent {
	constructor() {
		super();
		this.state = {};
	}

	componentDidMount() {
		const state = {};
		const repo = get(`https://api.github.com/repos/${this.props.link[3]}/${this.props.link[4]}/contents`);
		if (this.props.getSetting('api-key')) repo.set('Authorization', `token ${decrypt(this.props.getSetting('api-key'))}`);
		repo.then(res => (state.rootDir = res.body));

		const branches = get(`https://api.github.com/repos/${this.props.link[3]}/${this.props.link[4]}/branches`);
		if (this.props.getSetting('api-key')) branches.set('Authorization', `token ${decrypt(this.props.getSetting('api-key'))}`);
		branches.then(res => (state.branches = res.body));

		const defaultB = get(`https://api.github.com/repos/${this.props.link[3]}/${this.props.link[4]}`);
		if (this.props.getSetting('api-key')) defaultB.set('Authorization', `token ${decrypt(this.props.getSetting('api-key'))}`);
		defaultB.then(res => {
			state.repoInfo = res.body;
			state.selectedBranch = res.body.default_branch;
			setTimeout(() => this.setState(state), 100); // only 1 rerender
		});
	}

	changeBranch(branch) {
		const repo = get(`https://api.github.com/repos/${this.props.link[3]}/${this.props.link[4]}/contents/?ref=${branch}`);
		if (this.props.getSetting('api-key')) repo.set('Authorization', `token ${decrypt(this.props.getSetting('api-key'))}`);
		repo.then(res => this.setState({ rootDir: res.body, selectedBranch: branch }));
	}

	viewFolder(folder) {
		console.log(folder);
		const repo = get(`https://api.github.com/repos/${this.props.link[3]}/${this.props.link[4]}/contents/${folder}?ref=${this.state.selectedBranch}`);
		if (this.props.getSetting('api-key')) repo.set('Authorization', `token ${decrypt(this.props.getSetting('api-key'))}`);
		repo.then(res => this.setState({ folder: res.body }));
	}

	goBack() {
		const dir = this.state.folder[0].path.split('/');
		if (dir.length === 2) return this.setState({ folder: null });
		this.viewFolder(this.state.folder[0].path.replace(`/${dir[dir.length - 2]}/${dir[dir.length - 1]}`, ''));
	}

	render() {
		return (
			<Modal className="githubModel">
				<Modal.Header>
					<p className="repo-name" onClick={() => openExternal(this.state.repoInfo?.html_url)}>
						{this.props.link[4]}
					</p>
					{this.state.repoInfo && (
						<div className="star-svg" onClick={() => openExternal(`${this.state.repoInfo.html_url}/stargazers`)}>
							<svg height={16} viewBox="0 0 16 16">
								<path
									fill-rule="evenodd"
									d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"
								></path>
							</svg>
							<p>{this.state.repoInfo.stargazers_count}</p>
						</div>
					)}
					{this.state.branches && (
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
					{this.state.folder ? (
						<div className="Gin-folder">
							<img src="https://raw.githubusercontent.com/Pavui/Assets/main/svg-path.svg" height={16} width={16} />
							<a onClick={() => this.goBack()}>...</a>
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
										? [
												<img src="https://raw.githubusercontent.com/Pavui/Assets/main/svg-path.svg" height={16} width={16} />,
												<a onClick={() => this.viewFolder(tree.path)}>{tree.name}</a>,
										  ]
										: [
												<img src="https://raw.githubusercontent.com/Pavui/Assets/main/svg-path%20(1).svg" height={16} width={16} />,
												<a onClick={() => openExternal(tree.html_url)}>{tree.name}</a>,
										  ]}
								</p>
							))}
						</div>
					) : (
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
										? [
												<img src="https://raw.githubusercontent.com/Pavui/Assets/main/svg-path.svg" height={16} width={16} />,
												<a onClick={() => this.viewFolder(tree.path)}>{tree.name}</a>,
										  ]
										: [
												<img src="https://raw.githubusercontent.com/Pavui/Assets/main/svg-path%20(1).svg" height={16} width={16} />,
												<a onClick={() => openExternal(tree.html_url)}>{tree.name}</a>,
										  ]}
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
								<svg viewBox=" 0 0 16 16" height={16}>
									<path
										fill-rule="evenodd"
										d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"
									></path>
								</svg>
								<p>{this.state.repoInfo.forks}</p>
							</div>
						</div>
					)}
				</Modal.Footer>
			</Modal>
		);
	}
};
