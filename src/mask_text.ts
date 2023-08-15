export interface MaskTextSettings {
	start: number,
	end: number,
	entireText: boolean,
	maskSymbol: string
}

export function maskText(text: string, settings: MaskTextSettings): string {
	const parts = text.split(/(?!\p{L})/gu)
		.filter(key => key.match(/\p{L}/gu))
		.map(key => key.trim());
	const map = settings.entireText ? replaceMapEntireText(parts, settings) : replaceMapPerWords(parts, settings);
	map.forEach(obj => {
		text = text.replaceAll(obj.key, obj.value)
	});
	return text
}

function maskTextInternally(text: string, settings: MaskTextSettings) {
	if (text.length - settings.start - settings.end <= 0) {
		return text
	}
	const startIndex = settings.start
	const endIndex = text.length - settings.end
	const startText = text.substring(0, startIndex)
	const mask = createMask(text.substring(startIndex, endIndex), settings.entireText, settings.maskSymbol)
	const endText = text.substring(endIndex)
	return startText + mask + endText
}

function createMask(selection: string, perWord: boolean, maskSymbol: string): string {
	const fromRegex = perWord ? /\p{L}/gu : /./g
	return selection.replace(fromRegex, maskSymbol);
}

function replaceMapPerWords(parts: string[], settings: MaskTextSettings) {
	return parts.map(key => {
			return {
				key: key,
				value: maskTextInternally(key, settings)
			}
		}
	)
}

function replaceMapEntireText(parts: string[], settings: MaskTextSettings) {
	const keyStart: { key: string; start: number; end: number }[] = []
	for (const [index, value] of parts.entries()) {
		const start = index > 0 ? keyStart[index - 1].end : 0
		keyStart.push({
			key: value,
			start: start,
			end: start + value.length
		})
	}
	const entire = maskTextInternally(parts.join(''), settings)
	return keyStart.map(item => {
			return {
				key: item.key,
				value: entire.substring(item.start, item.end)
			}
		}
	);
}
