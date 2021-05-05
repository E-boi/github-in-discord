const { Plugin } = require('powercord/entities');
const { getModule, React } = require('powercord/webpack');
const { findInReactTree } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { open: openModal } = require('powercord/modal');
const Model = require('./Components/Model');

module.exports = class CoolMF extends Plugin {
	startPlugin() {
		this.loadStylesheet('style.scss');
		const Menu = getModule(['MenuGroup', 'MenuItem'], false);
		const MessageContextMenu = getModule(m => m.default?.displayName === 'MessageContextMenu', false);
		inject('Gmodel-context-menu', MessageContextMenu, 'default', (args, res) => {
			if (!args[0].message.content.includes('https://github.com/')) return res;
			const link = args[0].message.content
				.replace(/(?:\n|<|>)/g, ' ')
				.split(' ')
				.filter(f => f.match(/^https?:\/\/(www.)?github.com\/[\w-]+\/[\w-]+\/?/))[0]
				.split('/');
			if (link.length < 5) return res;
			if (!findInReactTree(res, c => c.props?.id == 'githubModule'))
				res.props.children.splice(
					4,
					0,
					React.createElement(
						Menu.MenuGroup,
						null,
						React.createElement(Menu.MenuItem, {
							action: () => openModal(() => React.createElement(Model, { link: link, getSetting: this.settings.get })),
							id: 'githubModule',
							label: 'Open Model',
						})
					)
				);
			console.log(res);
			return res;
		});
		MessageContextMenu.default.displayName = 'MessageContextMenu';
	}

	pluginWillUnload() {
		uninject('Gmodel-context-menu');
	}
};
