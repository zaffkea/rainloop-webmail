/* RainLoop Webmail (c) RainLoop Team | Licensed under CC BY-NC-SA 3.0 */

(function (module, require) {
	
	'use strict';

	var
		_ = require('_'),
		ko = require('ko'),
		window = require('window'),
		key = require('key'),

		Enums = require('Enums'),
		Utils = require('Utils'),
		LinkBuilder = require('LinkBuilder'),

		AppSettings = require('../Storages/AppSettings.js'),
		Data = require('../Storages/WebMailDataStorage.js'),
		Remote = require('../Storages/WebMailAjaxRemoteStorage.js'),

		PopupsKeyboardShortcutsHelpViewModel = require('../ViewModels/Popups/PopupsKeyboardShortcutsHelpViewModel.js'),
		PopupsAddAccountViewModel = require('../ViewModels/Popups/PopupsKeyboardShortcutsHelpViewModel.js'),

		kn = require('kn'),
		KnoinAbstractViewModel = require('KnoinAbstractViewModel')
	;

	/**
	 * @constructor
	 * @extends KnoinAbstractViewModel
	 */
	function AbstractSystemDropDownViewModel()
	{
		KnoinAbstractViewModel.call(this, 'Right', 'SystemDropDown');

		this.accounts = Data.accounts;
		this.accountEmail = Data.accountEmail;
		this.accountsLoading = Data.accountsLoading;

		this.accountMenuDropdownTrigger = ko.observable(false);

		this.capaAdditionalAccounts = AppSettings.capa(Enums.Capa.AdditionalAccounts);

		this.loading = ko.computed(function () {
			return this.accountsLoading();
		}, this);

		this.accountClick = _.bind(this.accountClick, this);
	}

	_.extend(AbstractSystemDropDownViewModel.prototype, KnoinAbstractViewModel.prototype);

	AbstractSystemDropDownViewModel.prototype.accountClick = function (oAccount, oEvent)
	{
		if (oAccount && oEvent && !Utils.isUnd(oEvent.which) && 1 === oEvent.which)
		{
			var self = this;
			this.accountsLoading(true);
			_.delay(function () {
				self.accountsLoading(false);
			}, 1000);
		}

		return true;
	};

	AbstractSystemDropDownViewModel.prototype.emailTitle = function ()
	{
		return Data.accountEmail();
	};

	AbstractSystemDropDownViewModel.prototype.settingsClick = function ()
	{
		kn.setHash(LinkBuilder.settings());
	};

	AbstractSystemDropDownViewModel.prototype.settingsHelp = function ()
	{
		kn.showScreenPopup(PopupsKeyboardShortcutsHelpViewModel);
	};

	AbstractSystemDropDownViewModel.prototype.addAccountClick = function ()
	{
		if (this.capaAdditionalAccounts)
		{
			kn.showScreenPopup(PopupsAddAccountViewModel);
		}
	};

	AbstractSystemDropDownViewModel.prototype.logoutClick = function ()
	{
		var App = require('../Apps/RainLoopApp.js');
		Remote.logout(function () {
			if (window.__rlah_clear)
			{
				window.__rlah_clear();
			}

			App.loginAndLogoutReload(true, AppSettings.settingsGet('ParentEmail') && 0 < AppSettings.settingsGet('ParentEmail').length);
		});
	};

	AbstractSystemDropDownViewModel.prototype.onBuild = function ()
	{
		var self = this;
		key('`', [Enums.KeyState.MessageList, Enums.KeyState.MessageView, Enums.KeyState.Settings], function () {
			if (self.viewModelVisibility())
			{
				self.accountMenuDropdownTrigger(true);
			}
		});

		// shortcuts help
		key('shift+/', [Enums.KeyState.MessageList, Enums.KeyState.MessageView, Enums.KeyState.Settings], function () {
			if (self.viewModelVisibility())
			{
				kn.showScreenPopup(PopupsKeyboardShortcutsHelpViewModel);
				return false;
			}
		});
	};

	module.exports = AbstractSystemDropDownViewModel;

}(module, require));