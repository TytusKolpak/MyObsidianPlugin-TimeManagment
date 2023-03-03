import { moment } from "obsidian";
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

const setting1HERE = "01.01.2123";
const setting2HERE = "#Time_left";
var input1: string = setting1HERE;
var input2: string = setting2HERE;

interface MyPluginSettings {
	myDateSetting: string;
	myTagSetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	myDateSetting: setting1HERE,
	myTagSetting: setting2HERE
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		console.log('Loading plugin: Time mangement.')
		await this.loadSettings();

		this.addCommand({
			id: 'CORE',
			name: 'Calculate time left to',
			hotkeys: [{ modifiers: ["Mod", "Shift"], key: "q" }],
			editorCallback: (editor: Editor, view: MarkdownView) => {

				var dueDate;
				if (editor.getSelection() == "") {
					dueDate = moment(input1, "DD.MM.YYYY");
				} else {
					const inputString = editor.getSelection();
					dueDate = moment(inputString, "DD.MM.YYYY");
				}

				const dateIsIn = dueDate.fromNow();

				//make customable tag
				var firstLine = editor.getLine(0);
				var tagLength = input2.length;
				if (firstLine.substring(0, tagLength) != input2) {
					editor.setLine(0, "\n" + editor.getLine(0))
				}

				var line = input2 + " " + dueDate.format("DD.MM.YYYY") + " is **" + dateIsIn + "**";
				editor.setLine(0, line)
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		console.log('Unloading plugin: Time management.')
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h1', { text: 'Settings for time calculations.' });

		new Setting(containerEl)
			.setName('Date')
			.setDesc('This field specifies the date to which plugin will count time.')
			.addText(text => text
				.setPlaceholder('DD.MM.YYYY')
				.setValue(this.plugin.settings.myDateSetting)
				.onChange(async (value) => {
					input1 = value;
					this.plugin.settings.myDateSetting = value;
					await this.plugin.saveSettings();
				}));



		new Setting(containerEl)
			.setName('Tag')
			.setDesc('This field specifies the tag which will identify the plugin generated info.')
			.addText(text => text
				.setPlaceholder('#Time_left')
				.setValue(this.plugin.settings.myTagSetting)
				.onChange(async (value) => {
					input2 = value;
					this.plugin.settings.myTagSetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
