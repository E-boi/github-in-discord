const { Button } = require('powercord/components');
const { close: closeModal } = require('powercord/modal');
const { get } = require('powercord/http');
const { React } = require('powercord/webpack');
const { Modal } = require('powercord/components/modal');

module.exports = class githubModel extends React.PureComponent {
	constructor() {
		super();
		this.state = {};
	}

	componentDidMount() {
		const repo = get(`https://api.github.com/repos/${this.props.link[3]}/${this.props.link[4]}/contents`);
		if (this.props.getSetting('api-key')) repo.set('Authorization', `token ${this.props.getSetting('api-token')}`);
		repo.then(res => this.setState({ data: res }));

		const branches = get(`https://api.github.com/repos/${this.props.link[3]}/${this.props.link[4]}/branches`);
		if (this.props.getSetting('api-key')) branches.set('Authorization', `token ${this.props.getSetting('api-token')}`);
		branches.then(res => this.setState({ branches: res.body }));

		const defaultB = get(`https://api.github.com/repos/${this.props.link[3]}/${this.props.link[4]}`);
		if (this.props.getSetting('api-key')) defaultB.set('Authorization', `token ${this.props.getSetting('api-token')}`);
		defaultB.then(res => this.setState({ rootInfo: res.body, selectedBranch: res.body.default_branch }));
	}

	changeBranch(branch) {
		const repo = get(`https://api.github.com/repos/${this.props.link[3]}/${this.props.link[4]}/contents/?ref=${branch}`);
		if (this.props.getSetting('api-key')) repo.set('Authorization', `token ${this.props.getSetting('api-token')}`);
		repo.then(res => this.setState({ data: res, selectedBranch: branch }));
	}

	render() {
		console.log(this.state.rootInfo);
		return (
			<Modal className="githubModel">
				<Modal.Header>
					<p>{this.props.link[4]}</p>
					{this.state.branches && (
						<select className="Gbranches" value={this.state.selectedBranch} onChange={change => this.changeBranch(change.currentTarget.value)}>
							{this.state.branches.map(branch => (
								<option value={branch.name}>{branch.name}</option>
							))}
						</select>
					)}
				</Modal.Header>
				<Modal.Content>
					{this.state.data && (
						<div>
							{this.state.data.body.map(tree => (
								<p className={tree.type === 'dir' ? 'Gfolder' : 'Gfile'}>
									{tree.type === 'dir' ? (
										<img src="https://raw.githubusercontent.com/Pavui/Assets/main/svg-path.svg" height={16} width={16} />
									) : (
										<img src="https://raw.githubusercontent.com/Pavui/Assets/main/svg-path%20(1).svg" height={16} width={16} />
									)}
									<a onClick={() => require('electron').shell.openExternal(tree.html_url)}>
										{tree.name} {tree.type === 'dir' && '(FOLDER)'}
									</a>
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
					{this.state.rootInfo && (
						<div className="repo-info">
							<div className="owner-profile">
								<img height={32} width={32} src={this.state.rootInfo.owner.avatar_url} />
								<p>{this.state.rootInfo.owner.login}</p>
							</div>
							<div className="star-svg">
								<svg height={16} viewBox="0 0 16 16">
									<path
										fill-rule="evenodd"
										d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"
									></path>
								</svg>
								<p>{this.state.rootInfo.stargazers_count}</p>
							</div>
						</div>
					)}
				</Modal.Footer>
			</Modal>
		);
	}
};
