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
	}

	render() {
		return (
			<Modal className="githubModel">
				<Modal.Header>
					<p>{this.props.link[4]}</p>
				</Modal.Header>
				<Modal.Content>
					{this.state.branches && (
						<select>
							{this.state.branches.map(branch => (
								<option value={branch.name}>{branch.name}</option>
							))}
						</select>
					)}
					{this.state.data && (
						<div>
							{this.state.data.body.map(tree => (
								<p className="Gfiles">
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
				</Modal.Footer>
			</Modal>
		);
	}
};
