import {App, Command, Editor, Plugin, PluginSettingTab, Setting} from 'obsidian';
import {maskText} from "./mask_text"

interface MaskSettings {
	start: number
	end: number
	entireText: boolean
	maskSymbol: string
}

const DEFAULT_SETTINGS: MaskSettings = {
	start: 1,
	end: 1,
	entireText: false,
	maskSymbol: '*',
}

// noinspection JSUnusedGlobalSymbols
export default class MaskPlugin extends Plugin {
	settings: MaskSettings;

	async onload() {
		await this.loadSettings();

		const command: Command = {
			id: 'masker-command',
			name: 'Mask',
			icon: 'venetian-mask',
			editorCallback: (editor: Editor) => {
				const old = editor.getSelection();
				const masked = this.maskText(old);
				editor.replaceSelection(masked);
			}
		};
		this.addCommand(command);
		this.addCommandToSelectionContextMenu(command)

		this.addSettingTab(new SampleSettingTab(this.app, this));
	}


	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}


	private addCommandToSelectionContextMenu(command: Command) {
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor) => {
				const selection = editor.getSelection();
				if (!selection) {
					return
				}
				menu.addItem((item) => {
					item.setTitle(command.name)
						.setIcon(command.icon!)
						.onClick(() => {
							if (command.editorCallback) {
								command.editorCallback(editor, null!)
							}
						})
				});
			})
		);
	}

	maskText(text: string) {
		return maskText(text, {
			start: this.settings.start,
			end: this.settings.end,
			entireText: this.settings.entireText,
			maskSymbol: this.settings.maskSymbol
		});
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MaskPlugin;

	constructor(app: App, plugin: MaskPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Starting Character Offset')
			.setDesc('Specifies the number of characters from the beginning that will remain unmasked')
			.addText(cb => cb
				.setValue(this.plugin.settings.start.toString())
				.onChange(async (value) => {
					const val = Number(value)
					if (value.length == 0 || val == undefined || val < 0) {
						return
					}
					this.plugin.settings.start = val;
					await this.plugin.saveSettings();
				}))

		new Setting(containerEl)
			.setName('Ending Character Position')
			.setDesc('Specifies the number of characters from the end that will remain unmasked')
			.addText(cb => cb.setValue(this.plugin.settings.end.toString())
				.onChange(async (value) => {
					const val = Number(value)
					if (value.length == 0 || val == undefined || val < 0) {
						return
					}
					this.plugin.settings.end = val;
					await this.plugin.saveSettings();
				}))

		new Setting(containerEl)
			.setName('Masking Character')
			.setDesc('Specifies the character that will be used for masking')
			.addText(cb => cb
				.setValue(this.plugin.settings.maskSymbol)
				.onChange(async (value) => {
					if (value.length == 0) {
						return
					}
					this.plugin.settings.maskSymbol = value;
					await this.plugin.saveSettings();
				}))

		new Setting(containerEl)
			.setName('Apply Masking To The Entire Text.')
			.setDesc('Specifies if masking will be applied to entire text')
			.addToggle(cb => cb
				.setValue(this.plugin.settings.entireText)
				.onChange(async (value) => {
					this.plugin.settings.entireText = value;
					await this.plugin.saveSettings();
				}))

		new Setting(containerEl)
			.setName('See how the masking settings affect the text (Hello, World!)')
			.setDesc(this.plugin.maskText('Hello, World!'))
			.addButton(cb => {
				cb.setIcon('refresh-ccw')
					.onClick(async () => {
						this.display()
					})
			})
	}

}

