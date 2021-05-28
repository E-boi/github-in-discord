const { Plugin } = require('powercord/entities');
const { getModule, React } = require('powercord/webpack');
const { findInReactTree } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { open: openModal } = require('powercord/modal');
const Model = require('./Components/Model');
const Settings = require('./Components/Settings');

module.exports = class CoolMF extends Plugin {
	startPlugin() {
		this.loadStylesheet('style.scss');

		powercord.api.settings.registerSettings(this.entityID, {
			category: this.entityID,
			label: 'Github in discord',
			render: Settings,
		});

		const Menu = getModule(['MenuGroup', 'MenuItem'], false);
		const MessageContextMenu = getModule(m => m.default?.displayName === 'MessageContextMenu', false);
		inject('Gmodel-context-menu', MessageContextMenu, 'default', (args, res) => {
			if (!args[0].message.content.includes('https://github.com/') && !args[0].message.content.includes('https://www.github.com/')) return res;
			const githubURL = args[0].message.content
				.replace('tree', 'blob')
				.replace(/(?:\n|<|>|\*|_|`)/g, ' ')
				.split(' ')
				.filter(f => f.match(/^https?:\/\/(www.)?github.com\/[\w-]+\/[\w-]+\/?/));
			if (githubURL[0].split('/').length < 5) return res;
			const link = args[0].target.href?.match(/^https?:\/\/(www.)?github.com\/[\w-]+\/[\w-]+\/?/)[0].split('/') || githubURL[0].split('/');
			const file =
				[args[0].target.href]?.filter(f => f.match(/^https?:\/\/(www.)?github.com\/[\w-]+\/[\w-]+\/?/))[0].split('blob/') ||
				githubURL[0].split('blob/');
			if (!findInReactTree(res, c => c.props?.id == 'githubModule'))
				res.props.children.splice(
					4,
					0,
					React.createElement(
						Menu.MenuGroup,
						null,
						React.createElement(Menu.MenuItem, {
							action: () => openModal(() => React.createElement(Model, { file: file ? file[1] : null, link, getSetting: this.settings.get })),
							id: 'githubModule',
							label: 'Open Repository',
						})
					)
				);
			return res;
		});
		MessageContextMenu.default.displayName = 'MessageContextMenu';
	}

	pluginWillUnload() {
		uninject('Gmodel-context-menu');
		powercord.api.settings.unregisterSettings(this.entityID);
	}
};
